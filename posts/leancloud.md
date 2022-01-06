---
title: '穷bi之部署玩具 react/vue 单页应用'
date: 2018-05-18 15:24:00
tags: [express,node,云引擎,薅羊毛]
published: true
hideInList: false
feature: 
isTop: false
---

> 记得去年的腾讯云和阿里云推出了一系列优惠活动，白菜价云服务器。当时在v2看到不少大佬上车了，v2站长当时指出“便宜没好货”，果然现在都成“阿里扎”了。当时本人也是蠢蠢欲动，想走一波团购上车，无奈还是要花钱啊。而且我对域名没啥特别的追求，我只希望有个能在线访问的主机即可。

> 好吧，以上一段话翻译过来就是——**花钱是不可能的！** 在下实在是穷的飞起。一直徘徊在蹭的路上，免费的云引擎和数据库是在下的最爱。

我知道第一个免费的云引擎是大名鼎鼎的**heroku.com**，它提供免费500m的空间，这个东西在国外火了很久，`GitHub`有个不得了的项目就是部署在**heroku.com**上的，后来该项目被删了。去年的时候**heroku.com**的访问速度还是可以的，至少能进去控制台，能部署、重启项目，过完年之后速度没法看了。

实在是没办法只能把眼光放到国内，薅国产羊毛。众所周知，我们可以在`GitHub`部署纯静态的页面，博客等等；没错我也部署了这个`hexo`，正如你看到这个，在设置`hexo next`主题的时候发现了能够存储`访问次数`的免费容器，也就是我们今天的羊毛猪脚——**leancloud.cn**（真的不是广告）。这个太（不）吊（要）了（钱），正是我这种前端精（穷）英（bi）需要的。

`leancloud`的开发版每天提供500m访问流量，不要钱，不少了；10G存储空间；30000次API请求；要啥自行车！**因为在下是个前端，只知道点`node.js`，所有的玩具都是用`node`跑`express`的。**

**鼓掌，开始薅**~

<!-- <img src="/images/h0.jpg" width = "300" align=center /> -->

第一步，访问**leancloud.cn**  
<!-- ![](/images/h1.png)   -->
点击右上角的直接访问控制台。**纳尼**！不用注册、登录之类的吗？别急，那是下一步。

然后，注册，登录，基操。  
<!-- ![](/images/h2.png)   -->
我们选gayhub作为登录账号，美滋滋。登录后就进去控制台了。  
<!-- ![](/images/h3.png)   -->
看到这个快速入门没？**好的，我们不看**。直接创建新应用。  
<!-- ![](/images/h4.png)   -->
起个名字`test-zz`，选择开发版，创建。  
<!-- ![](/images/h5.png)   -->
看看这个`云引擎`三个字，多么亲切，点击进去。然后点击左侧菜单`部署`，熟悉的`git源码部署`  
<!-- ![](/images/h6.png)   -->
点击进去，发现要配置`repo`，那就去`设置`菜单设置  
<!-- ![](/images/h7.png)   -->
那我们进去部署`repo`，go  
<!-- ![](/images/h8.png)   -->
哟呵，不就是`git`的地址，我们去把源码地址复制上去。顺便把这个`Deploy keys`配置到你git仓库，很皮。  
<!-- ![](/images/h9.png)   -->
这里有个自定义变量，就是你的`express`或`koa`监听的端口，必须设置成`3000`，**重要**！
<!-- ![](/images/h10.png)   -->
弄好之后，自定义你的注意域名。回到`部署`菜单，**部署**。

**leancloud**优秀的地方在于就是能和**heroku**一样能自动识别你的后台语言。
**注意点**
- `node.js`的项目一定要有`package.json`
- `express`或`koa`监听的端口，必须设置成`3000`
- 默认的启动命令是`npm start`，这个`scripts`要配置成你的启动服务器文件。
- 默认下载的依赖是`dependencies`，`devDependencies`不会下载。  

下面是实例代码，基于`react/vue`的`spa`，前后端分离的静态代码。

package.json
```javascript
{
  "name": "react-app",
  "version": "1.0.0",
  "description": "",
  "main": "src/main.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "parcel index.html",
    "build": "parcel build index.html --public-url ./",
    "start": "node server"
  },
  "author": "",
  "license": "MIT",
  "dependencies": {
    "mobx": "^4.2.1",
    "mobx-react": "^5.1.2",
    "ra": "^0.9.7",
    "re": "^0.1.4",
    "react": "^16.3.1",
    "react-dom": "^16.3.1",
    "react-router": "^4.2.0",
    "react-router-dom": "^4.2.2"
  },
  "devDependencies": {
    "autoprefixer": "^8.2.0",
    "babel-eslint": "^8.2.2",
    "babel-plugin-transform-class-properties": "^6.24.1",
    "babel-preset-env": "^1.6.1",
    "babel-preset-react": "^6.24.1",
    "babel-preset-stage-0": "^6.24.1",
    "eslint": "^4.19.1",
    "eslint-config-yelingfeng": "0.0.4",
    "eslint-plugin-react": "^7.7.0",
    "express": "^4.16.3",
    "parcel-bundler": "^1.7.0",
    "postcss-modules": "^1.1.0",
    "stylus": "^0.54.5"
  }
}
```
server.js
```javascript
const express = require('express')
const path = require('path')
const axios = require('axios')
const app = express()
const history = require('connect-history-api-fallback')
// 引入第三方路由
const proxyConf = require('./config/proxy')
const headerConf = {
    // referer: 'https://www.v2ex.com',
    // host: 'www.v2ex.com'
}

let apiRoutes = express.Router()

for (let k in proxyConf) {
    app.get(k, function(req, res) {
        // console.log(proxyConf[k])
        axios.get(proxyConf[k], {
            headers: headerConf,
            params: req.query
        }).then(response => {
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.json(response.data)
        }).catch(e => {
            console.log(e)
        })
    })
}
app.use(history())
app.use('/', apiRoutes)
app.use(express.static(path.join(__dirname, 'dist')))

const port = process.env.PORT || 5000
app.listen(port)
console.log('server started ' + port)
```
这里我后端转发一些接口，是自己后端情况而定。**dist**目录是自己打包好了，你可以放在云引擎上打包。
