---
title: '渲染 Vue3 component 的新方式'
date: 2020-06-12 11:16:56
tags: []
published: true
hideInList: false
feature: /post-images/zhe-shi-biao-ti.png
isTop: false
---
> `Vue3` 发布在即，先来一波私货[Vue3初步踩坑](http://blog.zouhaha.site/post/vue3-start)

众所周知，UI 组件是现代前端框架的核心概念之一，同时伴随着社区的蓬勃发展，越来越多创建组件的方式被开发出来，给开发者带了极大的便利；层出不穷的概念，特别是`React`社区对组件的探索，开发者经历了`Mixin`，`HOC`，`render props` 再到 `hooks`；组件的抽象方式逐渐确定下来，随着`Vue3 Composition API` 的确定，两大前端框架（库）都选择`hooks`作为抽象组件的最佳方式。
那么回到组件本身，一个组件从生成到渲染再到销毁，其套路大体如下

![](http://blog.zouhaha.site/post-images/1592227174896.png)
大部分的前端框架都是如此。

在`Vue2.0` 时代，前端创建组件并挂载在页面之中大概有两种思路：
- 正常的创建组件，并在父组件注册子组件，模板声明即可
  ```javascript
        export default {
            components: {
                childComponent,
            }
        }
  ```
- 使用 `Vue.extend` 创建`Vue`子类，再`$mount`实例化组件，拿到生成好的 `Dom` 节点插入body或者任意父组件即可（具体代码可以参考 `Element-ui` `this.$loading` 的实例化方法）；这里有必要提一下`vue-create-api`，它的思路与之类似，但又些许不同，`vue-create-api` 直接实例化了一个`Vue` ，同时绑定了调用方的生命周期，让逻辑上的销毁更加符合直觉
  ```javascript
  import loadingVue from './loading.vue'
  const LoadingConstructor = Vue.extend(loadingVue)

  let instance = new LoadingConstructor({
    el: document.createElement('div'),
    data: options
  })
  ```
现代的前端框架创建组件就是这么朴实无华，且高效。

时间来到0202年4月21日（误），yyx 在B站分享了`Vue3.beta`的最新进展，有提到`Custom Renderer API`，有了这个东西，理论上你可以自定义任意平台的渲染函数，把`VNode`渲染到不同的平台上，比如小程序；你可以对着`@vue/runtime-dom`复制一个`@vue/runtime-miniprogram`出来。同时`@vue/runtime-dom`也给开发者带来了新的创建组件的方式，让我们来尝试一下吧。

首先准备一个`Loading.vue`组件
```html
<template>
  <transition name="v">
    <div v-show="isShow" class="loading">
      <span>{{ msg }}</span>
    </div>
  </transition>
</template>

<script lang="tsx">
import { defineComponent, ref } from 'vue'
export default defineComponent({
  name: 'Loading',
  props: {
    msg: {
      type: String
    },
  },
  setup(props, context) {
    const isShow = ref(false)
    return {
      isShow
    }
  },
  methods: {
    show() {
      this.isShow = true
      this.$emit('show')
    },
    hide() {
      this.isShow = false
    },
  },
  mounted() {
    console.log('挂载')
  },
  unmounted() {
    console.log('卸载')
  }

})
</script>
<style lang="stylus">
.loading
  position fixed
  top 0
  left 0
  right 0
  bottom 0
  display flex
  flex-direction column
  // justify-content center
  align-items center
  transition all .3s ease
  span
    position relative
    top -20px
    font-size 32px
    font-family Helvetica Neue For Number,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,PingFang SC,Hiragino Sans GB,Microsoft YaHei,Helvetica Neue,Helvetica,Arial,sans-serif
    color #333
.v-enter-from, .v-leave-to {
  opacity: 0;
}
.v-leave-from, .v-enter-to {
  opacity: 1;
}
</style>
```
接下来写一个工厂函数，用来渲染组件，(参考`vue-create-api`)

```javascript
// create-api.ts
import { App, createVNode, render, mergeProps, ComponentOptions } from 'vue'
// 显然我们要一个单例模式
let _instance: any = null

export const useCreate = function(Component: ComponentOptions, app?: App, options?: any, ) {
  if (!_instance) {
    /**
     * 默认的 render 函数，不支持 DocumentFragment 参数我们要拓展一下这个声明
     * 参考代码：
     * // vue-shim.d.ts
     * import * as vue from 'vue'
     * declare moudle 'vue' {
     *   export declare const render: vue.vue.RootRenderFunction<Element, DocumentFragment>
     * }
     * declare module '@vue/runtime-core' {
     *   interface ComponentCustomProperties {
     *     $createLoading: () => any
     *   }
     * }
     */
    const container = document.createDocumentFragment()
    // 直接根据组件生成 VNode
    _instance = createVNode(Component)
    // Vue3 的 props 是扁平化的，事件直接 onMethods 即可；和 React props 类似，合并属性更轻松
    _instance.props = mergeProps(_instance.props, {
      // 测试代码
      msg: 'it\'s a prop msg',
      // 测试代码
      onShow() {
        console.log('emit handler')
      },
      ...options,
    })
    // 渲染组件，并插入 body 之中
    render(_instance, container)
    document.body.appendChild(container)
    // 在组件添加一个 remove 方法用来销毁组件
    _instance.component.ctx.remove = function() {
      render(null, container)
      _instance = null
    }
    // 暴露一个 updateprops 的方法
    _instance.component.ctx.$updateProps = function(props: any) {
      props && Object.keys(props).forEach(k => {
        _instance.component.props[k] = props[k]
      })
    }
  }
  // 将组件直接暴露出去
  return _instance.component.ctx
}
// 暴露一个插件 API 
const install = (app: App, Component: ComponentOptions) => {
  // 在 this 上挂载一个贯穿方法，用 provider 也行
   app.config.globalProperties[`$create${Component.name}`] = useCreate(Component, app)
}
export default install
```
如何使用呢？也很简单
```javascript
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import Loading from 'path/to/Loading.vue'
import { useCreate } from 'path/to/create-api.ts'

const app = createApp(App)
app.mount('#app')

const loading = useCreate(LoadingComp, app)
loading.show()

setTimeout(() => {
  loading.$updateProps({
    msg: '测试message',
  })
}, 1000)

setTimeout(() => {
  loading.remove()
}, 5000)
```
至此，稍加打磨，开发者就可以快乐创建组件了。

*祝大家生活愉快<完>*
> 受限于笔者的开发能力，文中代码可能存在若干 bug，欢迎与笔者联系、探讨
> FAQ:
    - Q: 这么写代码有什么用？ A: 哈哈哈，我也不知道
    - Q: Vue3 正式版什么时候发布？ A: 2020年8月份左右
    - Q: Vue 和 React 选哪个？A:你帮我擦下键盘  cnbmoaqngobxge bavmxdfe
