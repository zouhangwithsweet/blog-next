---
title: '拖拽类，一段代码的进化史'
date: 2018-04-24 16:50:54
tags: [js/ES6,prototype/class]
published: true
hideInList: false
feature: 
isTop: false
---
> 最开始学习面向对象编写代码的时候，自己是个菜鸡，2018年了，还是个菜鸡，废话不多说。当年面向对象写法的第一个示例就是实现一个拖拽的类的编写，使用的是构造函数的prototype属性，为实例对象提供方法。最近的工作也是和拖拽类打交道，这段代码也逐渐的进化并应用到多个使用场景，也从prototype的写法进化为ES6 class。

实现拖拽的原理十分简单相信大家也都是烂熟于心，**核心就是元素的初始坐标，和鼠标移动终止位置的坐标差值，其中要去除点击位置到元素的左、上边界。**

es5 prototype的写法大概是这样的
```JavaScript
function Drag(id){
    var _this=this;
    this.disx=0;
    this.disy=0;
    this.oDiv=document.getElementById(id);
    this.oDiv.onmousedown=function(ev){
        _this.fnDown(ev);
        // 阻止冒泡
        return false;
    }
};
// 点击
Drag.prototype.fnDown=function (ev){
    var _this=this;
    // 兼容IE
    var oev=ev||event;
    // 记录点击位置到元素上边和左边的距离
    this.disx=oev.clientX-this.oDiv.offsetLeft;
    this.disy=oev.clientY-this.oDiv.offsetTop;
    document.onmousemove=function(ev){
        _this.fnMove(ev);
    };
    document.onmouseup=function(ev){
        _this.fnUp(ev);
    };
};
// 移动
Drag.prototype.fnMove=function (ev){
    var oev=ev||event;
    // 计算坐标的差值
    this.oDiv.style.left=oev.clientX-this.disx+"px";
    this.oDiv.style.top=oev.clientY-this.disy+"px";
};
// 销毁绑定事件
Drag.prototype.fnUp=function (){
    document.onmousemove=null;
    document.onmouseup=null;
};
```
有几个注意点

- 鼠标`mousemove，moveuseup`事件是在点击事件之后绑定的，鼠标抬起后要销毁事件，不然这两个时间一直存在，导致元素跟着鼠标走。
- `mousemove，moveuseup`事件的绑定最好绑定在`window`或`document`上，因为直接绑定在拖拽元素上会出现，鼠标太快超出元素大小，停止移动的现象。
- 这里的事件绑定使用的是dom1级事件，直接给属性赋值，老代码了不推荐。

现在肯定是要用ES6 class来实现，代码更清晰：
```JavaScript
class Drag {
    constructor(el) {
        this.el = el
        // 拖拽信息
        this.mouse = {}
        this.mouse.init = false
        this.init()
        this.initDrag()
    }

    //绝对定位初始化
    init() {
        this.el.style.position = 'absolute'
        this.el.style.top = `${this.el.offsetTop}px`
        this.el.style.left = `${this.el.offsetLeft}px`
    }

    // 拖动初始化
    initDrag() {
        this.el.addEventListener('mousedown', e => {
            if (/input|textarea/.test(e.target.tagName.toLowerCase())) return
            this.mouse.init = true
            this.mouse.offsetX = e.pageX - this.el.offsetLeft
            this.mouse.offsetY = e.pageY - this.el.offsetTop
            // 建立一个函数引用，进行销毁
            this.moveHandler = this.move.bind(this)
            this.upHanler = this.up.bind(this)
            window.addEventListener('mousemove', this.moveHandler)
            window.addEventListener('mouseup', this.upHanler)
        })
    }
    // 拖动
    move(e) {
        if (!this.mouse.init) {
            return
        }
        this.el.style.left = e.pageX - this.mouse.offsetX  + 'px'
        this.el.style.top = e.pageY - this.mouse.offsetY + 'px'
    }
    // 松开
    up() {
        this.mouse.init = false
        console.log('ok')
        window.removeEventListener('mousemove', this.moveHandler)
        window.removeEventListener('mouseup', this.upHanler)
    }
}
```
和老代码相比有几个升级优化的部分

