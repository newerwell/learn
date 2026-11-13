(() => {
    const HISTORY_KEY = 'd42-github-search-history';
    const MAX_HISTORY = 8;
    const DEBOUNCE_MS = 450;
    const REQUEST_TIMEOUT_MS = 12_000;
    const API_URL = 'https://api.github.com/search/repositories';

    const form = document.querySelector('#search-form');
    const searchInput = document.querySelector('#search-input');
    const clearHistoryButton = document.querySelector('#clear-history');
    const historyList = document.querySelector('#history-list');
    const historyEmpty = document.querySelector('#history-empty');
    const historyNote = document.querySelector('#history-note');
    const statusPanel = document.querySelector('#status-panel');
    const resultList = document.querySelector('#result-list');
    const resultsSummary = document.querySelector('#results-summary');

    let searchHistory = loadHistory();
    let debounceTimer = null;
    let activeController = null;
    let latestQuery = '';

    function loadHistory() {
        try {
            const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
            if (!Array.isArray(parsed)) return [];
            return parsed
                .filter(item => typeof item === 'string' && item.trim())
                .map(item => item.trim().slice(0, 200))
                .slice(0, MAX_HISTORY);
        } catch {
            historyNote.textContent = '浏览器暂时无法读取本地历史记录。';
            return [];
        }
    }

    function saveHistory(query) {
        searchHistory = [query, ...searchHistory.filter(item => item.toLowerCase() !== query.toLowerCase())]
            .slice(0, MAX_HISTORY);

        try {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(searchHistory));
            historyNote.textContent = '';
        } catch {
            historyNote.textContent = '本次搜索可正常使用，但浏览器没有保存历史记录的权限。';
        }
        renderHistory();
    }

    function renderHistory() {
        historyList.replaceChildren();
        historyEmpty.hidden = searchHistory.length > 0;

        for (const query of searchHistory) {
            const item = document.createElement('li');
            const button = document.createElement('button');
            button.className = 'history-chip';
            button.type = 'button';
            button.dataset.query = query;
            button.textContent = query;
            item.append(button);
            historyList.append(item);
        }
    }

    function setState(state, message, options = {}) {
        statusPanel.dataset.state = state;
        statusPanel.replaceChildren();

        const mark = document.createElement('span');
        mark.className = 'status-mark';
        mark.setAttribute('aria-hidden', 'true');
        mark.textContent = state === 'loading' ? '' : state === 'error' ? '!' : state === 'empty' ? '∅' : '⌕';

        const text = document.createElement('p');
        text.textContent = message;
        statusPanel.append(mark, text);

        if (options.retry) {
            const retryButton = document.createElement('button');
            retryButton.className = 'retry-button';
            retryButton.type = 'button';
            retryButton.dataset.action = 'retry';
            retryButton.textContent = '重试';
            statusPanel.append(retryButton);
        }
    }

    function formatStars(count) {
        return new Intl.NumberFormat('zh-CN', { notation: 'compact', maximumFractionDigits: 1 }).format(count || 0);
    }

    function createRepositoryCard(repository) {
        const item = document.createElement('li');
        item.className = 'repo-card';

        const title = document.createElement('h3');
        title.style.margin = '0';
        const link = document.createElement('a');
        link.className = 'repo-link';
        link.textContent = repository.full_name || repository.name || '未命名仓库';

        try {
            const url = new URL(repository.html_url);
            if (url.protocol === 'https:' && url.hostname === 'github.com') {
                link.href = url.href;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
            }
        } catch {
            // API data without a valid GitHub URL is shown as plain text.
        }

        title.append(link);
        const description = document.createElement('p');
        description.className = 'repo-description';
        description.textContent = repository.description || '这个仓库还没有填写项目说明。';

        const metadata = document.createElement('p');
        metadata.className = 'repo-meta';
        const stars = document.createElement('span');
        stars.textContent = `★ ${formatStars(repository.stargazers_count)} stars`;
        const language = document.createElement('span');
        language.textContent = repository.language || '未标注语言';
        metadata.append(stars, language);

        item.append(title, description, metadata);
        return item;
    }

    function renderRepositories(repositories) {
        resultList.replaceChildren(...repositories.map(createRepositoryCard));
    }

    function getHttpErrorMessage(response, payload) {
        if (response.status === 403 || response.status === 429) {
            const resetAt = Number(response.headers.get('x-ratelimit-reset'));
            if (resetAt) {
                const resetTime = new Date(resetAt * 1000).toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
                return `GitHub 搜索暂时达到请求限额，约 ${resetTime} 后可再试。`;
            }
            return 'GitHub 暂时限制了搜索请求，请稍后再试。';
        }
        return payload.message || `请求失败（HTTP ${response.status}），请稍后重试。`;
    }

    async function searchRepositories(rawQuery) {
        const query = rawQuery.trim();
        if (!query) {
            latestQuery = '';
            resultList.replaceChildren();
            resultsSummary.textContent = '';
            setState('idle', '输入关键词，开始寻找有趣的开源项目。');
            return;
        }

        latestQuery = query;
        saveHistory(query);
        activeController?.abort();

        const controller = new AbortController();
        activeController = controller;
        let timedOut = false;
        const timeoutId = window.setTimeout(() => {
            timedOut = true;
            controller.abort();
        }, REQUEST_TIMEOUT_MS);

        resultList.replaceChildren();
        resultsSummary.textContent = '';
        setState('loading', `正在搜索“${query}”……`);

        try {
            const params = new URLSearchParams({ q: query, sort: 'stars', order: 'desc', per_page: '8' });
            const response = await fetch(`${API_URL}?${params}`, {
                headers: { Accept: 'application/vnd.github+json' },
                signal: controller.signal
            });
            const payload = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(getHttpErrorMessage(response, payload));
            }
            if (controller.signal.aborted || activeController !== controller) return;

            const repositories = Array.isArray(payload.items) ? payload.items : [];
            if (repositories.length === 0) {
                setState('empty', `没有找到“${query}”相关的仓库，试试其他关键词。`);
                return;
            }

            renderRepositories(repositories);
            const totalCount = Number.isFinite(payload.total_count) ? payload.total_count : repositories.length;
            resultsSummary.textContent = `约 ${new Intl.NumberFormat('zh-CN').format(totalCount)} 个结果 · 显示前 ${repositories.length} 个`;
            setState('success', '搜索完成，点击仓库名称可以查看项目。');
        } catch (error) {
            if (controller.signal.aborted && !timedOut) return;

            const message = timedOut
                ? '请求超时了，请检查网络后重试。'
                : error instanceof TypeError
                    ? '网络请求失败，请检查网络连接后重试。'
                    : error.message || '搜索失败，请稍后重试。';
            setState('error', message, { retry: true });
        } finally {
            window.clearTimeout(timeoutId);
            if (activeController === controller) activeController = null;
        }
    }

    form.addEventListener('submit', event => {
        event.preventDefault();
        window.clearTimeout(debounceTimer);
        searchRepositories(searchInput.value);
    });

    searchInput.addEventListener('input', () => {
        window.clearTimeout(debounceTimer);
        activeController?.abort();

        if (!searchInput.value.trim()) {
            searchRepositories('');
            return;
        }

        setState('idle', '继续输入，停下后会自动搜索。');
        debounceTimer = window.setTimeout(() => searchRepositories(searchInput.value), DEBOUNCE_MS);
    });

    historyList.addEventListener('click', event => {
        const button = event.target.closest('button[data-query]');
        if (!button || !historyList.contains(button)) return;
        window.clearTimeout(debounceTimer);
        searchInput.value = button.dataset.query;
        searchRepositories(button.dataset.query);
    });

    clearHistoryButton.addEventListener('click', () => {
        searchHistory = [];
        try {
            localStorage.removeItem(HISTORY_KEY);
            historyNote.textContent = '';
        } catch {
            historyNote.textContent = '浏览器没有清除本地历史记录的权限。';
        }
        renderHistory();
    });

    statusPanel.addEventListener('click', event => {
        if (event.target.closest('button[data-action="retry"]') && latestQuery) {
            searchRepositories(latestQuery);
        }
    });

    window.addEventListener('pagehide', () => {
        window.clearTimeout(debounceTimer);
        activeController?.abort();
    }, { once: true });

    renderHistory();
})();
