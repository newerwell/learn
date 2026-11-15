# JS ↔ TS 语法对照卡

> 用法：写代码时忘了怎么写，来这张表里查；**不要背**，用三次就记住了。
> 每个"TS 写法"都可以在 `labs/ts-vs-js/ts/` 里找到能跑的例子。

## 一、日常 80% 会用到

| 想表达 | 平时写的 JS | TS 写法 | 记忆点 |
|---|---|---|---|
| 变量类型 | `let n = 1` | `let n: number = 1` | 多数情况**不用写**，靠推断 |
| 函数参数 | `function f(a, b)` | `function f(a: number, b: string)` | 参数**必须写**，否则隐式 any |
| 返回值 | `function f(a) {…}` | `function f(a: number): string {…}` | 能推断出来时可省 |
| 可选参数 | `function f(a)` | `function f(a?: string)` | `?` 等价于 `string \| undefined` |
| 默认参数 | `function f(a) {…}` | `function f(a = 'x')` | 有默认值时类型自动推出 |
| 对象形状 | `const u = {…}` | `type User = { name: string }` | 形状用 `type` 或 `interface` |
| 可选属性 | — | `{ name?: string }` | 读出来可能是 `undefined` |
| 只读属性 | — | `{ readonly id: string }` | 编译期禁止赋值 |
| 联合类型 | 口头约定 | `let v: string \| number` | 用之前先收窄 |
| 字面量联合 | 不断 if 判断 | `type S = 'idle' \| 'loading' \| 'error'` | UI 状态首选 |
| 数组 | `[1, 2]` | `number[]` 或 `Array<number>` | 泛型写法更灵活 |
| 元组 | — | `[string, number]` | 固定长度、位置有类型 |
| 函数类型 | — | `type Fn = (x: number) => string` | 回调参数常这么标 |
| 泛型函数 | — | `function f<T>(x: T): T` | 类型由调用处决定 |
| `interface` vs `type` | — | 两者都能描述对象 | 需要合并/扩展用 interface，需要联合/条件用 type |
| 类型导入 | `import { Task }` | `import type { Task }` | 只导入类型，编译后消失 |
| 断言 | — | `x as string` | 慎用：是"我保证"，不是检查 |
| 非空断言 | — | `x!.y` | 更慎：`!` 会关掉 null 检查 |
| 键值映射 | `{}` | `Record<string, Task>` | 等价于 `{ [k: string]: Task }` |
| 取键名联合 | — | `keyof Task` | 得到 `'id' \| 'title' \| …` |
| 派生类型 | 手抄一份 | `Partial<T>` `Pick<T,K>` `Omit<T,K>` `ReturnType<F>` | 改源头，派生的自动变 |

> `?.` 可选链、`??` 空值合并、`??=` 是 **JS 语法**（ES2020+），不是 TS 特性——TS 只是知道它们的结果类型。

## 二、什么时候必须写注解

1. **函数参数**（不写就是隐式 `any`，`strict` 下直接报错）
2. **导出的公共 API**（给别人/给未来的自己看契约）
3. **推断不出来的时候**：`useState([])`、`useState({})`、`JSON.parse` 的结果
4. **想表达联合/字面量**时（`'idle' | 'loading'`）
5. **复杂返回值**（多层嵌套，写出来比读者自己猜更省事）

反过来，**这些不要写**：`let n: number = 1`、`const s: string = 'a'`、`[1,2]` 还要标 `number[]`、回调参数（上下文已经推出来了）。

## 三、报错对照表（看到这几个先别慌）

| 错误码 | 含义 | 常见修法 |
|---|---|---|
| **TS2322** | 类型不能赋值（`string` → `number`） | 改值，或改类型，别用 `as` 糊 |
| **TS2345** | 参数类型不匹配 | 检查传参，或扩展函数签名 |
| **TS18046** | `unknown` 不能直接使用 | 先 `typeof` / 守卫收窄 |
| **TS2532** | 对象可能是 `undefined` | 加判空或 `?.` |
| **TS7006** | 参数隐式 `any` | 补注解 |
| **TS2741** | 缺少必需属性 | 补齐字段，或把字段改成可选 |
| **TS2339** | 属性不存在于该类型 | 检查拼写，或扩展类型 |
| **TS7031** | 解构出的变量隐式 `any` | 给解构的源加类型 |

## 四、三条记忆锚（记不住别的，就记这三条）

1. **类型是编译期的说明书，运行前就被撕掉** → 所以编译通过 ≠ 运行正确。
2. **注解写在边界（参数/导出），内部靠推断** → 写得越少越好，但不能不写边界。
3. **外部数据一律 `unknown`，收窄之后再用** → `JSON.parse`、`fetch`、`localStorage` 都是外部数据。

## 五、自测（每题 30 秒，答不出来的回去看对应实验）

1. `const s = 'hi'` 的类型是 `string` 还是 `'hi'`？加 `as const` 之后呢？
2. `type A = { x: number }` 和 `interface B { x: number }` 能互相赋值吗？
3. `function f(a?: number)` 里 `a` 的类型是什么？
4. 为什么 `Pick<Task, 'id'>` 不需要你写 `{ id: string }`？
5. `JSON.parse(text)` 的返回类型是什么？为什么这是危险的？
6. 编译产物里能找到 `interface Task` 吗？
