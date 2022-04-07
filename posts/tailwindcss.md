---
title: "和 Tailwind CSS 高强度对线"
date: 2022-03-29 11:55:51
feature: 
hideInList: false
isTop: false
---


<p align="center">
  <img style="max-height: 240px" src="https://cdn.learnku.com/uploads/images/202003/11/1/yqh85AThHg.png">
</p>

---

## 背景

阅读本文之前，先简单介绍一下**原子化 CSS**。

> 原子化 CSS 是一种 CSS 的架构方式，它倾向于小巧且用途单一的 class，并且会以视觉效果进行命名。

我们所作为熟知的原子化 css 就是大名鼎鼎的 `Bootstrap`。在 `JQuery` 时代，为了快速实现布局，往往会使用类似的方案。

然而在 `Angular`、`React` 和 `Vue` 等前端框架对 `web` 页面开发范式的洗礼之下。现代 Web 开发 逐渐有如下2个特点：

- 组件是核心，在项目启动时，UI 组件的选型也是技术选型的一个重要组成部分
- 组件库往往强绑定 `Framework` 的 `runtime`
- `CSS` 的编写与构建走向若干几个流派
- `WebComponent` 在悄然崛起

**原子化 CSS**，也在 `CSS` 编写流派中再次崛起了，仿佛是历史的再一次循环，又好像是一种返璞归真，大道至简。

而 `Tailwind CSS` 就是掀起这场变革的排头兵，它目前在 Github 已经获得超过 **55000** star，超过 **1 million** 的项目正在使用它。它究竟有什么样的魔力呢？是怎么驱使着开发者再次背诵起了 *className* ? 它就没有什么局限吗？笔者希望通过本文，能带给大家一个初步的认识。

## 特点

### 实用主义

Tailwind 的名字最大的特点就是**顾名思义**。看到它的名字，基本就了解它代表的含义。比如：

- **margin:**  `m-1`, `m-10`, `max-w-full` ...
- **padding:**  `p-1`, `px-10`, `py-6` ...
- **flex:** `flex`, `items-center` ...
- ...

Tailwind 所有的类名都由 CSS 属性缩写、派生、组合而来；且都是基于 `rem` 作为单位，以 4 的倍数最为断点，特别容易上手与记忆。基本上不用再去写 style 了。
这么做也有他的弊端，class 会非常多；如果你的页面是响应式的设计，基本上 class 比内容要多。这个看个人选择，也能在可以书写规范上加以约束。当然 Tailwind 团队也意识到这个问题，他们也提供了响应的手段来帮助解决。

### 按需生成

from  windicss

### 自由定制

config & plugin

## 未来

unocss
