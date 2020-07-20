'use strict'

const path = require('path')
const fs = require('fs')
const getPublicUrlOrPath = require('react-dev-utils/getPublicUrlOrPath')

/**
 * @description appDirectory = 扩展应用程序的根目录
 * 1. 正式编译环境下 node进程的工作目录只可能在扩展程序的根目录
 * */
const appDirectory = fs.realpathSync(process.cwd())
const resolveApp = relativePath => path.resolve(appDirectory, relativePath)

const publicUrlOrPath = getPublicUrlOrPath(
  process.env.NODE_ENV === 'development',
  require(resolveApp('package.json')).homepage,
  process.env.PUBLIC_URL
)
module.exports = {
  appPackageJson: resolveApp('package.json'),
  appBuildDefault: resolveApp('_build/_dev'),
  appPublic: resolveApp('public'),
  appHtml: resolveApp('public/index.html'),
  appBackground: resolveApp('src/containers/background/background'),
  appNodeModules: resolveApp('node_modules'),
  yarnLockFile: resolveApp('yarn.lock'),
  appManifest: resolveApp('src/manifest.yml'),
  appFrameJs: resolveApp('src/containers/save/frame/frame'),
  appSaveHTML: resolveApp('src/containers/save/save.html'),
  appSrc: resolveApp('src'),
  appSaveJs: resolveApp('src/containers/save/save'),
  appLoginJs: resolveApp('src/containers/auth/login'),
  appReceiverJs: resolveApp('src/containers/auth/receiver'),
  appWsmwuJs: resolveApp('src/containers/wsmwu/wsmwu.js'),
  publicUrlOrPath
}
