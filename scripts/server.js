'use strict'

const path = require('path')
const paths = require('./paths')

module.exports = function() {
  return {
    // 由于使用react-dev-utils工具已经创建了compiler, 已经内置了更友好的输出, 
    // 所以在这个地方屏蔽掉webpackDevServer的所有编译输出
    quiet: true,
    // 关闭WebpackDevServer自己的日志，因为它们通常没什么用。
    // 这个设置仍然会显示编译警告和错误。
    // clientLogLevel: 'none',
    watchOptions: {
      ignored: new RegExp(
        `^(?!${path
          .normalize(paths.appSrc + '/')
          .replace(/[\\]+/g, '\\\\')}).+[\\\\/]node_modules[\\\\/]`,
        'g'
      )
    },
    // 由于我们正在开发一个扩展，我们需要在开发时写入文件，以便加载扩展
    writeToDisk: true
  }
}