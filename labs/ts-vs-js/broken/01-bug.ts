// 实验 1（TS 侧）：和 js/01-bug.js 是同一段逻辑，只是加了类型。
// 这个文件**故意**编译不过，用来观察报错长什么样：
//   pnpm run check:broken
//
// 注意：报错发生在"运行之前"，你甚至不需要启动程序。

type Item = { title: string; price: number };

const items: Item[] = [
  { title: '买菜', price: 12.5 },
  { title: '修电脑', price: '80' } // ❌ TS2322: string 不能赋给 number
];

// 就算上面那行没写错，这里也能兜住：acc 与 it.price 的类型都由数组元素类型推出
const total = items.reduce((sum: number, it: Item) => sum + it.price, 0);
console.log('总价 =', total);
