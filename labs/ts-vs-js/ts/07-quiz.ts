// D49 · TypeScript 类型自测（10 题，可运行）
//
// 用法：
//   1. 每题先写下你的预测（注释里填空）
//   2. pnpm run build && node dist/07-quiz.js 看运行时结果
//   3. 类型相关的问题用编辑器 hover，或打开 D49-类型自测-答案.md 核对
//
// 注意：类型在运行时被擦除，所以"类型题"的答案不在输出里，而在 hover 里。
// 输出里能看到的是"类型约束住代码之后，运行时实际发生了什么"。

interface Task {
  id: string;
  title: string;
  done: boolean;
  dueAt?: string;
  tags: string[];
}

// ---------- Q1 字面量推断 ----------
let q1a = 'hi';
const q1b = 'hi';
// 预测：q1a 的类型是 ____，q1b 的类型是 ____
console.log('Q1 运行值 =', q1a, q1b);

// ---------- Q2 as const ----------
const q2 = ['admin', 'user'] as const;
// 预测：q2 的类型是 ____，q2[0] 的类型是 ____
// 试试取消下一行注释：q2.push('x') 会怎样？
console.log('Q2 运行值 =', q2);

// ---------- Q3 interface 重复声明 ----------
interface Q3 {
  a: number;
}
interface Q3 {
  b: string;
}
const q3: Q3 = { a: 1, b: 'x' };
// 预测：这个字面量能通过检查吗？____
console.log('Q3 运行值 =', q3);

// ---------- Q4 可选参数 ----------
function q4(a?: number): number {
  return a ?? 0;
}
// 预测：a 的类型是 ____；q4() 的返回值是 ____
console.log('Q4 运行值 =', q4(), q4(5));

// ---------- Q5 Omit ----------
type Q5 = Omit<Task, 'id' | 'done'>;
const q5: Q5 = { title: '写周报', tags: ['work'] };
// 预测：Q5 有哪些字段？____
console.log('Q5 运行值 =', q5);

// ---------- Q6 keyof + Record ----------
type Q6Keys = keyof Task;
const q6: Record<Q6Keys, string> = { id: '', title: '', done: '', dueAt: '', tags: '' };
interface Q6Dictionary {
  [key: string]: number;
  count: number;
}
const q6Dictionary: Q6Dictionary = { count: 1, 'task-1': 2 };
// @ts-expect-error 索引签名要求所有额外字段的值都是 number
const q6bad: Q6Dictionary = { count: 1, label: 'x' };
// 预测：Q6Keys 是什么联合？索引签名允许什么键和值？____
console.log('Q6 运行值 =', Object.keys(q6), q6Dictionary);

// ---------- Q7 typeof + 条件类型 ----------
const q7Value = { a: 1, b: 'x' };
type Q7 = typeof q7Value;
type Q7Label<T> = T extends string ? '文本' : '其他';
type Q7A = Q7Label<Q7['a']>;
type Q7B = Q7Label<Q7['b']>;
const q7: Q7 = { a: 2, b: 'y' };
const q7LabelChecks: [Q7A, Q7B] = ['其他', '文本'];
// 预测：typeof 在类型位置得到什么？Q7Label 如何根据输入类型选结果？____
console.log('Q7 运行值 =', q7, q7LabelChecks);

// ---------- Q8 unknown 收窄 ----------
function q8(v: unknown): string {
  if (typeof v === 'string') return v.toUpperCase();
  if (typeof v === 'number') return v.toFixed(2);
  return 'other';
}
// 预测：这三次调用分别返回什么？____
console.log('Q8 运行值 =', q8('a'), q8(1), q8(null));

// ---------- Q9 判别联合 ----------
type Q9 = { kind: 'a'; a: number } | { kind: 'b'; b: string };
function q9(x: Q9): number | string {
  return x.kind === 'a' ? x.a : x.b;
}
// 预测：如果我在 x.kind === 'a' 分支里写 x.b，会报错吗？____
console.log('Q9 运行值 =', q9({ kind: 'a', a: 1 }), q9({ kind: 'b', b: 's' }));

// ---------- Q10 结构化类型 ----------
interface Q10Shape {
  x: number;
}
const q10raw = { x: 1, y: 2 };
const q10: Q10Shape = q10raw;
// 预测：能通过吗？____（对比下一行被注释的写法）
//const q10bad: Q10Shape = { x: 1, y: 2 };
console.log('Q10 运行值 =', q10);

console.log('\n做完了？去对照 D49-类型自测-答案.md，重点看"为什么"而不只是"是什么"。');
