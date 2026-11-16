import { TaskItem } from './TaskItem'
import type { Task } from '../types/task'

export type TaskListProps = {
  readonly tasks: readonly Task[]
  readonly onToggle: (id: string) => void
  readonly onDelete: (id: string) => void
}

export function TaskList({ tasks, onToggle, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return <p className="empty-state">今天没有任务。</p>
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  )
}
