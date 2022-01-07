---
title: 'Vue3.0 组件库开发模板'
date: 2021-07-20 11:38:13
tags: []
published: true
hideInList: false
feature: https://pt-starimg.didistatic.com/static/starimg/img/XEowm9ygfF1544626192687.png
isTop: false
---

<p align="center">
  <img style="max-height: 240px" src="https://pt-starimg.didistatic.com/static/starimg/img/XEowm9ygfF1544626192687.png">
</p>

---

> 最近一个月的时间都在写 Vue3 组件库，踩了不少坑，总结出一个次佳模板，希望能帮助到社区。

## 引言

组件库的两个重要的部分的体验是开发体验(DX)和使用体验(UX)；使用体验在于支持的够多，API 设计的足够合理，文档的清晰度。而组件的开发体验可能会被开发者忽视，实际上好的开发体验对于社区的推广和用户提 PR 的意愿和效率都是有正向引导的。
**vue-components-lib-seed** 旨在提供较好的开发体验，较为清晰、美观的文档，助力同学们快速启动组件UI库的开发。

## 特性

- 快如闪电的开发启动速度和构建速度
- 自定义友好，无黑盒代码、无复杂逻辑
- 基于 Vitepress，拥有它的所有特性的同时，还有更好看的文档、同时支持中英文、支持暗黑模式、支持自定义的代码高亮样式
- 丰富的脚本，从生成文件到开发，再到构建发布，尽可能的自动化

## 开发、测试与构建

随着 Vite 的普及，前端开发者总算是可以不用在项目冷启动的时候喝杯咖啡了（不是）。**vue-components-lib-seed** 基于 `Vite vue-ts` 模板初始化，给开发者提供高效的开发速度。如图所示，冷启动在1500ms 左右：

![](https://pic1.zhimg.com/80/v2-499649ec7744855c00f3a8b49110f76c_1440w.jpg)

构建时，vuecomponent-seed 使用 esbuild 为 Typescript 提供几乎是 tsc 上百倍的速度编译效率，极大地缩短了构建时间，默认支持按需加载构建，可以通过类 babel-plugin-import 插件实现真正意义上的按需加载。

但令人遗憾的是，d.ts 的生成仍然依赖 tsc，这个速度也确实无法明显的降低。如打包单组件，包含 d.ts 整体的速度为 17.53s。如果不打包 d.ts，构建速度为惊人的 1s。

![](https://pic2.zhimg.com/80/v2-7bba4c629847cbd7ec4acbb089ce393d_1440w.jpg)

测试采用 jest，提供单元测试。同时，开发时的各类 lint、postcss 以及 prettier 均已开箱自带。

## 文档

基于 vitepress，自定义了相关的样式。在继承 vitepress ssg、hmr 等功能的同时，更支持 Dark mode，支持 i18n，支持 demo 接入，支持复制 demo 代码（部署站点需支持 HTTPS）。如果，同学们有更高的自定义需求，内置的windicss是您自定义的样式的利器。

![](https://pic4.zhimg.com/80/v2-5141621c0afa00e3966a7b717cdc8897_1440w.jpg)

### 组件 demo

自定义 markdownit plugin 实现 Vue 组件在文档中直接渲染。

```html

<DemoWrapper src="xx"/>

```

![](https://pic4.zhimg.com/80/v2-2a848c01b15e994b73dc9b5e7e145f97_1440w.jpg)

## 脚本

自定义了丰富的脚本，包括：

- 生成入口文件脚本
- 开发与构建相关脚本
- 发布脚本 [✏️@eeeeelle](https://github.com/eeeeelle)
- 初始化新组件脚本 [✏️@eeeeelle](https://github.com/eeeeelle)

最后，欢迎大家体验，觉得不错的可以给个 star，觉得哪里不好直接提 issue，我会及时响应。

**项目地址: [vue-components-lib-seed](https://github.com/zouhangwithsweet/vue-components-lib-seed)**
