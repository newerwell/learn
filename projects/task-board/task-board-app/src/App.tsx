import { useEffect, useState } from 'react'
import { Panel } from './components/Panel'
import type { Task } from './types/task'
import './App.css'

const API_BASE_URL = 'http://127.0.0.1:3200'
const PAGE_SIZE = 10
const PAGE_NUMBERS = [1, 2, 3]

type TasksPage = {
  readonly items: Task[]
  readonly total: number
  readonly page: number
  readonly pageSize: number
}

type FetchState =
  | { readonly status: 'loading' }
  | { readonly status: 'error'; readonly message: string }
  | { readonly status: 'success'; readonly data: TasksPage }

type RequestScenario = 'tasks' | 'empty' | 'not-found' | 'server-error'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isTask(value: unknown): value is Task {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.done === 'boolean'
  )
}

function isTasksPage(value: unknown): value is TasksPage {
  return (
    isRecord(value) &&
    Array.isArray(value.items) &&
    value.items.every(isTask) &&
    typeof value.total === 'number' &&
    typeof value.page === 'number' &&
    typeof value.pageSize === 'number'
  )
}

function getApiMessage(value: unknown) {
  if (isRecord(value) && typeof value.message === 'string') {
    return value.message
  }
  return ''
}

function getRequestUrl(page: number, query: string, scenario: RequestScenario) {
  if (scenario === 'not-found') return `${API_BASE_URL}/api/not-found`
  if (scenario === 'server-error') return `${API_BASE_URL}/api/error?status=500`

  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(PAGE_SIZE),
  })
  const searchTerm = scenario === 'empty' ? '没有匹配的任务' : query.trim()
  if (searchTerm) params.set('q', searchTerm)
  return `${API_BASE_URL}/api/tasks?${params.toString()}`
}

function getErrorMessage(error: unknown) {
  if (error instanceof TypeError) {
    return '网络请求失败。请确认 mock API 已启动，或检查 DevTools 的 Network 是否处于 Offline。'
  }
  if (error instanceof Error) return error.message
  return '发生了未知错误。'
}

