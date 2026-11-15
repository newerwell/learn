"use strict";
(() => {
    const HISTORY_KEY = 'd42-github-search-history';
    const MAX_HISTORY = 8;
    const DEBOUNCE_MS = 450;
    const REQUEST_TIMEOUT_MS = 12_000;
    const API_URL = 'https://api.github.com/search/repositories';
    function requireElement(selector, elementType) {
        const element = document.querySelector(selector);
        if (!(element instanceof elementType)) {
            throw new Error(`找不到页面元素：${selector}`);
        }
        return element;
    }
    const form = requireElement('#search-form', HTMLFormElement);
    const searchInput = requireElement('#search-input', HTMLInputElement);
    const clearHistoryButton = requireElement('#clear-history', HTMLButtonElement);
    const historyList = requireElement('#history-list', HTMLUListElement);
    const historyEmpty = requireElement('#history-empty', HTMLParagraphElement);
    const historyNote = requireElement('#history-note', HTMLParagraphElement);
    const statusPanel = requireElement('#status-panel', HTMLDivElement);
    const resultList = requireElement('#result-list', HTMLUListElement);
    const resultsSummary = requireElement('#results-summary', HTMLParagraphElement);
    let searchHistory = loadHistory();
    let debounceTimer = null;
    let activeController = null;
    let latestQuery = '';
    function isStringArray(value) {
        return Array.isArray(value) && value.every((item) => typeof item === 'string');
    }
    function loadHistory() {
        try {
            const parsed = JSON.parse(window.localStorage.getItem(HISTORY_KEY) ?? '[]');
            if (!isStringArray(parsed))
                return [];
            return parsed
                .map(item => item.trim().slice(0, 200))
                .filter(item => item.length > 0)
                .slice(0, MAX_HISTORY);
        }
        catch {
            historyNote.textContent = '浏览器暂时无法读取本地历史记录。';
            return [];
        }
    }
    function saveHistory(query) {
        searchHistory = [query, ...searchHistory.filter(item => item.toLowerCase() !== query.toLowerCase())]
            .slice(0, MAX_HISTORY);
        try {
            window.localStorage.setItem(HISTORY_KEY, JSON.stringify(searchHistory));
            historyNote.textContent = '';
        }
        catch {
            historyNote.textContent = '本次搜索可正常使用，但浏览器没有保存历史记录的权限。';
        }
        renderHistory();
    }
    function renderHistory() {
        const fragment = document.createDocumentFragment();
        historyEmpty.hidden = searchHistory.length > 0;
        for (const query of searchHistory) {
            const item = document.createElement('li');
            const button = document.createElement('button');
            button.className = 'history-chip';
            button.type = 'button';
            button.dataset.query = query;
            button.textContent = query;
            item.append(button);
            fragment.append(item);
        }
        historyList.replaceChildren(fragment);
    }
    function setState(state, message, options = {}) {
        const marks = {
            idle: '⌕',
            loading: '',
            success: '⌕',
            empty: '∅',
            error: '!'
        };
        statusPanel.dataset.state = state;
        statusPanel.replaceChildren();
        const mark = document.createElement('span');
        mark.className = 'status-mark';
        mark.setAttribute('aria-hidden', 'true');
        mark.textContent = marks[state];
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
        return new Intl.NumberFormat('zh-CN', { notation: 'compact', maximumFractionDigits: 1 }).format(count);
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
        }
        catch {
            // 无效链接会保留为纯文本。
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
    function isRecord(value) {
        return typeof value === 'object' && value !== null && !Array.isArray(value);
    }
    function isRepository(value) {
        return isRecord(value)
            && typeof value.full_name === 'string'
            && typeof value.name === 'string'
            && typeof value.html_url === 'string'
            && (typeof value.description === 'string' || value.description === null)
            && typeof value.stargazers_count === 'number'
            && (typeof value.language === 'string' || value.language === null);
    }
    function isSearchResponse(value) {
        return isRecord(value)
            && typeof value.total_count === 'number'
            && Array.isArray(value.items)
            && value.items.every(isRepository);
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
        if (isRecord(payload) && typeof payload.message === 'string') {
            return payload.message;
        }
        return `请求失败（HTTP ${response.status}），请稍后重试。`;
    }
    function renderRepositories(repositories) {
        resultList.replaceChildren(...repositories.map(createRepositoryCard));
    }
    async function searchRepositories(rawQuery) {
        const query = rawQuery.trim();
        if (!query) {
            latestQuery = '';
            activeController?.abort();
            activeController = null;
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
            const payload = await response.json().catch(() => null);
            if (!response.ok) {
                throw new Error(getHttpErrorMessage(response, payload));
            }
            if (controller.signal.aborted || activeController !== controller)
                return;
            if (!isSearchResponse(payload)) {
                throw new Error('GitHub 返回的数据格式无法识别，请重试。');
            }
            const repositories = payload.items;
            if (repositories.length === 0) {
                setState('empty', `没有找到“${query}”相关的仓库，试试其他关键词。`);
                return;
            }
            renderRepositories(repositories);
            resultsSummary.textContent = `约 ${new Intl.NumberFormat('zh-CN').format(payload.total_count)} 个结果 · 显示前 ${repositories.length} 个`;
            setState('success', '搜索完成，点击仓库名称可以查看项目。');
        }
        catch (error) {
            if (controller.signal.aborted && !timedOut)
                return;
            const message = timedOut
                ? '请求超时了，请检查网络后重试。'
                : error instanceof TypeError
                    ? '网络请求失败，请检查网络连接后重试。'
                    : error instanceof Error && error.message
                        ? error.message
                        : '搜索失败，请稍后重试。';
            setState('error', message, { retry: true });
        }
        finally {
            window.clearTimeout(timeoutId);
            if (activeController === controller)
                activeController = null;
        }
    }
    form.addEventListener('submit', event => {
        event.preventDefault();
        if (debounceTimer !== null)
            window.clearTimeout(debounceTimer);
        void searchRepositories(searchInput.value);
    });
    searchInput.addEventListener('input', () => {
        if (debounceTimer !== null)
            window.clearTimeout(debounceTimer);
        activeController?.abort();
        if (!searchInput.value.trim()) {
            void searchRepositories('');
            return;
        }
        setState('idle', '继续输入，停下后会自动搜索。');
        debounceTimer = window.setTimeout(() => {
            void searchRepositories(searchInput.value);
        }, DEBOUNCE_MS);
    });
    historyList.addEventListener('click', event => {
        if (!(event.target instanceof Element))
            return;
        const button = event.target.closest('button[data-query]');
        if (!(button instanceof HTMLButtonElement) || !historyList.contains(button))
            return;
        const query = button.dataset.query;
        if (!query)
            return;
        if (debounceTimer !== null)
            window.clearTimeout(debounceTimer);
        searchInput.value = query;
        void searchRepositories(query);
    });
    clearHistoryButton.addEventListener('click', () => {
        searchHistory = [];
        try {
            window.localStorage.removeItem(HISTORY_KEY);
            historyNote.textContent = '';
        }
        catch {
            historyNote.textContent = '浏览器没有清除本地历史记录的权限。';
        }
        renderHistory();
    });
    statusPanel.addEventListener('click', event => {
        if (!(event.target instanceof Element))
            return;
        if (event.target.closest('button[data-action="retry"]') && latestQuery) {
            void searchRepositories(latestQuery);
        }
    });
    window.addEventListener('pagehide', () => {
        if (debounceTimer !== null)
            window.clearTimeout(debounceTimer);
        activeController?.abort();
    }, { once: true });
    renderHistory();
})();
