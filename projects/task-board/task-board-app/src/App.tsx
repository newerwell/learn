import { Panel } from './components/Panel'
import { TaskList } from './components/TaskList'
import { Toolbar } from './components/Toolbar'
import type { Task } from './types/task'
import './App.css'

const tasks: Task[] = [
  { id: 't_1', title: '写周报', done: false },
  { id: 't_2', title: '买菜', done: true },
]

const completedCount = tasks.filter((task) => task.done).length

function handleToggleRequest(taskId: string) {
  console.info('收到任务切换请求：', taskId)
}

function App() {
  return (
    <main className="lesson">
      <p className="eyebrow">D59 · Props 与组件拆分</p>
      <h1>组件各做一件事</h1>
      <p className="intro">
        App 负责组合；工具栏、任务列表、任务行和面板分别负责自己的界面。
      </p>

      <Panel title="今天的任务">
        <Toolbar total={tasks.length} completed={completedCount} />
        <TaskList tasks={tasks} onToggle={handleToggleRequest} />
        <p className="component-note">
          点击任务图标会调用父组件传入的回调；状态更新将在 D60 加入。
        </p>
      </Panel>

      <p className="next-step">
        下一课 D60：把任务状态放在共同父组件中，用 useState 更新。
      </p>
    </main>
  )
}

export default App
