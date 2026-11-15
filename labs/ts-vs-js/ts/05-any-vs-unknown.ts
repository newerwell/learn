// 实验 5：any 会"关掉"检查并污染下游；unknown 要求你先证明类型再用。

// ---------- any：错误一路流过去 ----------
const anyValue: any = JSON.parse('{"name":"tom"}');
anyValue.name.toUpperCase(); // 编译通过
const escaped: number = anyValue.whatever; // 编译通过，运行时是 undefined，类型系统完全没管
// anyValue.whatever.deep.chain; // 这行也能编译通过，但运行时 TypeError（取消注释试试）

console.log('any 把错误放行了，escaped =', escaped, '，它的类型标注写着 number，实际是 undefined');

// ---------- unknown：必须收窄，否则不许用 ----------
const unknownValue: unknown = JSON.parse('{"name":"tom"}');
// unknownValue.name; // ❌ TS18046: 'unknownValue' 的类型是 unknown

if (typeof unknownValue === 'object' && unknownValue !== null && 'name' in unknownValue) {
  const name = (unknownValue as { name: string }).name;
  console.log('收窄后才能用 =', name.toUpperCase());
}

// ---------- 为什么处理外部数据必须用 unknown ----------
// 后端返回什么，TS 是不知道的。JSON.parse 的签名就是 any，所以你该自己写校验：
function isUser(v: unknown): v is { name: string } {
  return typeof v === 'object' && v !== null && typeof (v as { name?: unknown }).name === 'string';
}

function readUser(raw: string): string {
  const data: unknown = JSON.parse(raw);
  if (!isUser(data)) throw new Error('返回的数据不是 User');
  return data.name; // 这里 data 已经是 { name: string }
}

console.log('校验通过 =', readUser('{"name":"jerry"}'));
try {
  readUser('{"nope":1}');
} catch (err) {
  console.log('校验拦住 =', (err as Error).message);
}

// 结论：any 是"我不检查了"；unknown 是"我还没证明，先别用"。跨边界默认 unknown。
console.log('any 的值也活着，但它随时可能炸 =', anyValue.name);
