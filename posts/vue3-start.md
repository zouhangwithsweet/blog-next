---
title: 'Vue 3.0 及其生态的初步踩坑'
date: 2020-03-13 20:02:29
tags: []
published: true
hideInList: false
feature: https://pt-starimg.didistatic.com/static/starimg/img/6R4vYKLGXF1617332597832.png
isTop: false
---

<p align="center">
  <img style="max-height: 240px" src="https://pt-starimg.didistatic.com/static/starimg/img/6R4vYKLGXF1617332597832.png">
</p>

---

> 按照官方的 `roadmap`的说明， `Vue@3.0-beta` 最早将于2020年第一季度终与广大开发者见面，正式的`RC`将会在5月份，也是就是第二季度的中段。在笔者作此文时，`Vuex@4.0.0-alpha.1` 已经发布，但是 `Vue-Router` 还在路上，官方版本的 `jsx-transform-plugin` 也还在路上，三大插件进度也是蛮快的。随着`Beta`版本的到来，在没有正式文档的之前，我们该怎么使用 `Vue@3.0` + `Vuex@next` + `Vue-Router@next` + .... Let's go

### 关于`Vue@3.0`的工程
参考 [*yyx* 的模板](https://github.com/vuejs/vue-next-webpack-preview)即可，当然我们肯定是要使用`TypeScript`的，稍加改动，参考我之前的文章即可。

### 关于 `Composition-Api`
这个部分的升级是整个框架最为核心的一个部分，*yyx* 亲自翻译过该[`RFC`](https://zhuanlan.zhihu.com/p/68477600)，后来经过社区的讨论，最终形成了`Composition-Api`的规范。我们的踩坑自然是精读[`RFC`](https://composition-api.vuejs.org/) 开始。笔者习惯读[GitHub的版本](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0013-composition-api.md)

<iframe width="560" height="315" style="margin: 0 auto" src="https://www.youtube.com/embed/6D58SI9P-aU" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

### 关于 `setup`
- `setup` 没有 `this`
- `setup`有两个参数`props, context`；其中 `props` 是不能解构的，否则会失去响应式；与此对应的是 `reactive()` 的返回值也是无法解构的，否则也会失去响应式。
- `setup` 的返回值都是给 `template` 用的；当然，你可以直接返回 `jsx`
  ```javascript
    return () => h('div', [
      count.value,
      object.foo
    ])
    //----- or -----
    return () => <div>{count.value} {object.foo}</div>
  ```
  
### 关于 `this`
`Vue@3.0` 为了做到良好的类型推断，在架构上放弃了不少东西，比如之前的 `Class Component`，这个因为涉及了要使用不稳定的装饰器，放弃了；再比如 `mixins` 和之前的插件对 `Vue.prototype` 的污染；这些对 `this` 的推导都个不小的挑战。最终，官方采用了 `Composition-Api`，利用函数天然对类型的约束推导，带来好处诸多。关于 `this`，根据官方设计的`Api`，和之前用法并无太大差别，`Vue`还是会做一层代理，使你的`this`永远是你的组件本身，只是在 `setup` 无法使用而已。

### 关于 `Component`
组件的写法是完全兼容旧版本的写法的。当然官方还是推荐使用 `setup` 的形式。但是笔者最为困惑的一点是以后关于 `v-on` 和 `emit` 的使用问题。总所周知，在 `react` 之中，事件的传递也是 `props`, 而 `Vue` 的推荐的写法是内部 `emit`，外部监听。这种情况在 `Vue3` 出来以后会被打破吗？在使用 `jsx/tsx` 构建组件时，`@event={this.eventHandler}` 这种写法是否依然适合、依然能够被正确的推导呢？

### 关于 `Vue-plugins`
新版本的所有插件都要通过 `provide/inject` 来注入，使用 `this.$xx` 的时代离我们远去了。
```javascript
import { provide, inject } from 'vue'

const ThemeSymbol = Symbol()

const Ancestor = {
  setup() {
    provide(ThemeSymbol, 'dark')
  }
}

const Descendent = {
  setup() {
    const theme = inject(ThemeSymbol, 'light' /* optional default value */)
    return {
      theme
    }
  }
}
```

### 关于 `TypeScript`
类型约束自然还是要通过函数来做
```javascript
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    foo: String
  },
  setup(props) {
    props.foo // <- type: string
  }
})
// ----- or -----
import { defineComponent } from 'vue'

// provide props typing via argument annotation.
export default defineComponent((props: { foo: string }) => {
  props.foo
})
```