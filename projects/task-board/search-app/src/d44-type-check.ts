import { createTask } from './task-model.js';

const exampleTask = createTask({
    title: '复习 TypeScript 基础类型',
    tags: ['TypeScript', 'interface']
});

// 移除此注释后，typecheck 会报告 title 的类型不匹配。
// @ts-expect-error title must be a string
createTask({ title: 44, tags: [] });

console.log(exampleTask);
