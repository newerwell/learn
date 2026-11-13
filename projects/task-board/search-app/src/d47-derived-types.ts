import {
    createTask,
    toTaskListItem,
    type CreateTaskDto,
    type CreatedTask,
    type Task,
    type TaskField,
    type TaskIndex,
    type TaskListItem,
    type UpdateTaskDto
} from './task-model.js';

const createDto: CreateTaskDto = {
    title: '复习工具类型',
    tags: ['TypeScript']
};

const createdTask: CreatedTask = createTask(createDto);
const updateDto: UpdateTaskDto = { done: true };
const listItem: TaskListItem = toTaskListItem(createdTask);
const taskIndex: TaskIndex = { [createdTask.id]: createdTask };

const taskFieldLabels: Record<TaskField, string> = {
    id: '编号',
    title: '标题',
    done: '完成状态',
    dueAt: '截止时间',
    tags: '标签'
};

const taskWithOptionalTitle: Partial<Pick<Task, 'title'>> = updateDto;

console.log({ listItem, taskIndex, taskFieldLabels, taskWithOptionalTitle });
