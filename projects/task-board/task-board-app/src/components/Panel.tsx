import type { ReactNode } from 'react'

export type PanelProps = {
  readonly title: string
  readonly children: ReactNode
}

export function Panel({ title, children }: PanelProps) {
  return (
    <section className="concept">
      <h2>{title}</h2>
      {children}
    </section>
  )
}