- 主要给元素添加`position:absolute`，初始化他的位置，更合理。
- 使用了`e.pageX,e.pageY`,获取元素相对视口的位置可用`getBoundingClientRect`
![image1](https://mdn.mozillademos.org/files/15087/rect.png)
- 当元素为`input`或者`textarea`时不能拖动。
- 使用dom2级事件进行事件监听和接触监听

**注意**  
在class内默认严格模式，一定要主要上下文的`this`指向，直接给`window`绑定一个方法，例如`window.addEventListener('mousemove', this.move)`此时的监听函数的`this`是指向`window`的，这显然无法实现拖动，所以要`this.move.bind(this)`绑定到实例本身。  
我为什么要建立一个函数引用呢？
```javascript
// 建立一个函数引用，进行销毁
this.moveHandler = this.move.bind(this)
this.upHanler = this.up.bind(this)
```
**原因是因为每调用一次`Function.bind`就会创建一个新的函数**，直接调用  
`window.removeEventListener('mousemove', this.move.bind(this))`  
是无法销毁你监听事件的，因为这已经是两个函数了，只是内容一样而已。
```javascript
function a () {console.log(1)}

let b = a.bind(null)
let c = a.bind(null)
b == a //false
c == b //false
```
**ES5中，坚持一个原则：this永远指向最后调用它的那个对象！！！**  
**ES6中，箭头函数没有this，它会向父级查找离它最近的一个非箭头函数的this，找不到就是undefined**  
**普通函数的this会指向window，严格模式下指向undefined**  

有几种改变`this的方法`

- new 方法
- 箭头函数
- apply,call,bind  

关于`this`不在一一赘述了，网上大神比我讲的好。下面说下，拖拽类的使用场景：

- 实现一个`vue`拖拽指令`v-drag`，简单易用适合不复杂场景
```javascript
export default {
    name: 'drag',
    bind: function(el) {
        var offsetX = 0;
        var offsetY = 0;

        function move(e) {
            el.style.left = e.pageX - offsetX + 'px';
            el.style.top = e.pageY - offsetY + 'px';
        }

        function up() {
            window.removeEventListener('mousemove', move);
            window.removeEventListener('mouseup', up);
        }

        function down(e) {
            if (/input|textarea/.test(e.target.tagName.toLowerCase())) return;

            offsetX = e.pageX - el.offsetLeft;
            offsetY = e.pageY - el.offsetTop;
            window.addEventListener('mousemove', move);
            window.addEventListener('mouseup', up);
        }

        el.addEventListener('mousedown', down)
    }
}

```
- 结合`iscroll5`实现拖拽滚动，`better-scroll`应该也可以
```javascript
handleMouseMove(e) {
    if (!this.mouse.init) {
        return
    }
    const deltaX = this.mouse.startX - e.pageX
    const deltaY = this.mouse.startY - e.pageY
    this.mouse.cord = [deltaX > 0, deltaY > 0]
    this.myScroll.scrollTo(this.mouse.scrollerX - deltaX, this.mouse.scrollerY - deltaY)
},
handleMouseDown(e) {
    // 特殊区域处理
    const content = this.$refs.scroller.$el
    if (!e.target.parentNode.contains(content)) return
    if (e.target.contains(content)) return
    if (e.target && e.target.nodeName === 'CANVAS') return
    if (!this.myScroll) return
    this.mouse.init = true
    this.direction = true
    this.mouse.startX = e.pageX
    this.mouse.startY = e.pageY
    this.mouse.scrollerX = this.myScroll.x
    this.mouse.scrollerY = this.myScroll.y
},
handleMouseUp(e) {
    const content = this.$refs.scroller.$el
    if (!e.target.parentNode.contains(content)) return
    if (e.target.contains(content)) return
    this.mouse.init = false
    this.direction = false
    let deltaX = this.myScroll.x - START_X
    let deltaY = this.myScroll.y - START_Y
    this.saveScrollerConfig({
        x: deltaX,
        y: deltaY
    })
}
```
- 拖拽进度条等等。

从ES5到ES6，从prototype到class，一段代码的进化史。

**HTML5拖放drag，drop待续**
欢迎在[GitHub](https://github.com/zouhangwithsweet)给我留言，一起学习，一起进步。