function App() {
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState('')
  const [scenario, setScenario] = useState<RequestScenario>('tasks')
  const [retryCount, setRetryCount] = useState(0)
  const [fetchState, setFetchState] = useState<FetchState>({ status: 'loading' })

  useEffect(() => {
    const controller = new AbortController()
    let requestFinished = false
    const url = getRequestUrl(page, query, scenario)

    console.info(`[D62] 请求第 ${page} 页：${url}`)

    async function loadTasks() {
      try {
        const response = await fetch(url, { signal: controller.signal })
        const body: unknown = await response.json().catch(() => null)

        if (!response.ok) {
          const apiMessage = getApiMessage(body)
          throw new Error(
            `HTTP ${response.status}${apiMessage ? `：${apiMessage}` : ''}`,
          )
        }

        if (!isTasksPage(body)) {
          throw new Error('API 返回的数据格式不符合任务分页结构。')
        }

        setFetchState({ status: 'success', data: body })
      } catch (error) {
        if (controller.signal.aborted) return
        setFetchState({ status: 'error', message: getErrorMessage(error) })
      } finally {
        requestFinished = true
      }
    }

    void loadTasks()

    return () => {
      if (!requestFinished) {
        controller.abort()
        console.info(`[D62] 已取消请求：page=${page}`)
      }
    }
  }, [page, query, scenario, retryCount])

  function updateQuery(value: string) {
    if (value === query) return
    setFetchState({ status: 'loading' })
    setPage(1)
    setQuery(value)
  }

  function updateScenario(value: RequestScenario) {
    setFetchState({ status: 'loading' })
    setPage(1)
    setScenario(value)
  }

  function updatePage(value: number) {
    setFetchState({ status: 'loading' })
    if (value === page) {
      setRetryCount((count) => count + 1)
      return
    }
    setPage(value)
  }

  function retryCurrentRequest() {
    setFetchState({ status: 'loading' })
    setRetryCount((count) => count + 1)
  }

  const queryDisabled = scenario !== 'tasks'

  return (
    <main className="lesson">
      <p className="eyebrow">D62 · 手写数据获取</p>
      <h1>加载、错误与取消</h1>
      <p className="intro">
        从本地 mock API 读取任务，处理 loading、empty、error、success 四种界面状态。
      </p>

      <Panel title="请求控制">
        <div className="request-controls">
          <label htmlFor="request-scenario">演示场景</label>
          <select
            id="request-scenario"
            value={scenario}
            onChange={(event) => updateScenario(event.currentTarget.value as RequestScenario)}
          >
            <option value="tasks">正常任务列表</option>
            <option value="empty">空列表</option>
            <option value="not-found">404：不存在的接口</option>
            <option value="server-error">500：服务器错误</option>
          </select>

          <label htmlFor="task-query">搜索关键词</label>
          <input
            id="task-query"
            value={query}
            onChange={(event) => updateQuery(event.currentTarget.value)}
            placeholder={queryDisabled ? '切换到正常列表后可搜索' : '输入任务标题'}
            disabled={queryDisabled}
          />

          <button
            className="request-button"
            type="button"
            onClick={retryCurrentRequest}
          >
            重新请求当前页
          </button>
        </div>

        <div className="page-switcher" aria-label="选择任务页码">
          <span>快速切换页码，观察旧请求取消：</span>
          {PAGE_NUMBERS.map((pageNumber) => (
            <button
              key={pageNumber}
              className="page-button"
              type="button"
              aria-pressed={page === pageNumber}
              onClick={() => updatePage(pageNumber)}
            >
              {pageNumber}
            </button>
          ))}
        </div>
      </Panel>

      <Panel title="任务 API 响应">
        {fetchState.status === 'loading' && (
          <p className="request-loading" role="status" aria-live="polite">
            <span className="loading-indicator" aria-hidden="true" />
            正在读取第 {page} 页……
          </p>
        )}

        {fetchState.status === 'error' && (
          <div className="request-error" role="alert">
            <strong>读取失败</strong>
            <p>{fetchState.message}</p>
            <button
              className="request-button"
              type="button"
              onClick={retryCurrentRequest}
            >
              重试
            </button>
          </div>
        )}

        {fetchState.status === 'success' && fetchState.data.items.length === 0 && (
          <p className="request-empty" role="status">
            没有符合条件的任务。空列表是成功响应，不是加载中或请求失败。
          </p>
        )}

        {fetchState.status === 'success' && fetchState.data.items.length > 0 && (
          <>
            <p className="request-summary" role="status">
              第 {fetchState.data.page} 页，每页 {fetchState.data.pageSize} 条；筛选后共{' '}
              {fetchState.data.total} 条。
            </p>
            <ul className="task-list">
              {fetchState.data.items.map((task) => (
                <li key={task.id}>
                  <span aria-hidden="true">{task.done ? '✅' : '⬜'}</span>
                  <span className={task.done ? 'task-title is-done' : 'task-title'}>
                    {task.title}
                  </span>
                  {task.done && <strong>已完成</strong>}
                </li>
              ))}
            </ul>
          </>
        )}
      </Panel>

      <Panel title="读懂请求流程">
        <ol className="request-notes">
          <li>effect 开始时设为 loading，再用 AbortController 发起请求。</li>
          <li>检查 response.ok；fetch 收到 404/500 时仍会得到 Response，不会自动进入 catch。</li>
          <li>正常响应校验分页数据后进入 success；空数组显示独立空态。</li>
          <li>网络断开时显示可重试错误；页码变化或组件卸载时 abort 旧请求。</li>
        </ol>
        <p className="effect-console-tip">
          开发环境 StrictMode 初次挂载会取消第一条请求并重新发起；这属于开发检查。打开 F12 → Network，快速点不同页可看到旧请求 Cancelled。
        </p>
      </Panel>

      <p className="next-step">
        下一课 D63：把 D58–D62 的内容整合成完整的本地状态 CRUD 任务应用。
      </p>
    </main>
  )
}

export default App
