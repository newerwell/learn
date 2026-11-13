export interface Task {
    id: string;
    title: string;
    done: boolean;
    dueAt?: string;
    tags: string[];
}

export type CreateTaskDto = Omit<Task, 'id' | 'done'>;
export type TaskInput = CreateTaskDto;
export type UpdateTaskDto = Partial<Omit<Task, 'id'>>;
export type TaskListItem = Pick<Task, 'id' | 'title' | 'done'>;
export type TaskField = keyof Task;
export type TaskIndex = Record<Task['id'], Task>;

let nextTaskId = 1;

export function createTask(input: TaskInput): Task {
    const task: Task = {
        id: `task-${nextTaskId++}`,
        title: input.title.trim(),
        done: false,
        tags: [...input.tags]
    };

    if (input.dueAt !== undefined) {
        task.dueAt = input.dueAt;
    }

    return task;
}

export type CreatedTask = ReturnType<typeof createTask>;

export function toTaskListItem(task: Task): TaskListItem {
    return {
        id: task.id,
        title: task.title,
        done: task.done
    };
}
