// 实验 2：类型在运行时"被擦掉"。
//
// 步骤：
//   pnpm run build
//   node dist/02-erased.js
// 然后打开 dist/02-erased.js 和这个源文件对比 —— 注解、interface、type 全部消失。

// 1) 编译后这一行会变成 function add(a, b) { return a + b }，参数类型没了
function add(a: number, b: number): number {
  return a + b;
}

// 2) 用 as any 强行绕过检查：tsc 闭嘴，但运行时 JS 不会替你检查
const sneaky = add('1' as any, 2);
console.log('add("1", 2) =', sneaky, '← 期望 3，实际是字符串 "12"');

// 3) 运行时能看到的只有 JS 层面的东西，没有任何类型信息
console.log('typeof add =', typeof add);
console.log('add.length =', add.length, '← 参数个数，这是 JS 的，不是类型');
console.log('Object.keys(add) =', Object.keys(add));

// 4) type / interface 编译后彻底消失，运行时根本不存在"类型"这个值
type User = { name: string };
const u: User = { name: 'tom' };
console.log('运行时 u 只是普通对象 =', u);
