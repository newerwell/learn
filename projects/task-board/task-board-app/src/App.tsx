import './App.css'

type Task = {
  id: string
  title: string
  done: boolean
}

const tasks: Task[] = [
  { id: 't_1', title: '写周报', done: false },
  { id: 't_2', title: '买菜', done: true },
]

function App() {
  const completedCount = tasks.filter((task) => task.done).length

  return (
    <main className="lesson">
      <p className="eyebrow">D58 · JSX 与列表渲染</p>
      <h1>我的任务</h1>
      <p className="intro">
        用固定数组练习 JSX 表达式、列表渲染和条件渲染。
      </p>

      <section className="concept" aria-labelledby="tasks-title">
        <h2 id="tasks-title">今天的任务</h2>
        <p>
          共 {tasks.length} 项，已完成 {completedCount} 项。
        </p>

        {tasks.length > 0 ? (
          <ul className="task-list">
            {tasks.map((task) => (
              <li key={task.id}>
                <span aria-hidden="true">{task.done ? '✅' : '⬜'}</span>
                <span>{task.title}</span>
                {task.done && <strong>已完成</strong>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-state">今天没有任务。</p>
        )}
        <p>
          <code>map</code> 把数组逐项变成列表；条件表达式决定显示列表还是空状态。
          每项使用稳定的任务 ID 作为 <code>key</code>，列表顺序改变时不要用数组下标代替。
        </p>
      </section>

      <p className="next-step">
        下一课 D59：把任务行拆成带类型的 TaskList 和 TaskItem 组件。
      </p>
    </main>
  )
}

export default App
