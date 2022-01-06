---
title: '别人问你http协议，到底是想问什么？'
date: 2018-03-17 08:52:06
tags: [前端开发,http]
published: true
hideInList: false
feature: 
isTop: false
---

> 本文是阅读《图解http》之后的总结，可能会很长。PS：这本书通俗易懂，适合前端工程师阅读，是非常优秀的http入门书籍。

　　当你看到这篇文章，我默认你已经稍微了解什么是http(超文本传输协议)，url(统一资源定位符)，常用状态码等。当然这也是我们工作中每天都在接触的 **AJAX/接口/API** 背后的东西，所以面试的时候经常会被问到 **当浏览器输入一个url到页面显示在用户面前，到底发生了什么？** **你了解http吗？**（面试题）当然，网上介绍http的文章很多，也比我讲的细也比我讲的好，所以本文将结合 `node http` 模块，结合代码描述http以加深印象。

　　http是TCP/IP协议族的一部分，TCP/IP不赘述了（主要是我也不知道），简单来说http是TCP/IP应用层的一部分，这个部分里还有FTP、DNS协议等，其他三个部分 传输层、网络层、链路层不在 http 讨论范围之内。只需要知道，一个由客户端发出的请求,会经过 http协议包装一层，TCP协议包装一层，IP协议包装一层，以太网再包装一层，和发快递是一样的，这个过程称为**封装**，包装好之后就上路了（通过物理层传输），到达服务器就开始拆开这个快递，从外到内。这个过程任何人无法绝对掌握数据是否可靠，所以要通过**TCP三次握手**（面试题）
> 握手过程中使用了 TCP 的标志（flag）—— SYN（synchronize）和ACK（acknowledgement）。发送端首先发送一个带 SYN 标志的数据包给对方。接收端收到后，回传一个带有 SYN/ACK 标志的数据包以示传达确认信息。最后，发送端再回传一个带 ACK 标志的数据包，代表“握手”结束。若在握手过程中某个阶段莫名中断，TCP 协议会再次以相同的顺序发送相同的数据包。

总结一下就是：
- 客户端--发送带有SYN标志的数据包--一次握手--服务端
- 服务端--发送带有SYN/ACK标志的数据包--二次握手--客户端
- 客户端--发送带有带有ACK标志的数据包--三次握手--服务端

　　话不多说，来用 `node/v8.9.3` 造个服务器吧。我们一步一步来，这个过程可能有坑，搜索引擎和官方文档更配哦。

```javascript
// 引入 http 模块
const http = require('http')
class Server {
    constructor() {
    }

    start() {
        const serve = http.createServer((req, res) => {
            res.end('我的第一个服务器')
        })
        serve.listen(3000, '127.0.0.1',() => {
            console.log('我在 http://127.0.0.1:3000 启动了')
        })
    }
}
// 启动服务器
app = new Server()
app.start()

/** 两行代码版
 * const http = require('http')
 * http.createServer((req, res) => {
 *          res.end('我的第一个服务器')
 *     })
 *     .listen(3000)
 */

```
我们启动这个服务器
```bash
node server.js
```
打开 `http://127.0.0.1:3000` 心怀期待，一打开一看，fxxk！中文乱码了！机智的你马上想到是编码格式的问题。`node`本身不支持 **GBK**格式，但是它是支持 **UTF-8** 的。当然这个编码的问题我们先发一边，我们现在要讨论下，`http.createServer` 接收的回调函数的两个参数 `request、response`，请求实体和响应实体。我们在调试接口的过程中，观察浏览器控制台 `network` 下经会看到一个请求的 公共头，响应头，和请求头。请求头或者叫请求报文首部浏览器给我们做了大量的工作，它包含请求一个接口的重要信息，比如 formData，query 等，类似我们这个例子这样：
```
GET / HTTP/1.1
Host: 127.0.0.1:3000
Connection: keep-alive
Cache-Control: max-age=0
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8
Accept-Encoding: gzip, deflate, br
Accept-Language: zh-CN,zh;q=0.9
Cookie: _ga=GA1.1.937303312.1517920872; hibext_instdsigdipv2=1; _gid=GA1.1.34943646.1521164839
```
公共头是浏览器提供的方便查看，一般都是请求url地址，请求方法，状态码等消息；而响应头或者叫响应报文首部则会有一系列重要的首部字段。常见的如下：
```
HTTP/1.1 200 OK
Content-Type: text/plain;charset=UTF-8
Date: Sat, 17 Mar 2018 02:48:41 GMT
Connection: keep-alive
Content-Length: 24
```
响应头消息会告诉我们用了哪个版本的协议，状态吗和消息'ok'，这个不用多谈。

　　我们先从**响应头**入手，这个是我们调试接口的主要部分。发现有个字段`Content-Type`，机智的你马上想到这个或许能解决我们服务器的乱码问题。直接用我们现在这个服务器，返回的响应头是**没有Content-Type(内容类型)**这个字段的。而我们的回调函数已经拿到`response`这个对象了，就意味着我们能直接改造响应头，返回我们想要的样子。我们z在`res.end()`之前加上这么一个响应字段。
```JavaScript
res.setHeader('Content-Type', 'text/plain;charset=UTF-8')
```
这字段的含义就是，告诉浏览器用什么方式解析返回的结果。这种方式被称为[多用途Internet邮件扩展（MIME）类型](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Basics_of_HTTP/MIME_types)。
我们在post请求提交`data`也会用到`Content-Type`。比如使用axios，使用post上传数据是需要根据后端接口要更改`headers`中的`Content-Type`。**axios默认的数据格式是`Request Payload`,为JSON对象；有的接口只支持`FormData`，你需要改为 `Content-Type:application/x-www-form-urlencoded`，并且使用qs模块把你的数据格式化`qs.stringify(data)`，使之变为formData的 k1=v1&ke2=v2&k3=v3 的格式；有时候上传不同类型的数据时，请求头的`Content-Type: multipart/form-data`，也就是传统的form表单submit的效果是一样的。**

>常用的MIME类型如下：
```javascript
mimeTypes = {
    'css': 'text/css',
    'gif': 'image/gif',
    'html': 'text/html',
    'ico': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'jpg': 'image/jpeg',
    'js': 'application/javascript;charset=UTF-8',
    'pdf': 'application/pdf',
    'png': 'image/png',
    'svg': 'image/svg+xml',
    'swf': 'application/x-shockwave-flash',
    'tiff': 'image/tiff',
    'txt': 'text/plain;charset=UTF-8',
    'wav': 'audio/x-wav',
    'wma': 'audio/x-ms-wma',
    'wmv': 'video/x-ms-wmv',
    'xml': 'text/xml'
}
```
　　讲到这里我们梳理下文章内容：
- http是TCP/IP协议族的一部分，处于其应用层，是我们最为常用的传输协议；TCP三次握手。
- http最要的部分是请求报文（request），响应报文（response），报文首部也就是响应头包含着大量的信息，并有其独有的左右。
- MIME和Content-type(内容类型)。
- 番外：node启动服务器；axios，post请求注意事项，修改请求头`Content-Type`，`qs`模块格式化提交数据。

>*HTTP正确的翻译为 超文本转移协议；现在常称为 超文本传输协议*  
>*HTML为超文本标记语言*

**待续**

欢迎在[GitHub](https://github.com/zouhangwithsweet)给我留言，一起学习，一起进步。 
