---
title: 'vue-create-api 源码分析'
date: 2020-03-05 10:44:44
tags: []
published: true
hideInList: false
feature: https://pt-starimg.didistatic.com/static/starimg/img/4Pl6t46Lgf1617332605170.png
isTop: false
---
> `vue-create-api` 是 `cube-ui` 的内置库，笔者有幸提过`pr`，且对这个单独库有较多的实践，深感此库的使用价值，代码设计也比较巧妙，故作此文，加深记忆

先看一下，整体的文件结构，非常清晰
![](http://blog.zouhaha.site/post-images/1583377921601.png)
### 入口 index.js
在 `install` 方法的核心部分中，直接会给 `VueConstructor` 添加一个 `createAPI` 方法，然后会给 `Vue.prototype` 添加实例方法

```js
Vue.createAPI = function (Component, events, single) {
  if (isBoolean(events)) {
    single = events
    events = []
  }
  const api = apiCreator.call(this, Component, events, single)
  const createName = processComponentName(Component, {
    componentPrefix,
    apiPrefix,
  })
  Vue.prototype[createName] = Component.$create = api.create
  return api
}
```
createAPI 的 interface如下，可发现，他接受一个 VueComponent, 可选参数 events, 和是否单例 single（默认单例）

```js
declare module 'vue/types/vue' {
  export interface VueConstructor {
    createAPI: (Component: Component, events?: string[], single?: boolean) => Api
  }
}
```

### 核心方法 creator.js
这里是核心方法，`this.$createComponent` 的函数体。这里先判断 renderFn 和是否单例；然后判断他有没有 `$on` 方法（判断 `this` 是不是 `Vue` 实例？）。然后执行 `parseRenderData` 方法格式化 `$events` 和 `$props`

```js
create(config, renderFn, _single) {
      if (!isFunction(renderFn) && isUndef(_single)) {
        _single = renderFn
        renderFn = null
      }

      if (isUndef(_single)) {
        _single = single
      }

      const ownerInstance = this
      const isInVueInstance = !!ownerInstance.$on
      let options = {}

      if (isInVueInstance) {
        // Set parent to store router i18n ...
        options.parent = ownerInstance
        if (!ownerInstance.__unwatchFns__) {
          ownerInstance.__unwatchFns__ = []
        }
      }

      const renderData = parseRenderData(config, events)

      // 这里的 renderData = { props, on }
      // props 是 config 去掉 onEvent 的

      let component = null

      processProps(ownerInstance, renderData, isInVueInstance, (newProps) => {
        component && component.$updateProps(newProps)
      })
      processEvents(renderData, ownerInstance)
      process$(renderData)

      // 这里开始 构建组件，传入的 renderData 是经过处理的 config
      component = createComponent(renderData, renderFn, options, _single)

      // 如果是实例本身监听 hooks 执行 remove 操作
      if (isInVueInstance) {
        ownerInstance.$on(eventBeforeDestroy, beforeDestroy)
      }

      function beforeDestroy() {
        cancelWatchProps(ownerInstance)
        component.remove()
        component = null
      }

      return component
    }
  }
```
这是 $createComponent 的 interface，接受 options 参数和可选参数
```js
export interface createFunction<V extends Vue> {
  (options: object, renderFn: renderFunction, single?: boolean):V
  (options: object, renderFn?: renderFunction):V
  (options: object, single?: renderFunction):V
}
```
### createComponent 函数是组装 component 的核心方法
它接收 4 个参数， `renderData` 就是经过处理的 `config`， `renderFn` 就是用户传入的 `renderFn` ， `options` 是一个对象记录这个 api 组件的调用的 父组件（就是你在哪个组件调用 `this.$createComponent` 的那个组件），`single` 是否单例

```js
  function createComponent(renderData, renderFn, options, single) {
    beforeHooks.forEach((before) => {
      before(renderData, renderFn, single)
    })
    // 记录所有者组件 uid 这个是由 Vue 自己生成的
    const ownerInsUid = options.parent ? options.parent._uid : -1
    // 用外部变量单例， 其实是外层的函数 apiCreator 的闭包变量
    const {comp, ins} = singleMap[ownerInsUid] ? singleMap[ownerInsUid] : {}
    if (single && comp && ins) {
      ins.updateRenderData(renderData, renderFn)
      ins.$forceUpdate()
      currentSingleComp = comp
      return comp
    }
    const component = instantiateComponent(Vue, Component, renderData, renderFn, options)
    const instance = component.$parent
    const originRemove = component.remove

    // 定义 remove 方法
    component.remove = function () {
      if (single) {
        if (!singleMap[ownerInsUid]) {
          return
        }
        singleMap[ownerInsUid] = null
      }
      originRemove && originRemove.call(this)
      instance.destroy()
    }

    // 定义 show 方法
    const originShow = component.show
    component.show = function () {
      originShow && originShow.call(this)
      return this
    }

    // 定义 hide 方法
    const originHide = component.hide
    component.hide = function () {
      originHide && originHide.call(this)
      return this
    }

    // apiCreator 的闭包变量 singleMap ，currentSingleComp
    if (single) {
      singleMap[ownerInsUid] = {
        comp: component,
        ins: instance
      }
      currentSingleComp = comp
    }
    return component
  }
```
### `instantiateComponent` 函数，初始化 `component` ，让 `component` 出现在页面上

使用 `new Vue` 来构造一个组件包裹实例，然后 `mount` 到 `body` 最底部

```js
export default function instantiateComponent(Vue, Component, data, renderFn, options) {
  let renderData
  let childrenRenderFn

  const instance = new Vue({
    ...options,
    render(createElement) {
      let children = childrenRenderFn && childrenRenderFn(createElement)
      if (children && !Array.isArray(children)) {
        children = [children]
      }

      return createElement(Component, {...renderData}, children || [])
    },
    methods: {
      init() {
        document.body.appendChild(this.$el)
      },
      destroy() {
        this.$destroy()
        document.body.removeChild(this.$el)
      }
    }
  })
  instance.updateRenderData = function (data, render) {
    renderData = data
    childrenRenderFn = render
  }
  instance.updateRenderData(data, renderFn)
  instance.$mount()
  instance.init()
  const component = instance.$children[0]
  component.$updateProps = function (props) {
    Object.assign(renderData.props, props)
    instance.$forceUpdate()
  }
  return component
}
```
