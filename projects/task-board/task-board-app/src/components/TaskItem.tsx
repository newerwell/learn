import type { Task } from '../types/task'

export type TaskItemProps = {
  readonly task: Task
  readonly onToggle: (id: string) => void
}

export function TaskItem({ task, onToggle }: TaskItemProps) {
  const buttonLabel = task.done ? '标记为未完成' : '标记为已完成'

  return (
    <li>
      <button
        className="task-toggle"
        type="button"
        aria-label={buttonLabel}
        aria-pressed={task.done}
        onClick={() => onToggle(task.id)}
      >
        {task.done ? '✅' : '⬜'}
      </button>
      <span className={task.done ? 'task-title is-done' : 'task-title'}>
        {task.title}
      </span>
      {task.done && <strong>已完成</strong>}
    </li>
  )
}
