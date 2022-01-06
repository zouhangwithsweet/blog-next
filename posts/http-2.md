---
title: '别人问你http协议，到底是想问什么？http与缓存'
date: 2018-03-19 09:15:40
tags: [http缓存,node]
published: true
hideInList: false
feature: 
isTop: false
---

---

> 上一篇文章我们讨论了TCP三次握手，http请求头、响应头，**Content-Type**字段，如何使用node控制这个字段等。我这篇文章将从http状态码入手，讨论写常用的http方法和控制缓存。

　　我们调试一个接口时，喜欢的数字就是 **200**，或者说，除了这个数字，别的我们都不喜欢。比如404,401,403,500。状态码的文章数不胜数，本质也是一个关于记忆力的东西。我简单列个常用状态码表即可，如下：
```javascript
100   Continue（继续） 请求者应当继续提出请求。 服务器返回此代码表示已收到请求的第一部分，正在等待其余部分。  
101   Switching Protocols（切换协议） 请求者已要求服务器切换协议，服务器已确认并准备切换。
----
2xx 成功
200   OK（成功）  服务器已成功处理了请求。 通常，这表示服务器提供了请求的网页。 
206   Partial Content（部分内容） 服务器成功处理了部分 GET 请求。
----
3xx 重定向
304   Not Modified（未修改） 自从上次请求后，请求的网页未修改过。 服务器返回此响应时，不会返回网页内容。 
----
4xx 客户端错误
400   Bad Request（错误请求） 服务器不理解请求的语法。 
401   Unauthorized（未授权） 请求要求身份验证。 对于需要登录的网页，服务器可能返回此响应。 
403   Forbidden（禁止） 服务器拒绝请求。
----
5xx 服务端错误
500 服务器内部错误
```
在我们自己的服务器之中，你可以任意设置状态码！**可能会有坑^-^**，看下服务端代码：
```javascript
res.statusCode = 200 // 你可以任意修改状态码，具体效果，自己实操哈，有惊喜。
res.end('我的第一个服务器')
```

　　别的码，我们先不看。我们先看 200 与 304 。当浏览器发起一个get请求时，请求成功的话，会返回一个 200 的状态，如下图:  
![image1](/images/html2_1.jpg)

　　看起来非常完美，但是每次请求都会浪费网络资源，有的东西只请求一次就够了。我们喜欢它能缓存下来，提高访问速度，节省网络资源。

> 缓存这东西，第一次必须获取到资源后，然后根据返回的信息来告诉如何缓存资源，可能采用的是强缓存，也可能告诉客户端浏览器是协商缓存，这都需要根据响应的header内容来决定的。

　　在响应头中，和缓存有关的有四个字段。  
**强缓存：**  
不会发起请求。
- cache-control(缓存控制): max-age=number(单位是秒)，它规定了一个到期时间，http1.1规范。
- expires(到期时间)，它的值是个时间的GMT格式的时间字符串，老规范。

**协商缓存：**
会发起一次请求。
> 这两组搭档都是成对出现的，即第一次请求的响应头带上某个字段（Last-Modified或者Etag），则后续请求则会带上对应的请求字段（If-Modified-Since或者If-None-Match），若响应头没有Last-Modified或者Etag字段，则请求头也不会有对应的字段。

- etag，顾名思义，它会把一个资源打上一个 “二维码”，和请求头**If-None-Match**（如果有的话），就不会重新请求，负责 返回**304**。[具体可见mdn](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Cache-Control)
- Last-Modified，也是一个时间的GMT格式的时间字符串。和请求头**If-Modified-Since**（如果有的话）对比，没变返回**304**

　　强缓存如何清除呢？
这个简单，只需要在URI后边加上query字段即可，也就是我们所谓的版本号。
![image2](/images/html2_2.jpg)

我来使用`node`尝试下：   
`config.js`
```javascript
module.export = {
    cache: {
        maxAge: 600,
        cacheControl: true,
        expires: true,
        lastModified: true,
        etag: true
    }
}
```
`catch.js`
```javascript
const conf = require('../config')
// stats为文件服务器内的文件，此处可以忽略
function refreshRes(stats, res) {
    const {maxAge, expires, cacheControl, lastModified, etag} = conf.cache
    if (expires) {
        res.setHeader('Expires', (new Date(Date.now() + maxAge * 1000)).toUTCString())
    }
    if (cacheControl) {
        res.setHeader('Cache-Control', `public, max-age=${maxAge}`)
    }
    if (lastModified) {
        res.setHeader('Last-Modified', stats.mtime.toUTCString())
    }
    if (etag) {
        const _et = new Date(stats.mtime).getTime()
        res.setHeader('ETag', `${stats.size}-${_et}`)
    }
}
module.exports = (stats, req, res) => {
    refreshRes(stats, res)
    const lastModified = req.headers['if-modified-since']
    const etag = req.headers['if-none-match']
    if (!lastModified && !etag) {
        return false
    }
    if (lastModified && lastModified !== res.getHeader('Last-Modified')) {
        return false
    }
    if (etag && etag !== res.getHeader('Etage')) {
        return false
    }
    return true
}
```

　　讲到这里我们梳理下文章内容：
- 列举了常用的状态码，2xx，3xx，4xx，5xx；其中比较特殊的304是和缓存相关的。401则提醒你，你要拦截你的请求了，在请求头加token字段了。
- 强缓存缓存与协商缓存；强缓存对应响应头：`cache-control`单位是秒,`expires`单位是时间字符串；协商缓存：Etag/If-None-Match；Last-Modified/If-Modified-Since；本质就是对比资源是否过期。**强缓存不会发起请求，协商缓存会发起。**
- 番外：结合上一遍文章，我们会发现，http的请求头和响应头和我们开发的关系极其紧密。理解http，除了要理解http常用的状态码之外，其请求实体，响应实体是我们研究的重要部分，也是我们开发的所在的部分。而且，我们会发现，`response`响应头部字段是可以控制的，我们能人为的返回不同的内容，这也就是后端同学开发接口所做的事情之一。

*图片来自知乎张云龙的回答，强烈推荐阅读*
**待续**

欢迎在[GitHub](https://github.com/zouhangwithsweet)给我留言，一起学习，一起进步。 
