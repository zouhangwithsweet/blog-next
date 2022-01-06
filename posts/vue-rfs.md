---
title: 'Vue@3.0 rfs 提要'
date: 2020-03-25 15:09:32
tags: []
published: true
hideInList: false
feature: https://www.pilishen.com/media/472/phpOvF8j6.png
isTop: false
---
> 提前熟悉 `Vue@3.0` 的主要变动

1. [移除 `v-bind:title.sync="title"` 使用 `v-model:title="title"` 代替](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0005-replace-v-bind-sync-with-v-model-argument.md)
    **概要**：废弃 Api
    **代码示例**：
    ```javascript
        <!-- 在 Dom Element 上使用 -->
        <input v-model="xxx">

        <!-- would be shorthand for: -->

        <input
        :model-value="xxx"
        @update:model-value="newValue => { xxx = newValue }"
        >
    ```
    ```javascript
        <!-- 在组件上使用 -->
        <MyComponent v-model="xxx" />

        <!-- would be shorthand for: -->

        <MyComponent
        :model-value="xxx"
        @update:model-value="newValue => { xxx = newValue }"
        />
    ```
2. [全局 Api treeshaking(摇树)](https://github.com/vuejs/rfcs/blob/treeshaking/active-rfcs/0000-global-api-treeshaking.md)
    **概要**：提供全局api的摇树功能，缩小打包体积
    **受影响的 2.x Api**:
    - `Vue.nextTick`
    - `Vue.observable`
    - `Vue.version`
    - `Vue.compile`
    - `Vue.set`
    - `Vue.delete`
    代码示例：
    ```javascript
        import { nextTick, observable } from 'vue'

        nextTick(() => {})

        const obj = observable({})
    ```
3. [统一普通插槽和作用域插槽](https://github.com/vuejs/rfcs/blob/slots-unification/active-rfcs/0006-slots-unification.md)
4. [函数式组件和异步组件变更](https://github.com/vuejs/rfcs/blob/functional-async-api-change/active-rfcs/0007-functional-async-api-change.md)
    **概要**：
    - 函数式组件必须写成普通函数
        - `{ function: true }` 配置被废弃
        - `<template functional>` 不再被支持
    - 异步组件必须使用 `createAsyncComponent` 创建
    **代码示例**：
    ```javascript
        import { h } from 'vue'

        const FunctionalComp = props => {
        return h('div', `Hello! ${props.name}`)
        }
    ```

    ```javascript
        import { createAsyncComponent } from 'vue'

        const AsyncComp = createAsyncComponent(() => import('./Foo.vue'))
    ```
5. [render 函数 api 变更](https://github.com/vuejs/rfcs/blob/render-fn-api-change/active-rfcs/0008-render-function-api-change.md)
    **概要**：
    - `h` 现在必须被引入，而不是做为 `render` 函数的参数
    - `render` 函数的参数已经变更，其他和之前保持一致
    - `VNodes` 现在拥有扁平的属性
    **代码示例**：
    ```javascript
        // globally imported `h`
        import { h } from 'vue'

        export default {
        render() {
            return h(
                    'div',
                    // flat data structure
                    {
                        id: 'app',
                        onClick() {
                            console.log('hello')
                        }
                    },
                    [
                        h('span', 'child')
                    ]
                )
            }
        }
    ```
    ```javascript
        // setup 函数中可以直接返回一个 render 函数
        import { h, reactive } from 'vue'

        export default {
        setup(props, { slots, attrs, emit }) {
            const state = reactive({
                count: 0
            })

            function increment() {
                state.count++
            }

            // return the render function
            return () => {
                    return h('div', {
                        onClick: increment
                    }, state.count)
                }
            }
        }
    ```
6. [全局安装和配置 api 变更](https://github.com/vuejs/rfcs/pull/29)
    **概要**：全局的配置 api 变更为 app 实例来设置
    **代码示例**：
    ```javascript
        import { createApp } from 'vue'
        import App from './App.vue'

        const app = createApp(App)

        app.config.ignoredElements = [/^app-/]
        app.use(/* ... */)
        app.mixin(/* ... */)
        app.component(/* ... */)
        app.directive(/* ... */)

        app.mount('#app')
    ```
7. [`v-model` api 变更](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0011-v-model-api-change.md)
    **概要**：`v-model` 语法糖语法变更，从之前的之前的监听 `@input` + `:value` 变更为 `@update:modelValue` + `modelValue`
    **代码示例**：
    ```Javascript
        h(Comp, {
            modelValue: foo,
            'onUpdate:modelValue': value => (foo = value)
        })
    ```
    可以通过修改参数，实现监听不同的值
    ```javascript
        <Comp
            v-model:foo.trim="text"
            v-model:bar.number="number" />
    ```
    将被编译为
    ```javascript
        h(Comp, {
            foo: text,
            'onUpdate:foo': value => (text = value),
            fooModifiers: { trim: true },
            bar: number,
            'onUpdate:bar': value => (bar = value),
            barModifiers: { number: true },
        })
    ```
8. [自定义指令 api 变更](https://github.com/vuejs/rfcs/pull/32)
    **概要**：自定义指令声明周期 api 变更
    - `bind` -> `beforeMount`
    - `inserted` -> `mounted`
    - `beforeUpdate` *new, called before the element itself is updated*
    - ~~`update`~~ *removed, use `updated` instead*
    - `componentUpdated` -> `updated`
    - `beforeUnmount` *new*
    - `unbind` -> `unmounted`
9. [移除 `v-on` 键盘事件修饰符](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0014-drop-keycode-support.md)
10. [移除过滤器 `filters`](https://github.com/vuejs/rfcs/pull/97)
11. [移除 `inline-template` 的支持](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0016-remove-inline-templates.md)
12. [`<transition>` 组件 api 变更](https://github.com/vuejs/rfcs/pull/105)
    **概要**：
    - `v-enter` 变更为 `v-enter-from`
    - `v-leave` 变更为 `v-leave-from`
13. [移除 `data` 对象声明](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0019-remove-data-object-declaration.md)
    **概要**：`data` 配置现在只支持函数声明
    **代码示例**：
    ```javascript
        import { createApp, h } from 'vue'

        createApp().mount({
            // 只支持函数的声明形式
            data() {
                return {
                    counter: 1,
                }
            },
            render() {
                return [
                    h('span', this.counter),
                    h('button', {
                        onClick: () => { this.counter++ }
                    }),
                ]
            },
        }, '#app')
    ```
14. [移除`$on`，`$off`，`$once`](https://github.com/vuejs/rfcs/pull/118)
    