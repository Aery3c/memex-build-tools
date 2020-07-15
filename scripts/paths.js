'use strict'

const path = require('path')
const fs = require('fs')

/**
 * @description appDirectory = 扩展应用程序的根目录
 * 1. 正式编译环境下 node进程的工作目录只可能在扩展程序的根目录
 * */
const appDirectory = fs.realpathSync(process.cwd())
const resolveApp = relativePath => path.resolve(appDirectory, relativePath)

module.exports = {
  appPackageJson: resolveApp('package.json'),
  appBuildDefault: resolveApp('_build/_dev'),
  appPublic: resolveApp('public'),
  appBackground: resolveApp('src/containers/background/background'),
  appNodeModules: resolveApp('node_modules'),
  yarnLockFile: resolveApp('yarn.lock'),
  appManifest: resolveApp('src/manifest.yml'),
  appFrameJs: resolveApp('src/containers/save/frame/frame'),
  appSaveHTML: resolveApp('src/containers/save/save.html'),
  appSrc: resolveApp('src'),
  appSaveJs: resolveApp('src/containers/save/save'),
  appLoginJs: resolveApp('src/containers/auth/login')
}
