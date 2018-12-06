const fs = require('fs-extra')
const path = require('path')
const registerComponentWebpackPlugin = require('./register-component')

const resolveFolder = folder => fs.existsSync(path.resolve('./src/pages/', folder, 'components'))

module.exports = (api, vueConf) => {
  // compatible to kz-preset
  let componentDir = ['./src/components']
  Object.keys(vueConf.pages)
    .forEach(page => {
      if (resolveFolder(page)) {
        componentDir.push(`./src/pages/${page}/components`)
      }
    })
  api.chainWebpack(webpackConfig => {
    // add register-component plugin
    webpackConfig.plugin('register-component')
      .use(registerComponentWebpackPlugin, [{ componentDir }])
  })
}