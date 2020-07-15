'use strict'

process.env.NODE_ENV = 'development'

process.on('unhandledRejection', err => {
  throw err
})

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000
const HOST = process.env.HOST || '0.0.0.0'

const fs = require('fs-extra')
const paths = require('./paths')
const webpack = require('webpack')
const chalk = require('chalk')
const utilities = require('./utilities')
const WebpackDevServer = require('webpack-dev-server')
const clearConsole = require('react-dev-utils/clearConsole')

const createDevServerConfig = require('./server')

const {
  choosePort,
  prepareUrls,
  createCompiler
} = require('react-dev-utils/WebpackDevServerUtils')

const useYarn = fs.existsSync(paths.yarnLockFile)
// 判断Node.js是否运行在TTY上下文
const isInteractive = process.stdout.isTTY
const config = require('./development')

utilities.copyPublicFolder(paths)

utilities.generateManifest(paths)
// choosePort(host: string, defaultPort: number): Promise<number | null>
// defaultPort如果用户确认可以进行操作，则将Promise解析为一个或下一个可用端口。
// 如果已占用端口，并且用户拒绝使用其他端口，或者终端不是交互式的，并且无法向用户提供选择，请解决null。
// #https://www.npmjs.com/package/react-dev-utils#chooseporthost-string-defaultport-number-promisenumber--null
choosePort(HOST, DEFAULT_PORT)
  .then(port => {
    if (port === null) return

    const protocol = process.env.HTTPS === 'true' ? 'https' : 'http'
    const appName = require(paths.appPackageJson).name

    // prepareUrls(protocol: string, host: string, port: number, pathname: string = '/'): Object
    // 返回具有开发服务器的本地和远程URL的对象。将此对象传递给createCompiler()上述。
    // #https://www.npmjs.com/package/react-dev-utils#prepareurlsprotocol-string-host-string-port-number-pathname-string---object
    const urls = prepareUrls(protocol, HOST, port)
    // 创建一个配置自定义消息的webpack编译器。
    const compiler = createCompiler({ webpack, urls, useYarn, config, appName })

    const serverConfig = createDevServerConfig()

    const devServer = new WebpackDevServer(compiler, serverConfig)
    // Launch WebpackDevServer.
    devServer.listen(port, HOST, err => {
      if (err) return console.log(err)
      // 在编译消息出现前全部清除ttf上下文中的所有输出
      if (isInteractive) clearConsole()

      console.log(chalk.cyan('Starting the development server...\n'))
    })
    ;['SIGINT', 'SIGTERM'].forEach(function (sig) {
      process.on(sig, function () {
        devServer.close()
        process.exit()
      })
    })
  })
  .catch(err => {
    console.log('choosePort 异常')
    if (err && err.message) {
      console.log(err.message)
    }
    process.exit(1)
  })
