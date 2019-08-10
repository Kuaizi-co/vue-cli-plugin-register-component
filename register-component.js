/**
 * 组件自动注册
 * 参照 https://github.com/vuejs/vuepress/blob/master/packages/%40vuepress/plugin-register-components/index.js
 */
const path = require('path')
const fs = require('fs-extra')
const globby = require('globby')
const watch = require('watch')
const pluginName = 'registerComponentWebpackPlugin'
const isString = str => typeof str === 'string'

function fileToComponentName (file) {
  return file.replace(/\/|\\/gm, '-')
    .replace(/\.vue$/, '')
    .replace(/-index$/g, '') // 去掉注册成 `chart-index`,而是`chart`
}

async function resolveComponents(dir) {
  if (!fs.existsSync(dir)) {
    return
  }
  return (await globby(['**/*.vue', '!**/_*.vue', '!_*/*.vue'], { cwd: dir }))
}

class registerComponent {
  constructor (options) {
    this.options = options
    this.watchState = {}
  }
  apply (compiler) {

    const generate = async () => {
      const { componentDir, components = [] } = this.options
      const baseDirs = Array.isArray(componentDir) ? componentDir : [componentDir]
      let componentDirLen = 0

      function importCode (name, absolutePath) {
        return `Vue.component('${name}', () => import('${absolutePath}'))`
      }

      function genImport (baseDir, file) {
        const name = fileToComponentName(file)
        const relativePath = './' + file
        const code = importCode(name, relativePath)
        return code
      }


      for (const baseDir of baseDirs) {
        if (!isString(baseDir)) {
          continue
        }
        const files = await resolveComponents(baseDir) || []
        const to = path.resolve(baseDir, 'index.js')
        let code = files.sort().map(file => genImport(baseDir, file)).join('\n')
        this.watchState[baseDir] = this.watchState[baseDir] ? this.watchState[baseDir] : false

        // New File must be trigger generate
        !this.watchState[baseDir] &&
        process.env.NODE_ENV !== 'production' &&
        watch.createMonitor(baseDir, {
          // 2000ms
          interval: 2,
          // only watch *.vue files
          filter: f => /\.vue$/g.test(f)
        }, monitor => {
          this.watchState[baseDir] = true
          monitor.on('created', () => process.nextTick(generate))
          monitor.on('remove', () => process.nextTick(generate))
        })

        if (componentDirLen === 0) {
          // components 只注册到全局组件
          code += components.map(({ name, path: absolutePath }) => importCode(name, absolutePath))
        }

        code = code.trim() === '' ? '' : 'import Vue from \'vue\'\n' + code + '\n'

        if (fs.existsSync(to) && fs.readFileSync(to, 'utf-8').trim() === code.trim()) {
          continue
        }
        if (!fs.existsSync(to)) fs.ensureFileSync(to)
        fs.writeFileSync(to, code)

        // tick
        componentDirLen++
      }
    }

    compiler.hooks.done.tap(pluginName, generate)
  }
}

module.exports = registerComponent