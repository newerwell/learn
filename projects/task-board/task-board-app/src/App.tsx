import './App.css'

// App 是一个函数组件。调用它会得到 React 用来描述界面的 JSX。
// 本项目的 tsconfig.app.json 设置了 jsx: "react-jsx"，构建时会把 JSX 编译为 jsx() / jsxs() 调用。
function App() {
  return (
    <main className="lesson">
      <p className="eyebrow">D57 · React 起步</p>
      <h1>任务看板前端</h1>
      <p className="intro">
        今天先搭好 React + TypeScript 环境，认识 JSX 和组件函数。
      </p>

      <section className="concept" aria-labelledby="jsx-title">
        <h2 id="jsx-title">先记住两个概念</h2>
        <p>
          JSX 看起来像 HTML，但它是写在 JavaScript / TypeScript 里的语法，
          会在构建时变成 React 的函数调用。
        </p>
        <p>
          <code>App</code> 是一个组件函数；React 调用它，并把返回的界面描述渲染到页面。
        </p>
      </section>

      <p className="next-step">
        下一课 D58：用固定数组练习 JSX 表达式和列表渲染。
      </p>
    </main>
  )
}

export default App
