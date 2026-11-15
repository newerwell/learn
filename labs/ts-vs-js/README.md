# TS 与 JS 的关系 · 实验台

> 你现在的状态：会照着写类型，但说不清 TS 到底在哪一层工作、为什么"编译过了还会崩"。
> 这个实验台不讲新语法，只讲**模型**——模型立起来，后面所有语法都会变得可解释。

## 一句话结论

**TS = JS + 一套只存在于编译期的类型标注。**

类型不是程序的一部分，它更像"写代码时贴在旁边的说明书"：`tsc` 照着说明书检查一遍，检查完把说明书**撕掉**，交给 Node/浏览器运行的还是纯 JS。

```
你写的 .ts
   │
   │  tsc（编译期）
   │   ① 读类型，检查有没有矛盾 → 不一致就报错，不生成产物
   │   ② 检查通过后，把类型全部擦除
   ▼
.js（运行时）
   │  Node / 浏览器只认这个
   │  它完全不知道"类型"存在过
   ▼
运行时错误 ← 类型系统管不到这里
```

由此可以推出三个"反直觉"但极其重要的事实：

1. **类型错误一定发生在运行之前**（`tsc` 那一步），所以你会在启动前就看见红字；
2. **运行时拿不到任何类型信息**（`typeof` 看不到 `interface`），所以类型不能用来做数据校验；
3. **绕过类型检查的方式永远存在**（`as any`、`JSON.parse`），所以"编译通过"不等于"运行时正确"。

## 运行方式

```powershell
cd labs\ts-vs-js
pnpm install          # 装 typescript 和 @types/node（只需一次）
pnpm run check        # ① 类型检查：能通过的 6 个实验
pnpm run check:broken # ② 故意写错的例子：看报错长什么样
pnpm run build        # ③ 编译，产物在 dist/
pnpm run demo:bug     # ④ 纯 JS 版本：能跑，但结果错
pnpm run demo:erased  # ⑤ 类型擦除：编译过了，运行时照样错
```

## 六个实验（按顺序做，每个都要"先猜再跑"）

### 实验 1 · 同一段逻辑，JS 跑得通、TS 跑不通

```powershell
node js/01-bug.js        # 输出：总价 = 12.580   ← 字符串拼接，不是数学
pnpm run check:broken    # 输出：TS2322 string 不能赋给 number
```

看两件事：
- JS 版本**没有任何报错**，但结果是错的（`12.5 + '80' = '12.580'`）
- TS 版本在你**运行之前的编译阶段**就拦住了

**结论**：TS 的价值不是"让程序跑得更快"，而是把"运行时才炸的 bug"提前到"编辑器里出现红字"。

### 实验 2 · 类型在运行时被擦除

```powershell
pnpm run build
node dist/02-erased.js
```
然后打开 `dist/02-erased.js` 和 `ts/02-erased.ts` 左右对照：

```ts
// 源码
function add(a: number, b: number): number { return a + b; }

// 编译产物
function add(a, b) { return a + b; }     // ← 类型全没了
```

再看输出：
```
add("1", 2) = 12      ← as any 绕过了检查，运行时 JS 只做字符串拼接
typeof add = function
add.length = 2        ← 参数个数是 JS 层面的，不是类型
Object.keys(add) = []
```

**结论**：`as any` 是"我让编译器闭嘴"，不是"我让程序正确"。运行时没有类型，就没有人替你检查。

### 实验 3 · 结构化类型：看形状，不看名字

```powershell
pnpm run demo:structural
```
- 直接写字面量时，多一个字段会报错（多余属性检查）
- 先存进变量再赋值，多出的字段就允许了（只要必需字段齐全）
- 名字不同但形状相同的两个 interface 可以互相赋值（`Point` → `Vec2`）

**结论**：TS 的类型是"结构契约"。这也是为什么它能直接描述 JS 的普通对象，而不像 Java 那样要求显式实现接口。

