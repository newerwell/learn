// 实验 3：TS 是"结构化类型"——看形状，不看名字。
// 这和 Java 的 nominal typing 相反：Java 里两个类字段一样也不能互相赋值。

interface Point {
  x: number;
  y: number;
}

// ❌ 直接写字面量时，TS 会做"多余属性检查"：这个下一行是会报错的
// const p2: Point = { x: 1, y: 2, z: 3 }; // TS2353: 'z' 不在 Point 里

// ✅ 但先存进变量再赋值就允许：只要形状满足 x、y 都齐活
const raw = { x: 1, y: 2, z: 3 };
const p2: Point = raw;
console.log('p2 =', p2, '← z 还在，只是类型层面看不见它');

// ❌ 少字段一定不行
// const p3: Point = { x: 1 }; // TS2741: 缺少 y

// 所以"名字不同但形状一样"的类型可以互相赋值
interface Vec2 {
  x: number;
  y: number;
}
const p1: Point = { x: 1, y: 2 };
const v: Vec2 = p1;
console.log('Point 直接当 Vec2 用 =', v);

// 结论：类型描述的是"结构契约"，不是"类名"。这也是为什么 TS 能直接给 JS 对象用。
