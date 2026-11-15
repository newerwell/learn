# D49 · 阅读 `fs.d.ts` 函数签名

本练习读取本项目安装的 `@types/node@26.6.6` 声明文件：

`labs/ts-vs-js/node_modules/@types/node/fs.d.ts`

在文件中搜索 `function readFile(`。其中一个通用回调重载是：

```ts
function readFile(
    path: PathOrFileDescriptor,
    options: ReadFileOptions | BufferEncoding | null | undefined,
    callback: (err: NodeJS.ErrnoException | null, data: string | NonSharedBuffer) => void,
): void;
```

- `path` 接受文件路径或文件描述符。
- `options` 可提供编码或读取选项，也可以省略。
- `callback` 的第一个参数是可空错误，第二个参数是文本或 Buffer 数据；具体数据类型取决于选项。
- 函数返回 `void`，因为读取结果通过回调交付，而不是由函数同步返回。

`fs.d.ts` 中还有更窄的重载：指定字符串编码时，回调数据是 `string`；指定 Buffer 选项时，回调数据是 Buffer 类型。阅读声明时要连同相邻重载一起看，才能知道传不同选项后返回数据如何变化。

类型声明只供编译器检查，不会在运行时验证文件内容。读取 JSON 后仍要把结果当作不可信数据，并在使用前做运行时检查。
