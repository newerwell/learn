// 实验 4：推断（inference）vs 注解（annotation）。
//
// 规则：能推断出来的就别手写；只在"边界"（函数参数、公共 API、复杂的返回值）写注解。

let n = 1; // 推断 number
const s = 'hi'; // 推断 'hi'（字面量类型，不是 string）
const arr = [1, 2]; // 推断 number[]

function double(x = 1) {
  return x * 2; // 参数和返回值都能推断（x: number，返回 number）
}

// 边界处必须写：不写就是隐式 any（strict 下直接报错）
function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}

// as const 让常量保留精确字面量，再从值反推出类型
const ROLES = ['admin', 'user'] as const;
type Role = (typeof ROLES)[number]; // 'admin' | 'user'
const r: Role = 'admin';

// 常用推断技巧：从函数反推返回值类型（你在 task-model.ts 里用过 ReturnType）
const makeUser = () => ({ name: 'tom', age: 18 });
type MadeUser = ReturnType<typeof makeUser>; // { name: string; age: number }

console.log({ n, s, arr, ROLES, r, sum: sum([1, 2, 3]), doubled: double(2) });
console.log('推断出来的类型在运行时依然看不见，它们只帮你在写代码时不出错');
