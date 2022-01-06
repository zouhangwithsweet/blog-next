---
title: '别人问你http协议，到底是想问什么？方法与ajax封装'
date: 2018-03-24 10:37:39
tags: [http,ajax]
published: true
hideInList: false
feature: 
isTop: false
---
> 上一篇文章我们讨论了，状态码304和与http缓存相关的头部，**cache-control(res)、expires(res)、etag(res)、If-None-Match(req)、Last-Modified(res)、If-Modified-Since(req)**。通过上两篇文章我们会发现，http的响应报文和请求报文简直太重要了，万变不离其中；后端开发人员对http掌控会比前端人员控制大。随着前后分离后，后端同学更是把注意力放在后端的各种业务逻辑，对前端只负责接口。那么问题就来了，有时候你也许会问，为啥调试这个接口要用这种方法？为啥传递参数要这么传？为啥做前端验证这么做？本将通过这几个问题出发，讨论http方法和ajax的封装思路（**axios为例**）。当然，ajax的封装网上代码无数，本文不会重复早轮子，旨在理解其为什么这么封装，梳理和http 方法之间的联系。

　　讨论http方法之前，先回顾下http的一些特性^-^。http在1.0版本之前没有持久链接这个概念，每次请求一次就TCP三次握手建立一次连接，很浪费；所以，http1.1增加了
```javascript
Connection: keep-alive
```
　　这个字段，请求头和响应头都有。目前，对于一般浏览器来说，对于同一个域名，大多数浏览器允许同时建立6个持久连接。有时候请求很多，6个连接也忙不过来，就涉及前端性能优化了（**面试题**）。我们怎么发请求？ajax！（*双向常用的是webscokt*）我们发请求就用到http方法，本质就是告诉服务器客户端的意图，所以这些方法也是顾名思义的。
全部方法如下：
<!-- ![image](/images/http3_1.png) -->
　　常用的是`get（查）`，`post（增）`，`put（改）`，`delete（删）`*restful风格*；get和post经常会被问到有什么区别（**面试题**），知乎上有很多很回答讲的很细致，我在这里只做个简单对比。
- `get`传递参数使用`?k=v&k1&=v2`这中直接在请求链接后边加参数值的形式，有的时候需要使用`encodeURIComponent`函数转义一下字符。
- `post`参数一般有三种`formData(qs转参数),Request Payload`和上传文件用的`multipart/form-data`
我们封装ajax其实就是参数传递的差别。这些方法里边有个比较特殊的方法`options`，这个方法经常会出现在`CORS`跨域请求之前。其目的是判断资源服务器支持哪些请求方法，当然简单请求不会触发[`CORS`预检](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS)。

　　**ajax**也不用我多说，但是面试经常让手写原生ajax。以`XMLHttpRequest`来来来一起来一遍：
```javascript
function callBack () {
  console.log(this.responseText)
}

let xhr = new XMLHttpRequest()
xhr.onload = callBack
xhr.open(method, url, true)
xhr.send()
```
`fetch`版
```javascript
let myHeaders = new Headers()

let myInit = { method: 'GET',
               headers: myHeaders,
               mode: 'cors',
               cache: 'default' }

fetch('flowers.jpg',myInit)
    .then(function(response) {
    return response.blob()
    })
    .then(function(myBlob) {
    var objectURL = URL.createObjectURL(myBlob)
    myImage.src = objectURL
    })
```
当然这对象和方法有很多的属性和方法，我们也不是经常用原生请求，处理起来比较费劲还有一定的兼容问题，知道是那个意思就行，学有余力查MDN研究即可。我们使用当下最为流行的ajax库`axios`为例，来封装一个功能强大的，属于自己定制的ajax，看看http方法为这么这么封装。
取“一段”`axios`，搭配一份`qs`模块：
```javascript
import axios from 'axios'
import qs from 'qs'
//生成一个axios实例，它有个一个request方法。
const service = axios.create({
    baseURL: process.env.MOCK_URL,// 结合node全局变量做dev和build分割
    timeout: 180000
})

/**
 * 通用request封装
 * @param method
 * @param url
 * @param data
 * @param config
 * @returns {Promise}
 */
const request = (method, url, data, config = {}) => {
    const options = Object.assign({}, config, {
        url,
        method,
        data
    })
    options.headers = options.headers || {}
    return new Promise((resolve, reject) => { // 使用promise给返回结果套一层壳子
        service.request(options) // 实例发请求
            .then(res => {
                const data = res.data
                const status = res.status
                if (status === 200) {
                    resolve(data)
                }
                resolve(data) // 这里的处理不是很严谨
            }).catch(res => {
                reject(res)
            })
    })
}
// 暴露外部方法
export const ajax = {
    get(url, config) {
        return request('get', url, null, config)
    },
    delete(url, data, config) {
        return request('delete', url, data, config)
    },
    head(url, config) {
        return request('head', url, null, config)
    },
    post(url, data, config = {}) {
        if (!config.headers) {
            // 设置请求头参数
            config.headers = {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            }
        }
        return request('post', url, qs.stringify(data), config)
    },
    put(url, data, config = {}) {
        // 设置请求头参数
        config.headers = {
            'Content-Type': 'application/json; charset=UTF-8'
        }
        return request('put', url, data, config)
    },
    patch(url, data, config) {
        return request('path', url, qs.stringify(data), config)
    },
    setCommonHeader(key, value) {
        service.defaults.headers.common[key] = value
    }
}
```
有的时候我们需要token，或者cookies鉴权，其实都是在请求头里边加点东西而已。axios可以通过拦截器来操作。
```JavaScript
service.interceptors.request.use(config => {
      // Do something before request is sent
      if (store.getters.token) {
        config.headers['X-Token'] = ''// 让每个请求携带token-- ['X-Token']为自定义key 请根据实际情况自行修改
      }
      return config
}, error => {
      // Do something with request error
      console.log(error) // for debug
      Promise.reject(error)
})
```
有时候我们登录时间太长了要重新登录，就是判断response里边的东西，做个重定向。
```javascript
service.interceptors.response.use(function(response) {
    //根据条件重定向
    if (response.headers.loginstate === 'expired') {
        // router.push({ path: '/login' })
    }
    return response
}, function(error) {
    return Promise.reject(error)
})
```

*封装代码参考vue-admin项目*
**待续**

欢迎在[GitHub](https://github.com/zouhangwithsweet)给我留言，一起学习，一起进步。 
