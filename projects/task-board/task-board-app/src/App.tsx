import { useState, type FormEvent } from 'react'
import { Panel } from './components/Panel'
import { TaskList } from './components/TaskList'
import { Toolbar } from './components/Toolbar'
import type { Task } from './types/task'
import './App.css'

const initialTasks: Task[] = [
  { id: 't_1', title: '复习 React state', done: false },
  { id: 't_2', title: '完成 D63 周复盘', done: true },
]

type TaskFilter = 'all' | 'active' | 'completed'

const filters: { value: TaskFilter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'active', label: '未完成' },
  { value: 'completed', label: '已完成' },
]

function App() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [title, setTitle] = useState('')
  const [filter, setFilter] = useState<TaskFilter>('all')

  const completedCount = tasks.filter((task) => task.done).length
  const completionRate =
    tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100)
  const visibleTasks = tasks.filter((task) => {
    if (filter === 'active') return !task.done
    if (filter === 'completed') return task.done
    return true
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: trimmedTitle,
      done: false,
    }
    setTasks((previousTasks) => [newTask, ...previousTasks])
    setTitle('')
    setFilter('all')
  }

  function handleToggle(id: string) {
    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task,
      ),
    )
  }

  function handleDelete(id: string) {
    setTasks((previousTasks) =>
      previousTasks.filter((task) => task.id !== id),
    )
  }

  return (
    <main className="lesson">
      <p className="eyebrow">D63 · 周复盘</p>
      <h1>本地状态版任务看板</h1>
      <p className="intro">
        新增、勾选、删除和筛选任务。刷新页面会恢复示例数据；本练习不请求 API。
      </p>

      <Panel title="今天的任务">
        <form className="task-form" onSubmit={handleSubmit}>
          <label htmlFor="new-task-title">新增任务</label>
          <div className="task-form-row">
            <input
              id="new-task-title"
              value={title}
              onChange={(event) => setTitle(event.currentTarget.value)}
              placeholder="例如：整理本周学习笔记"
              required
            />
            <button type="submit" disabled={!title.trim()}>
              添加
            </button>
          </div>
        </form>

        <Toolbar total={tasks.length} completed={completedCount} />

        <div className="completion-summary">
          <span>完成率</span>
          <strong>{completionRate}%</strong>
        </div>
        <div
          className="completion-track"
          role="progressbar"
          aria-label="任务完成率"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={completionRate}
          aria-valuetext={`${completedCount} / ${tasks.length} 项已完成`}
        >
          <span style={{ width: `${completionRate}%` }} />
        </div>

        <p className="component-note">
          完成数和完成率都是从 tasks 计算出来的，不另外保存一份 state。
        </p>
      </Panel>

      <Panel title="按状态筛选">
        <div className="filter-bar" role="group" aria-label="任务状态筛选">
          {filters.map((option) => (
            <button
              key={option.value}
              className="filter-button"
              type="button"
              aria-pressed={filter === option.value}
              onClick={() => setFilter(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        {tasks.length === 0 ? (
          <p className="empty-state" role="status">
            任务列表为空，先新增一条任务。
          </p>
        ) : visibleTasks.length === 0 ? (
          <p className="empty-state" role="status">
            这个状态下没有任务。
          </p>
        ) : (
          <TaskList
            tasks={visibleTasks}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        )}
      </Panel>

      <Panel title="把数据流讲清楚">
        <ol className="reflection-prompts">
          <li>表单提交事件把新任务交给 App。</li>
          <li>App 用函数式 state 更新生成新数组。</li>
          <li>TaskList 和 Toolbar 从 props 读取任务及统计。</li>
          <li>筛选结果和完成率在渲染时从 tasks 计算。</li>
          <li>TaskItem 通过回调请求 App 勾选或删除任务。</li>
        </ol>
        <p className="component-note">
          复盘时写五行：哪个组件最难拆、它负责什么、state 放在哪里、组件如何传递数据与事件、下次会怎样改进。
        </p>
      </Panel>

      <p className="next-step">
        下一课 D64：用 React Router 给任务列表和详情页添加路由。
      </p>
    </main>
  )
}

export default App
