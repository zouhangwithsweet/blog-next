---
title: 'Vue3+ Element Plus + TS + Vite 构建 Chrome Extension'
date: 2021-06-05 10:01:52
tags: []
published: true
hideInList: false
feature: /post-images/vue3-element-plus-ts-vite-gou-jian-chrome-extension.jpg
isTop: false
---

> 写在前面，尤大前一阵子发了一条微博，内容是 `Vite + Vue3 + TS + VScode + Volar 谁用谁知道`。好嘛，我用了，我确实知道了，我又行了，我学的动.jpg ...

# 导语
- 什么是 `Vue3` ？[官方文档](https://v3.cn.vuejs.org/)
- 什么是 `Element-plus` [Github](https://github.com/element-plus/element-plus)
- 什么是 `Vite` ? [下一代前端开发与构建工具](https://cn.vitejs.dev/)
- 什么是 `Chrome Extension` ？[Chrome 拓展](https://developer.chrome.com/docs/extensions/)
- 什么是 `Volar` ? [Github](https://github.com/johnsoncodehk/volar)

本文不会着墨过多的插件内部逻辑和技术栈的基本使用，旨在介绍如何使用 `Vite` 与 `Vue3` 从 0开发一个实际项目，以及一些代码设计的取舍和打包构建遇到的问题及其解决方案。关于技术栈的选择，没什么技巧，**我的项目我说的算，我想用哪个就哪个😎**。

# 从请求拦截说起🤔
前端在实际业务中和后端 ~~Battle~~ 的桥梁就是 **Ajax**[/ˈeɪdʒæks/] 请求，使用请求可以顺着网线联系到后端的各种服务。在一个 webApp 之中，我们几乎都会使用一些手段，来做请求发出的拦截，比如混入一些公共参数 tokenuid、加密一些数据、删除一些数据、**甚至取消(abort)一些请求**；或者做请求响应的拦截，比如统一的错误码处理，统一的数据格式化等等。社区之中，大名鼎鼎的 **Axios**[æk'sioʊ] 提供了上述的两种 **Interceptors**[ˌɪntərˈseptə(r)]，来统一处理数据上报前与响应后。
那么假如不用 **Axios**，我们可以怎么来拦截请求呢？有的同学说了，“你可以修改 xhr 的原型方法，你可以替换原始的 fetch，来魔改啊~” 确实可以，但是我不用。今天就来给大家介绍使用 **Chrome Extension** 的能力，来拦截请求。可恶，又让我装到了！

# 说干就干🕶

### 初始化仓库
先记住几个关键点：
- **Chrome Extension** 的产物是多个 **HTML**，所以我们要创建一个多 Page 的 Vite 工程，强大的 Vite 已经支持
- 打包出来的产物必须有 `manifest.json`，这相当于 **Chrome Extension** 的入口文件，每 release 一次 `version` 自动 +1

#### 创建项目
```bash
yarn create @vitejs/app
```
按照提示我们创建一个 `vue-ts` 的工程。

#### 创建 `manifest.json`

```json
{
  "name": "Bad Request",
  "version": "0.0.0",
  "description": "Bad Request",
  "permissions": [
    "activeTab",
    "declarativeContent",
    "storage", // 获取存储权限，来存我们要拦截的 api 链接
    "webRequest", // 获取请求读取权限，来搞事情
    "webRequestBlocking", // 获取请求 abort 权限，来直接 abort 请求
    "<all_urls>" // 获取所有 url 的权限
  ],
  "background": {
    "page": "background/index.html",
    "persistent": true // 保证 background.js 一直在后台运行，拦截一直生效
  },
  "options_page": "options/index.html",
  "content_security_policy": "script-src 'self' 'unsafe-eval'; object-src 'self'",
  "page_action": {
    "default_title": "request",
    "default_icon": "images/logo.png",
    "default_popup": "popup/index.html"
  },
  "devtools_page": "devtool/index.html",
  "icons": {
    "16": "images/logo.png",
    "32": "images/logo.png",
    "48": "images/logo.png",
    "128": "images/logo.png"
  },
  "manifest_version": 2,
  "content_scripts": [
    {
      "matches": [
        "<all_urls>"
      ],
      "js": [
        "content.js"
      ]
    }
  ]
}
```
### 改造为多入口工程
然后根据[Vite 官方文档](https://cn.vitejs.dev/guide/build.html#multi-page-app)把它改造成一个多页面的工程。多 Page 的 `vite.config.ts` 如下：

```javascript,ts
export default defineConfig{
  // other setting...
  build: {
    rollupOptions: {
      input: {
        /**
         * 点击插件图标出现的弹窗
         * */
        popup: resolve(__dirname, 'popup/index.html'), 
        /**
         * chrome devtool pane 页面
         * */
        devtoolPage: resolve(__dirname, 'devtoolPage/index.html'), 
        /**
         * 插件的核心 JS，一直活跃在后台，来监听所有请求
         * */
        background: resolve(
          __dirname,
          'background/index.html'
        ),
        /**
         * 加载 chrome devtool pane 的入口
         * */
        devtool: resolve(__dirname, 'devtool/index.html'),
        /**
         * 插件设置页面
         * */
        options: resolve(__dirname, 'options/index.html'),
        /**
         * 与页面同级，并在某个时机执行，可以拿到页面的 document
         * */
        content: resolve(__dirname, 'src/content.ts'),
      },
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
  // other setting...
}
```

### 引入 **Element Plus**
根据其[官方文档](https://element-plus.org/#/zh-CN/component/quickstart)，配置 `Vite` 按需加载，配好的 `vite.config.ts` 如下：

```javascript,ts
export default defineConfig{
  // other setting...
  plugins: [
    vue(),
    styleImport({
      libs: [
        {
          libraryName: 'element-plus',
          esModule: true,
          ensureStyleFile: true,
          resolveStyle: (name) => {
            return `element-plus/lib/theme-chalk/${name}.css`
          },
          resolveComponent: (name) => {
            return `element-plus/es/${name}`
          },
        },
      ],
    }),
  ],
  // other setting...
}
```
Element Plus 针不戳！大工搞成，让我们愉快的开发吧~

# 如何在 Chrome Extension 拦截请求呢？🖐

## 1行代码足以

在 `background.ts` 写上这么一行代码：

```javascript,ts
chrome.webRequest.onBeforeRequest.addListener(
    handlerRequest,
    {
      urls: ['<all_urls>'],
    },
    // 定义获取哪些权限
    ['blocking', 'requestBody', 'extraHeaders']
)
```

`handlerRequest` 里我们可以拿到 `details` 参数，根据这个函数返回值的不同，`Chrome` 会执行如下操作：

- `return { redirectUrl: `newurl`}`，转发请求
- `return { cancel: true }`，`abort` 请求

```javascript,ts
// 其类型是 chrome.webRequest.WebRequestDetails
function handlerRequest(
  details: chrome.webRequest.WebRequestDetails
) {
  // 注意 proxy 和 block 需要你自己定义
  /**
   * 代理转发
   */
  if (proxy) {
    return {
      redirectUrl: details.url.replace(
        proxy.origin,
        proxy.target
      ),
    }
  }

  /**
   * 请求拦截
   * */
   if (block) {
       return { cancel: true }
   }
}
````

高手过招，点到为止；拦截一个请求就是如此的简单。

# 加点细节📝

知道原理之后我们就可以完善一下我们整体的插件的需求内容

- 支持拦截对应的请求，比如发到 `www.baidu.com` 的请求或比较关键的接口
- 给这个拦截做一个开关，我们可以启用拦截或者关闭拦截，点击插件图标弹出拦截开关
- 对特殊请求做请求监听，比如埋点请求，然后在新建一个 devtool Pane 记录我们的埋点流

评审完这个三个需求我们来做设计稿，先做**插件弹窗的设计稿**和 **devtoolPane 的设计稿**吧~

🕐
🕑
🕒
🕓

设计稿做好了，上图

### 弹窗

用了 **Element-plus** 来做基本的布局和表单控件

<img src="https://pt-starimg.didistatic.com/static/starimg/img/l56wP3cNzc1622872608502.png" width="240"/>

### devtool Pane

参考 **Vue Devtool** 的面板做了设计

<img src="https://pt-starimg.didistatic.com/static/starimg/img/uDWi1j8uQP1622872927136.png" width="480">


## 开关的代码设计

- 使用 Extension 自带的 storage，与 localStorage 类似，存储开关状态
- `backgroud.js` 可以读取存储的值，来个判断是否拦截
- 每次激活 Chrome Extension Popup 时候读取这个 storage，展示出来

代码如下：
```html,vue
<!-- 我还用 setup 语法糖 -->
<script setup lang="ts">
import {
  ElIcon,
  ElForm,
  ElFormItem,
  ElInput,
  ElSwitch,
} from 'element-plus'
import { ref, watch } from 'vue'
/**
 * 存储状态
 */
function saveCurrentStatus(
  type: string,
  value: boolean | string | Array<any>
) {
  // eslint-disable-next-line no-undef
  chrome.storage?.sync?.set({ [type]: value }, () => {
    console.log('设置成功')
  })
}

// 定义开关
const blocking = ref(false)
// 利用 Vue 3 的 watch，在每次值变化时，存储状态

watch([blocking], () => {
  saveCurrentStatus('blocking', blocking.value)
})
// 每次组件初始化时取得开关状态，setup 相当于  created 生命周期
const initStatus = () => {
    const storage = chrome.storage?.sync

    storage?.get('blocking', (data) => {
      blocking.value = data.blocking || false
    })
}
initStatus()
<script>

<template>
    <el-form>
        <el-form-item label="拦截" size="mini">
            <el-switch
            v-model="blocking"
            active-color="#2F86F6"
            />
        </el-form-item>
    </el-form>
</template>
```

`background.js` 监听 storage 变化

```javascript,ts
/**
 * 监听 storage 的变化
 */
chrome.storage.onChanged.addListener((changes)=> {
    console.log(changes)
})
```

### devtoolPane 的代码设计

这里关键点在于 `background.js` 和 devtoolPane 之间的通信问题，觉得也很简单  
**PostMessage** 即可

- devtoolPane 创建连接，发送消息

```javascript,ts
const backgroundPageConnection = chrome.runtime?.connect({
    name: 'devtool-page',
})
backgroundPageConnection?.postMessage({
    name: 'init',
    tabId: chrome.devtools.inspectedWindow.tabId, // 当前 devtoolPane tabId
})
```
- `background.js` 接口消息，拿到这个 Pane

```javascript,ts
let devtool = null
const connections: Record<string, any> = {}

chrome.runtime.onConnect.addListener((port) => {
    port.onMessage.addListener(message => {
        if (message.name === 'init') {
            connections[message.tabId] = port
            devtool = port
        }
    })
})
// 然后就可以 使用 devtool 来往 devtoolPane 派发消息了
// 这里我们把埋点的请求体全部发过去进行解析
function devtoolandler(details: any) {
  devtool && devtool.postMessage(details)
}
```

# 构建与发布📦

上文提到，每次构建时候需要把 `manifest.json` 版本号 +1，同时拷贝过去，来看看我是怎么做的~

- **拷贝**，使用 `rollup-plugin-copy` ，每次构建结束之后拷贝文件到 `dist`，很快啊~  
`vite.config.ts` 配置如下

```javascript,ts
export default defineConfig{
  // other setting...
  plugins: [
    copy({
      verbose: true,
      hook: 'writeBundle',
      targets: [
        {
          src: 'manifest.json',
          dest: 'dist',
        },
      ],
    }),
  ],
  // other setting...
}
```

- **版本号自动加1**
    - 使用 node-semver 升级版本号
    - 使用 sed 命令修改文件，node fs 也行
- 构建完了之后要**压缩整个 `dist`，必须要压缩才能发布到 Chrome Extension Store**

综上，得出我们的发布脚本

```javascript
#!/usr/bin/env zx

const semverInc = require('semver/functions/inc')

let manifest = require('../manifest.json')
console.log(
  chalk.yellow.bold(`Current verion: ${manifest.version}`)
)

let types = ['patch', 'major', 'minor']
let type = await question(
  chalk.cyan(
    'Release type? Press Tab twice for suggestion \n'
  ),
  {
    choices: types,
  }
)
let version = ''
if (type !== '' || types.includes(type)) {
  version = semverInc(manifest.version, type)
  console.log(
    chalk.green.bold(`Release verion? ${version}`)
  )
  // 使用 sed 命令修改 version
  $`sed -i '' s/${manifest.version}/${version}/g manifest.json`
} else {
  await $`exit 1`
}

// 构建
await $`yarn build`

// git
await $`git add .`
await $`git commit -m 'Update version to ${version}'`
await $`git tag v${version}`
await $`git push origin refs/tags/v${version}`
await $`git push origin HEAD:refs/for/master`

// 压缩
await $`cd dist && zip -r bundle.zip * && mv bundle.zip ../`
```

然后就可以去 `Chrome Extension Store` 发布了

*注意：*
* 开发者需要交纳 5美元，才可以发布代码到`Chrome Extension Store` 
* 审核时间不定，疫情期间可能很漫长，因为 **Google** 天天放假

至此，笔者使用了 **Vue3+ Element Plus + TS + Vite** 开发出来一个 **Chrome Extension**，效率很高，代码很帅，尤大果然没有骗我。

**yyx! yyds!**

最后，有什么想指教笔者的，直接留言吧，欢迎你跟我沟通呀~

👋