### 实验 4 · 推断 vs 注解：注解只写在边界上

```powershell
pnpm run demo:inference
```
- `let n = 1`、`[1, 2]`、`x = 1` 都能自己推断，不用手写
- 需要手写的是**边界**：函数参数、公共 API、复杂返回值
- `as const` 能让常量保留精确字面量，再反推出类型（`ROLES` → `'admin' | 'user'`）

**结论**：注解写多了是噪音，写少了（尤其参数）会变成隐式 `any`。判断标准：**这个信息编译器自己能不能算出来？** 能算就不写。

### 实验 5 · any 与 unknown：一个是关掉检查，一个是先证明

```powershell
pnpm run demo:unknown
```
- `any`：`.name.toUpperCase()` 编译通过；`const x: number = anyValue.whatever` 也通过，但 `x` 实际是 `undefined`
- `unknown`：不写校验就不能用，必须 `typeof` / `in` 收窄或写类型守卫
- 处理 `JSON.parse` / `fetch` / `localStorage` 的返回值，默认用 `unknown` 并自己校验

**结论**：`any` 是"我不检查了"，`unknown` 是"我还没证明，先别用"。跨边界（外部数据）永远选 `unknown`。

> 这条与你 search-app 里 `JSON.parse` 的处理直接相关：`JSON.parse` 的返回类型是 `any`，它把脏数据悄悄放进了你的类型世界。

### 实验 6 · 收窄：让类型跟着 if 走

```powershell
pnpm run demo:narrowing
```
- `typeof` / `in` / `switch(kind)` 都能收窄
- 自定义守卫 `function isSuccess(r: Result): r is Success` 把校验逻辑变成可复用的收窄
- **判别联合**（`{ kind: 'circle' } | { kind: 'rect' }`）是最推荐的建模方式，配合 `switch` 还能得到穷尽检查

**结论**：类型不是写死的，它会随着控制流缩小。你写 `if` 的同时也在"帮编译器排除可能性"。

## 五个常见误解

| 误解 | 事实 |
|---|---|
| "TS 会检查运行时数据" | 不会。运行时没有类型，`fetch` 返回什么它都收 |
| "编译通过 = 逻辑正确" | 编译只检查类型关系，不检查业务逻辑 |
| "interface 会生成代码" | 不会，纯编译期概念，产物里不存在 |
| "`as any` 是修复报错" | 是压制报错，错误还在，只是推迟到运行时 |
| "`any` 和 `unknown` 差不多" | `any` 放行一切；`unknown` 禁止使用，必须先收窄 |

## 和你 search-app 的对应

你的 `tsconfig.json` 里这几项，正好对应上面的事实：

| 配置 | 作用 | 对应实验 |
|---|---|---|
| `strict` | 打开 `noImplicitAny`、`strictNullChecks` 等一批检查 | 实验 1、4 |
| `noUncheckedIndexedAccess` | `arr[0]` 的类型是 `T \| undefined`，逼你判空 | 实验 6 |
| `skipLibCheck` | 跳过 `node_modules` 里 `.d.ts` 的检查（提速，不放松你自己的代码） | — |

而 `task-model.ts` 里的 `Omit` / `Pick` / `ReturnType`，本质都是"从已有类型推导出新类型"——它们全部在编译期完成，产物里一样什么都没有。

## 验收：能脱稿回答才算过关

1. TS 和 JS 是什么关系？为什么说"TS 是 JS 的超集"？
2. 类型在什么时候起作用、什么时候消失？
3. 为什么 `as any` 能编译通过，但运行时可能崩？
4. `any` 和 `unknown` 的本质区别？
5. 什么时候该写类型注解、什么时候不该写？
6. 为什么 `JSON.parse` 之后的数据不能直接当已校验的数据用？
7. 结构化类型和 Java 的接口实现有什么区别？
8. `interface` 编译后的产物是什么？
