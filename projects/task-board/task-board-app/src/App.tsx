import { useEffect, useState, type FormEvent } from 'react'
import { Panel } from './components/Panel'
import { TaskList } from './components/TaskList'
import { Toolbar } from './components/Toolbar'
import type { Task } from './types/task'
import './App.css'

const initialTasks: Task[] = [
  { id: 't_1', title: '写周报', done: false },
  { id: 't_2', title: '买菜', done: true },
]

function IntervalCounter() {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    console.info('[D61] interval 已启动')
    const intervalId = window.setInterval(() => {
      setSeconds((current) => current + 1)
      console.info('[D61] tick')
    }, 1000)

    return () => {
      window.clearInterval(intervalId)
      console.info('[D61] interval 已清理')
    }
  }, [])

  return (
    <p className="timer-readout" aria-live="polite">
      计时器已运行 <strong>{seconds}</strong> 秒
    </p>
  )
}

function App() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [title, setTitle] = useState('')
  const [query, setQuery] = useState('')
  const [showTimer, setShowTimer] = useState(true)
  const completedCount = tasks.filter((task) => task.done).length
  const normalizedQuery = query.trim().toLocaleLowerCase()
  const visibleTasks = tasks.filter((task) =>
    task.title.toLocaleLowerCase().includes(normalizedQuery),
  )

  useEffect(() => {
    console.info('[D61] useEffect([])：组件已挂载')
    return () => console.info('[D61] useEffect([])：组件已清理')
  }, [])

  useEffect(() => {
    const previousTitle = document.title
    document.title = query.trim()
      ? `搜索“${query.trim()}” · D61`
      : 'D61 · useEffect 的正确姿势'
    console.info(`[D61] useEffect([query])：query = "${query}"`)

    return () => {
      document.title = previousTitle
      console.info(`[D61] cleanup [query]："${query}"`)
    }
  }, [query])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: trimmedTitle,
      done: false,
    }
    setTasks((prev) => [newTask, ...prev])
    setTitle('')
  }

  function handleToggle(id: string) {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task,
      ),
    )
  }

  function handleDelete(id: string) {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  return (
    <main className="lesson">
      <p className="eyebrow">D61 · useEffect 的正确姿势</p>
      <h1>让 React 与外部世界同步</h1>
      <p className="intro">
        继续使用 D60 的任务看板，观察依赖变化、文档标题同步和定时器清理。
      </p>

      <Panel title="任务看板：派生数据直接计算">
        <form className="task-form" onSubmit={handleSubmit}>
          <label htmlFor="new-task-title">新增任务</label>
          <div className="task-form-row">
            <input
              id="new-task-title"
              value={title}
              onChange={(event) => setTitle(event.currentTarget.value)}
              placeholder="例如：完成 React 练习"
              required
            />
            <button type="submit" disabled={!title.trim()}>
              添加
            </button>
          </div>
        </form>

        <div className="task-form">
          <label htmlFor="task-query">搜索任务（query）</label>
          <input
            id="task-query"
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="输入标题关键字"
          />
        </div>

        <Toolbar total={tasks.length} completed={completedCount} />
        {visibleTasks.length === 0 && tasks.length > 0 ? (
          <p className="empty-state" role="status">
            没有匹配的任务，试试别的关键字。
          </p>
        ) : (
          <TaskList tasks={visibleTasks} onToggle={handleToggle} onDelete={handleDelete} />
        )}
        <p className="component-note">
          搜索结果在渲染时用 <code>filter</code> 直接计算，不需要再用 useEffect 保存一份重复 state。
        </p>
      </Panel>

      <Panel title="观察依赖变化">
        <p>
          输入 query 会让 <code>useEffect([query])</code> 同步浏览器标签标题并打印日志。
          依赖变化时，React 先运行旧清理函数，再运行新 effect。
        </p>
        <p className="effect-console-tip">
          按 F12 打开开发者工具并切到 Console，查找以 <code>[D61]</code> 开头的记录；这里只观察日志，不用粘贴代码。
          初次加载时 StrictMode 会多做一次 setup → cleanup → setup。
        </p>
      </Panel>

      <Panel title="定时器：卸载时清理">
        <p>
          定时器属于 React 之外的系统。隐藏计时器会卸载它并清除 interval；重新显示会启动一个新计时器。
        </p>
        <button
          className="effect-toggle"
          type="button"
          aria-expanded={showTimer}
          onClick={() => setShowTimer((visible) => !visible)}
        >
          {showTimer ? '隐藏计时器并触发清理' : '显示计时器并重新启动'}
        </button>
        {showTimer ? <IntervalCounter /> : <p className="timer-readout">计时器已停止。</p>}
      </Panel>

      <Panel title="这几种情况通常不需要 useEffect">
        <ul className="effect-list">
          <li>派生数据：像上面的搜索结果一样，在渲染时从现有 state 计算。</li>
          <li>响应用户动作：提交表单的新增逻辑直接写在 onSubmit 事件处理函数里。</li>
          <li>普通计算：完成数量由 tasks 计算，不必再用 effect 同步另一份 state。</li>
        </ul>
      </Panel>

      <p className="next-step">
        下一课 D62：手写数据获取，处理 loading、error、success 三态和请求取消。
      </p>
    </main>
  )
}

export default App
