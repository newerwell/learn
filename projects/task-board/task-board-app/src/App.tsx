import { useState, type FormEvent } from 'react'
import { Panel } from './components/Panel'
import { TaskList } from './components/TaskList'
import { Toolbar } from './components/Toolbar'
import type { Task } from './types/task'
import './App.css'

const initialTasks: Task[] = [
  { id: 't_1', title: '写周报', done: false },
  { id: 't_2', title: '买菜', done: true },
]

function App() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [title, setTitle] = useState('')
  const completedCount = tasks.filter((task) => task.done).length

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
      <p className="eyebrow">D60 · useState 与受控表单</p>
      <h1>我的任务</h1>
      <p className="intro">
        添加任务、切换完成状态或删除任务。输入框的值由 React state 控制。
      </p>

      <Panel title="今天的任务">
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

        <Toolbar total={tasks.length} completed={completedCount} />
        <TaskList tasks={tasks} onToggle={handleToggle} onDelete={handleDelete} />
        <p className="component-note">
          不直接改 tasks 或使用 push；以新数组和新对象更新，React 才能发现变化。
        </p>
      </Panel>

      <Panel title="为什么用函数式更新">
        <p>
          同一事件里连续两次 setCount(count + 1)，都读取当前渲染的 count，
          所以最终只加 1；连续两次 setCount((value) =&gt; value + 1)，会按顺序处理两次，
          最终加 2。任务更新也用前一个 state 计算新值。
        </p>
      </Panel>

      <p className="next-step">
        下一课 D61：学习 useEffect 的依赖和清理时机。
      </p>
    </main>
  )
}

export default App
