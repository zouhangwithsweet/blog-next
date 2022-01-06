---
title: '为 vue3.0 写一个乞丐版 babel-transform-jsx-plugin'
date: 2020-01-28 12:23:53
tags: [vue,babel,typescript]
published: true
hideInList: false
feature: http://5b0988e595225.cdn.sohucs.com/images/20181116/a677a422791a413290810061f9d1682a.jpeg
isTop: false
---
> 2019年底，you大的 **vue3.0** 正式 release 了一个 alpha 版本。全新的 api，更强大的速度和 typescript 的支持，让人充满期待；同时，它结合了 hooks 的一系列优点，使其生态更容易从 React 等别的框架进行迁移。作为 React 和 Vue 双重粉丝，鼓掌就完事了！本文受[使用Vue 3.0做JSX(TSX)风格的组件开发](https://zhuanlan.zhihu.com/p/102668383)启发，由于原作大神并没有给出 demo ，所以只能自己尝试复制大神的思路，先写一个极其简陋的 babel-plugin 来实现 tsx + Vue。

## 搭建 vue3 + Typescript 项目工程

首先我们先把[vue-next-webpack-preview](https://github.com/vuejs/vue-next-webpack-preview)先 clone 到本地，把它改造成一个 typescript 的工程。
-  把 `main.js` 改为 `main.ts`，这一步仅需要改一个文件后缀名即可。
-  新建 `tsconfig.json`，最基本的配置即可，如下
    ![](http://blog.zouhaha.site/post-images/1580183420234.png)
- 改造一下 `webpack.config.js`，主要添加对 `typescript` 的处理，如下：
```js
{
    test: /\.ts|\.tsx$/,
    exclude: /node_modules/,
    use: [
        'babel-loader',
        {
            loader: 'ts-loader',
            options: {
                appendTsxSuffixTo: [/\.vue$/],
                transpileOnly: true
            }
        }
    ]
}
// 剩余部分，我们把 index.html 移动到 public 里边，使其像 vuecli4 工程 🐶 
plugins: [
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css'
    }),
    new HtmlWebpackPlugin({
      title: 'vue-next-test',
      template: path.join(__dirname, '/public/index.html')
    })
],
devServer: {
    historyApiFallback: true,
    inline: true,
    hot: true,
    stats: 'minimal',
    contentBase: path.join(__dirname, 'public'),
    overlay: true
}
```
- 为 `Vue` 单文件写一个声明文件 `src/globals.d.ts`，如下：
```js
declare module '*.vue' {
    import { Component } from 'vue'
    const component: Component
    export default component
}
```
- 安装相关需要的依赖，顺便说一句 `typescript@3.7.2` 以上，支持 `option chain`，好用，点赞！
```bash
npm i @babel/core @babel/preset-env babel-loader ts-loader -D
npm i typescript -S
```

经过改进后工程的目录结构大致如下
```md
|-- .gitignore
|-- package.json
|-- babel.config.js
|-- tsconfig.json
|-- webpack.config.js
|-- plulic
    |-- index.html
|-- src
    |-- main.ts
    |-- logo.png
    |-- App.vue
    |-- globals.d.ts
```
这个时候，项目应该还是能正常启动的，如果无法启动请自己解决>_<

## 编写 `render` 函数形式的组件

总所周知，`jsx/tsx` 是一个语法糖，在 `React` 和 `Vue` 里会被转为 `createElement/h`，这也是`babel-transform-jsx` 工作的重点部分。为了更好地知道`jsx` 被转码后的样子，我们先用 `Vue` 的 `h` 函数手写一下他本来的样子。

`Vue3` 中的 `h` 函数和之前的不太一样，请务必参考阅读[render-RFC](https://github.com/vuejs/rfcs/blob/render-fn-api-change/active-rfcs/0008-render-function-api-change.md)和[composition-api-RFC](https://github.com/vuejs/composition-api-rfc/blob/master/api.md#setup)，主要变动是更扁平化了，对 `babel` 来说更好处理了。

先写一个简单的 `input.vue`，如下
```javascript vue Vue
<script lang="tsx">
import { defineComponent, h, computed } from 'vue'

interface InputProps {
  value: string,
  onChange?: (value: string) => void,
}

const Input =  defineComponent({
  setup(props: InputProps, { emit }) {
    const handleChange = (e: KeyboardEvent) => {
      emit('update:value', (e.target as any)!.value)
    }

    const id = computed(() => props.value + 1)

    return () => h('input', {
      class: ['test'],
      style: { 
        display: 'block',
      },
      id: id.value,
      onInput: handleChange,
      value: props.value,
    })
  },
})

export default Input
</script>
```

显然直接写 `h` 函数式可行、可靠的。但是就是麻烦，所以才需要 `jsx`，一是便于理解，二是提高开发效率。但既然是乞丐版，我们的插件就只做两件事：
* **自动注入 `h` 函数**
* **把 `jsx` 转换为 `h`函数**

## 开发 `babel` 插件前的知识准备

在开始编写之前，请补习一下 `babel` 的相关知识，笔者主要参考如下：
- [Babel 插件手册](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/plugin-handbook.md)
- [从零开始编写一个babel插件](https://juejin.im/post/5a17d51851882531b15b2dfc)

代码参考如下：
- [plugin-transform-react-jsx](https://github.com/babel/babel/tree/master/packages/babel-plugin-transform-react-jsx)
- [babel-plugin-transform-vue-jsx](https://github.com/vuejs/babel-plugin-transform-vue-jsx)
- [在线 `AST parser`](https://astexplorer.net/) 

可参考上述代码及教程开始你的 `babel` 之旅。

## 编写 `babel` 插件

开始之前，我们先观察一下 `AST`。

![](http://blog.zouhaha.site/post-images/1580268984201.png)

分析这个组件：
- 首先一个代码块是一个大的 `Program` 节点，我们通过 `path` 这个对象能拿到节点的所有属性。对这个简单组件，我们先要引入 `h` 函数。就是把现在的 ` import { defineComponent } from 'vue' ` 转换为 ` import { h, defineComponent } from 'vue' `，所以我们可以修改 `Program.body` 的第一个 `ImportDeclaration` 节点，达到一个自动注入的效果。
- 对于 `jsx` 的部分，节点如下图：
![](http://blog.zouhaha.site/post-images/1580269800049.png)
我们处理 `JSXElement` 节点即可，整体都是比较清晰的，把 `JSXElement` 节点替换为 `callExpression` 节点即可。知道结构了，让我们开始吧。

### 自动注入 `h` 函数

简单来看，就是在代码顶部插入一个节点即可：
```javascript
import { h } from 'vue'
```
所以，处理 `Program` 节点即可，需要判断是否代码已经引入了 `Vue`，同时判断，是否已经引入了 `h`函数。代码参考如下：
```javascript
// t 就是 babel.types
Program: {
    exit(path, state) {
        // 判断是否引入了 Vue
        const hasImportedVue = (path) => {
          return path.node.body.filter(p => p.type === 'ImportDeclaration').some(p => p.source.value == 'vue')
        }

        // 注入 h 函数
        if (path.node.start === 0) {
            // 这里简单的判断了起始位置，不是很严谨
          if (!hasImportedVue(path)) {
              // 如果没有 import  vue , 直接插入一个 importDeclaration 类型的节点
            path.node.body.unshift(
              t.importDeclaration(
                // 插入 importDeclaration 节点后，插入 ImportSpecifier 节点，命名为 h
                [t.ImportSpecifier(t.identifier('h'), t.identifier('h'))],
                t.stringLiteral('vue')
              )
            )
          } else {
              // 如果已经 import vue，找到这个节点，判断它是否引入了 h
            const vueSource = path.node.body
              .filter(p => p.type === 'ImportDeclaration')
              .find(p => p.source.value == 'vue')
            const key = vueSource.specifiers.map(s => s.imported.name)
            if (key.includes('h')) {
                // 如果引入了，就不管了
            } else {
                // 没有引入就直接插入 ImportSpecifier 节点，引入 h
              vueSource.specifiers.unshift(t.ImportSpecifier(t.identifier('h'), t.identifier('h')))
            }
          }
        }
    }
}
```

### 转换 `jsx`

`babel` 转换 `jsx` 需要对 `JSXElement` 类型的节点，进行替换；把 `JSXElement` 替换为 `callExpression` 既函数调用表达式，具体代码如下
```javascript
JSXElement: {
      exit(path, state) {      
        // 获取 jsx 
        const openingPath = path.get("openingElement")
        const children = t.react.buildChildren(openingPath.parent)
        // 这里暂时只处理了普通的 html 节点，组件节点需要 t.identifier 类型节点及其他节点等，待完善
        const tagNode = t.stringLiteral(openingPath.node.name.name)
  
        // 创建 Vue h
        const createElement = t.identifier('h')
        // 处理属性
        const attrs = buildAttrsCall(openingPath.node.attributes, t)
        // 创建 h(tag,{...attrs}, [chidren])
        const callExpr = t.callExpression(createElement, [tagNode, attrs, t.arrayExpression(children)])
        path.replaceWith(t.inherits(callExpr, path.node))
      }
    },
```

自此，基本的代码已经完成，完整代码及工程请参考 [vue3-tsx](https://github.com/zouhangwithsweet/xiezhewan/tree/master/vue3-tsx)。

> 代码受限于笔者能力，可能存在若干问题，`babel` 插件也极其简陋，如有建议或者意见，欢迎与笔者联系。现实中我唯唯诺诺，键盘上我重拳出击！