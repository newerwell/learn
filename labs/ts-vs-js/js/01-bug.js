// 实验 1（JS 侧）：纯 JS，没有任何类型，也没有任何检查。
// 运行：node js/01-bug.js
// 你会看到：代码能跑，但结果是错的 —— 因为 JS 只按"值的实际类型"运行，它不 care 你想表达什么。
//
// 这个文件和一个 TS 版本（broken/01-bug.ts）是同一段逻辑，
// 区别只在于：TS 版本在运行前就被编译器拦住了。

const items = [
  { title: '买菜', price: 12.5 },
  { title: '修电脑', price: '80' } // ← 手滑，写成了字符串
];

const total = items.reduce((sum, it) => sum + it.price, 0);
console.log('总价 =', total); // 12.5 + '80' → '12.580'，一个字符串
console.log('typeof total =', typeof total);
