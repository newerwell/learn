// 实验 6：收窄（narrowing）——TS 会根据你的 if 分支把类型范围缩小。
// 这是你最常用的"让类型配合业务逻辑"的手段。

function format(v: string | number | Date): string {
  if (typeof v === 'string') return v.trim(); // 这里 v 是 string
  if (typeof v === 'number') return v.toFixed(2); // 这里 v 是 number
  return v.toISOString(); // 剩下的只能是 Date
}

// 自定义守卫：把"校验逻辑"变成可复用的类型收窄
type Success = { ok: true; data: string };
type Failure = { ok: false; error: string };
type Result = Success | Failure;

function isSuccess(r: Result): r is Success {
  return r.ok;
}

function render(r: Result): string {
  return isSuccess(r) ? r.data : r.error; // 三元里也会收窄
}

// in 收窄：按字段区分联合类型
type A = { kind: 'a'; a: number };
type B = { kind: 'b'; b: string };
function pick(x: A | B): number | string {
  return 'a' in x ? x.a : x.b;
}

// 判别联合（discriminated union）：最推荐的建模方式，kind 一比对就自动收窄
type Shape = { kind: 'circle'; r: number } | { kind: 'rect'; w: number; h: number };
function area(s: Shape): number {
  switch (s.kind) {
    case 'circle':
      return Math.PI * s.r ** 2;
    case 'rect':
      return s.w * s.h;
  }
}

console.log(format('  hi  '), format(1.239), format(new Date(0)));
console.log(render({ ok: true, data: 'good' }), render({ ok: false, error: 'bad' }));
console.log(pick({ kind: 'a', a: 1 }), pick({ kind: 'b', b: 'x' }));
console.log('面积 =', area({ kind: 'circle', r: 2 }), area({ kind: 'rect', w: 2, h: 3 }));
