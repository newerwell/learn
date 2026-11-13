export interface Task {
    id: string;
    title: string;
    done: boolean;
    dueAt?: string;
    tags: string[];
}

export interface TaskInput {
    title: string;
    dueAt?: string;
    tags: string[];
}

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
