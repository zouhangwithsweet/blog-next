---
title: '国际化介绍'
date: 2021-02-04 15:35:15
tags: []
published: true
hideInList: false
feature: https://pt-starimg.didistatic.com/static/starimg/img/Sfcpx2Idb81617332835056.png
isTop: false
---

<p align="center">
  <img style="max-height: 240px" src="https://pt-starimg.didistatic.com/static/starimg/img/Sfcpx2Idb81617332835056.png">
</p>

---
# i18n ^-^ Internationalization

## 文本的国际化

```html
<script src="https://unpkg.com/vue/dist/vue.js"></script>
<script src="https://unpkg.com/vue-i18n/dist/vue-i18n.js"></script>

<div id="app">
  <p>{{ $t("message.hello") }}</p>
</div>
```

`main.ts`

```js
// If using a module system (e.g. via vue-cli),
// import Vue and VueI18n and then call Vue.use(VueI18n).
// import Vue from 'vue'
// import VueI18n from 'vue-i18n'
//
// Vue.use(VueI18n)

// Ready translated locale messages
const messages = {
  en: {
    message: {
      hello: 'hello world'
    }
  },
  ja: {
    message: {
      hello: 'こんにちは、世界'
    }
  }
}

// Create VueI18n instance with options
const i18n = new VueI18n({
  locale: 'ja', // set locale
  messages, // set locale messages
})


// Create a Vue instance with `i18n` option
new Vue({ i18n }).$mount('#app')

// Now the app has started!
```
https://kazupon.github.io/vue-i18n/started.html#html

## 数字的国际化

```js
Number.prototype.toLocaleString()

// Intl.NumberFormat
var number = 123456.789;

// 德语使用逗号作为小数点,使用.作为千位分隔符
console.log(new Intl.NumberFormat('de-DE').format(number));
// → 123.456,789

// 大多数阿拉伯语国家使用阿拉伯语数字
console.log(new Intl.NumberFormat('ar-EG').format(number));
// → ١٢٣٤٥٦٫٧٨٩

// India uses thousands/lakh/crore separators
console.log(new Intl.NumberFormat('en-IN').format(number));
// → 1,23,456.789

// 通过编号系统中的nu扩展键请求, 例如中文十进制数字
console.log(new Intl.NumberFormat('zh-Hans-CN-u-nu-hanidec').format(number));
// → 一二三,四五六.七八九

//当请求的语言不被支持,例如巴里,包含一个回滚语言印尼,这时候就会使用印尼语
console.log(new Intl.NumberFormat(['ban', 'id']).format(number));
// → 123.456,789
```

## 货币的国际化

```js
var number = 123456.789;

// 请求一个货币格式
console.log(new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(number));
// → 123.456,79 €

// the Japanese yen doesn't use a minor unit
console.log(new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(number));
// → ￥123,457

// 只显示三个有效数字
console.log(new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(number));
// → 1,23,000
```

https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Intl
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/format

## 时间的国际化与时区

https://dayjs.gitee.io/docs/zh-CN/i18n/i18n
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat

## 滴滴开源
 https://github.com/didi/di18n
