declare module 'frappe-gantt' {
  export interface GanttOptions {
    on_click?: (task: any) => void
    on_date_change?: (task: any, start: Date, end: Date) => void
    on_progress_change?: (task: any, progress: number) => void
    on_view_change?: (mode: string) => void
    header_height?: number
    column_width?: number
    step?: number
    bar_height?: number
    bar_corner_radius?: number
    arrow_curve?: number
    padding?: number
    popup_trigger?: string
    custom_popup_html?: (task: any) => string
    language?: string
    view_modes?: string[]
  }

  export default class Gantt {
    constructor(wrapper: HTMLElement, tasks: any[], options?: GanttOptions)
    refresh(tasks: any[]): void
    change_view_mode(mode: 'Quarter Day' | 'Half Day' | 'Day' | 'Week' | 'Month'): void
  }
}

