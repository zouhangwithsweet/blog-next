---
title: '关于第三方API跨域那些事'
date: 2018-03-12 11:49:26
tags: [vue,express,cors跨域]
published: true
hideInList: false
feature: 
isTop: false
---

　　我们在项目开发中，使用第三方接口难免会遇到一些跨域问题，而跨域这个话题网上已经讨论了无数遍了。常用的有：
> * jsonp
> * cors
> * 服务端反向代理（因为服务端不存在跨域问题）  
  
　　现在推荐的方式是[CORS跨资源共享](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS)。在我看来，CORS本质是一种白名单，其关字段为 **Access-Control-Allow-Origin**，通过标记请求发起站点是否可以访问目标站点的资源，达到跨域的目的。CORS支持所有的http方法，可以说是跨域的本质解决方案。jsonp本质是一个hack，现在不推荐使用了。

　　那么我们在使用第三方API的时候，API的提供者是怎样处理跨域问题呢？以[cnode.js开放平台](https://cnodejs.org/api)为例，我们访问[一个API](https://cnodejs.org/api/v1/topics)接口时，我们发现这些接口的响应头部分包含了**Access-Control-Allow-Origin:\***，它就是允许所有站点可以跨域访问它的标志。但是有的接口，可能没有这个响应字段。我们在自己造玩具、开发调试的时候怎么处理呢？

以`vue-cli:2.8.2`为例，我们可以在`config/index.js`中修改如下代代码：
```JavaScript
    proxyTable: {
        '/api': {    //将www.exaple.com印射为/apis
            target: 'http://127.0.0.1:5000',  // 接口域名
            changeOrigin: true,  //是否跨域
            secure: false 
        }
    }
```
这段代码会为 [webpack-dev-server](https://doc.webpack-china.org/configuration/dev-server/#devserver-proxy) 提供一个代理配置，它内部使用[http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware)，一个非常强大的node代理工具，这个是可以通过反向代理，实现开发中跨域访问接口的。

　　那么我们自己来模拟代理要如何来做呢？在学习的过程，我们可以用`express`作为服务器实现接口转发，这种技术或者叫中间层越来越流行。一般是一传统的`Java，PHP，Python, Golang`等后台语言作为服务器开发接口，前端通过node中间层来转发接口，返回前端想要的数据格式，极大的提高了接口开发的效率和需求的多样性。现在我们来实现一个简单的`express`转发接口，实现跨域和返回自己想要的数据。

　　我们以 https://www.v2ex.com/api 接口为例，这个接口的响应头没有**Access-Control-Allow-Origin**字段，所以正常使用axios调用此类接口，虽然可以访问到数据，但是axios本身的跨域错误机制，导致我们无法使用其返回的数据。`express`登场了，我们将使用它来实现接口转发实现跨域。首先我们准备一个路由文件`config/proxy.js`：
```JavaScript
    module.exports = {
        '/api/now': 'https://www.v2ex.com/api/topics/latest.json',
        '/api/hot': 'https://www.v2ex.com/api/topics/hot.json',
        '/api/node': 'https://www.v2ex.com/api/nodes/show.json',
        '/api/userinfo': 'https://www.v2ex.com/api/members/show.json',
        '/api/replies': 'https://www.v2ex.com/api/replies/show.json',
        '/api/topics': 'https://www.v2ex.com/api/topics/show.json'
    }
```
这里我重新定义了接口的名称，你可以把他任意定为你想要的名字。接下来准备一个`server.js`，也就是我们服务端的主文件：
```JavaScript
    const express = require('express')
    const path = require('path')
    const axios = require('axios')
    const app = express()
    // 引入第三方路由
    const proxyConf = require('./config/proxy')
    const headerConf = {
        referer: 'https://www.v2ex.com',
        host: 'www.v2ex.com'
    }

    let apiRoutes = express.Router()

    for (let k in proxyConf) {
        app.get(k, function(req, res) {
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

    app.use('/', apiRoutes)
    app.use(express.static(path.join(__dirname, 'dist')))

    const port = process.env.PORT || 5000
    app.listen(port)
    console.log('server started ' + port)
```
执行`node server.js`

　　这里关键代码为`res.setHeader('Access-Control-Allow-Origin', '*')`，我们主动给这个简单的http服务器的响应头设置了允许跨域访问，所以你可以通过axios调用`http://127.0.0.1:5000/api/now`等接口而不会出现跨域报错的问题。在 `res.json(response.data)`这个操作之前，我们可以根据请求消息`req`处理返回消息`response.data`，比如分页，达到我们想要返回的数据的目的。这样我们就模拟了一个反向代理服务器。^-^

最后，欢迎在[GitHub](https://github.com/zouhangwithsweet/v2ex-vue)留言，一起学习js，一起进步。 
