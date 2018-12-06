#  vue-cli-plugin-register-component

> 参照`@vuepress/plugin-register-component`

全局组件自动注册

## 目录结构

```
src
  - components
    - componentA
    - componentB
  - pages
    - index
      - components
        _common
          header.vue
          footer.vue
        layout.vue
        _page.vue
```

默认自动注册 `components` 目录所有组件, 其中不会注册 `_`开头的文件或者文件夹

```
# src/pages/index/components/index.js
import Vue from 'vue'
Vue.component('layout', () => import('./layout.vue'))
```

## 使用

```
# src/app.js
import 'src/components'

new Vue()
```

### 多页面

共用
```
# src/app.js
import './components'

new Vue()
```

单页
```
# src/pages/index/main.js
import './components'
// ...
```

webpack配置

```
puligns: [
  new registerComponentWebpackPlugin({
    componentDir: ['./src/components', './src/pages/index/components']
  })
]
```

## vue-register-component-webpack-plugin

vue组件自动注册

## 安装

```
> npm i stall @kuaizi/vue-cli-plugin-register-component
```

## 使用

```
# webpack.config.js
const vueRegisterComponentWebpackPlugin = require('@kuaizi/vue-cli-plugin-register-component')

export default {
  plugins: [
    new vueRegisterComponentWebpackPlugin({
      componentDir: ['./src/components', './src/entries/index/components'],
      // 全局额外组件
      components: [
        { name: 'element', path: './src/additional/element.vue' }
      ]
    })
  ]
}
```

在入口文件导入自动生成的组件注册文件

```
-src
  - main.js
  - components
    - index.js // 自动生成
```

在 `main.js` 中导入 `components/index.js`

```
# main.js
import './components'
```