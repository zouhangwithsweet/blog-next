---
title: '关于加强对 Tailwind CSS 的研究与思考'
pubDate: 2022-03-29 11:55:51
description: 'atom css'
heroImage: 'https://tailwindcss.com/_next/static/media/tailwindui-small@75.8bb955b2.jpg'
---

## 背景

阅读本文之前，先简单介绍一下**原子化 CSS**。

> 原子化 CSS 是一种 CSS 的架构方式，它倾向于小巧且用途单一的 class，并且会以视觉效果进行命名。

我们所作为熟知的原子化 css 就是大名鼎鼎的 `Bootstrap`。在 `JQuery` 时代，为了快速实现布局，往往会使用类似的方案。

然而在 `Angular`、`React` 和 `Vue` 等前端框架对 `web` 页面开发范式的洗礼之下。现代 Web 开发 逐渐有如下 2 个特点：

- 组件是核心，在项目启动时，UI 组件的选型也是技术选型的一个重要组成部分
- 组件库往往强绑定 `Framework` 的 `runtime`
- `CSS` 的编写与构建走向若干几个流派
- `WebComponent` 在悄然崛起

**原子化 CSS**，也在 `CSS` 编写流派中再次崛起了，仿佛是历史的再一次循环，又好像是一种返璞归真，大道至简。

而 `Tailwind CSS` 就是掀起这场变革的排头兵，它目前在 Github 已经获得超过 **55000** star，超过 **1 million** 的项目正在使用它。它究竟有什么样的魔力呢？是怎么驱使着开发者再次背诵起了 _className_ ? 它就没有什么局限吗？笔者希望通过本文，能带给大家一个初步的认识。

## 特点

### 实用主义

Tailwind 的名字最大的特点就是**顾名思义**。看到它的名字，基本就了解它代表的含义。比如：

- **margin:** `m-1`, `m-10`, `max-w-full` ...
- **padding:** `p-1`, `px-10`, `py-6` ...
- **flex:** `flex`, `items-center` ...
- ...

Tailwind 所有的类名都由 CSS 属性缩写、派生、组合而来；且都是基于 `rem` 作为单位，以 4 的倍数最为断点，特别容易上手与记忆。基本上不用再去写 style 了。

这么做也有他的弊端，一是有一定的记忆成本，你需要了解 Tailwind 的命名规则，然后记住；二是 class 写起来可能会非常多；如果你的页面是面向响应式的设计，这个情况会更加严重。当然 Tailwind 团队也意识到这个问题，他们也提供了相应的[手段](https://tailwindcss.com/docs/reusing-styles)来帮助解决。在实际编写中也可以制定一些编码规范、排版范式来提高代码的观感。

当然，笔者是 `AllInJS` 的反对者，并没有觉得这有什么问题，在熟悉基本命名风格之后，实际的开发速度提高了很多。

### 按需生成

按需生成实际上并不是 Tailwind 第一个提出并设计的一个 feature，这个天才般的想法由 [WindiCSS](https://windicss.org/) 提出并设计使用。相反在 Tailwind v3.0 之前，庞大的 CSS 量和极慢的 hmr 速度一直是 Tailwind 的主要缺点。但是，事物的发展不仅要看个人努力，也要看历史的发展进程。在 `Vite`, `Snowpack` 之前，Tailwind 的按需生成功能是一个极其简单的功能，但是它藏在 `webpack` 之后，速度并不是一个巨大的痛点。在 `Vite` 之后，开发速度被提高了一个非常惊人的水平，因此相关的生态不得不加速，Tailwind 也实现了自己的 **JIT** 引擎，解决了按需生成的问题。

### 自由定制

Tailwind 在提供了基本的原子类之后，也允许开发者自由定制，比如开发专属的 plugin，修改默认的配置。这里不再赘述，参考[文档](https://tailwindcss.com/docs/adding-custom-styles)即可。

## 未来

时间来到 2022 年，**快** 成为评价开发体验的一个硬指标，Tailwind 和 WindiCSS 似乎已经很完美了，如何创造更快、更优雅的工具呢。Antfu 在尝试寻找他的答案。

![image](https://antfu.me/images/unocss-traditional-way-zh.png)

[UnoCSS](https://github.com/unocss/unocss) 是由 Antfu 开发的下一代原子类 CSS 引擎，它更底层，而且非常快，可定制性更强。它会是银弹吗？让我们拭目以待
