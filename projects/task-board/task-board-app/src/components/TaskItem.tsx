import type { Task } from '../types/task'

export type TaskItemProps = {
  readonly task: Task
  readonly onToggle: (id: string) => void
  readonly onDelete: (id: string) => void
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
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
      <button
        className="task-delete"
        type="button"
        aria-label={'删除任务：' + task.title}
        onClick={() => onDelete(task.id)}
      >
        删除
      </button>
    </li>
  )
}
