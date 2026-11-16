export type ToolbarProps = {
  readonly total: number
  readonly completed: number
}

export function Toolbar({ total, completed }: ToolbarProps) {
  return (
    <div className="toolbar">
      <span>全部 {total} 项</span>
      <span>已完成 {completed} 项</span>
    </div>
  )
}
