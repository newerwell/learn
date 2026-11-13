import { groupBy } from './group-by.js';
import { createTask, type Task } from './task-model.js';

const tasks: Task[] = [
    createTask({ title: '实现 groupBy', tags: ['TypeScript'] }),
    { ...createTask({ title: '复习泛型约束', tags: ['TypeScript'] }), done: true },
    createTask({ title: '检查类型推断', tags: ['TypeScript'] })
];

const tasksByDone = groupBy(tasks, 'done');
const firstCompletedTitle: string | undefined = tasksByDone.true?.[0]?.title;

// 移除此注释后，typecheck 会报告 priority 不是 Task 的字段。
// @ts-expect-error priority is not a key of Task
groupBy(tasks, 'priority');

console.log(firstCompletedTitle);
