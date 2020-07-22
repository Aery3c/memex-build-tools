'use strict'

process.env.NODE_ENV = 'production'

process.on('unhandledRejection', err => {
  throw err
})

const fs = require('fs-extra')
const chalk = require('chalk')
const path = require('path')
const paths = require('./paths')
const webpack = require('webpack')
const config = require('./production')
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages')
const utilities = require('./utilities')
const YAML = require('yamljs')

// Create the production build and print the deployment instructions
build().then(
  ({ stats, warnings }) => {
    if (warnings.length) {
      console.log(chalk.yellow('\n⚠ ... Compiled with warnings.\n'))
      console.log(warnings.join('\n\n'))
      console.log(
        'To ignore, add ' +
          chalk.cyan('// eslint-disable-next-line') +
          ' to the line before.\n'
      )
      console.log(chalk.red('... Canceling Deployment.'))
      process.exit(1)
    } else {
      console.log(chalk.green('✔ ... Compiled succesfully.'))
      deploy()
    }
  }
).catch(err => {
  console.log(chalk.red('x ... Failed to compile.\n'))
  console.log((err.message || err) + '\n')
  process.exit(1) 
})

function build () {
  console.log('\n🚜 ... Creating an optimized production build.')
  // 确保目录为空。如果目录不为空，则删除目录内容。
  // 如果该目录不存在，则会创建该目录。目录本身不会被删除。
  fs.emptyDirSync(paths.appBuildDefault)

  // 将public 目录复制到paths.appBuildDefault
  utilities.copyPublicFolder(paths)

  const compiler = webpack(config)
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        return reject(err)
      }
      const messages = formatWebpackMessages(stats.toJson({}, true))
      if (messages.errors.length) {
        return reject(new Error(messages.errors.join('\n\n')))
      }
      if (
        process.env.CI &&
        (typeof process.env.CI !== 'string' ||
          process.env.CI.toLowerCase() !== 'false') &&
        messages.warnings.length
      ) {
        console.log(
          chalk.yellow(
            '\nTreating warnings as errors because process.env.CI = true.\n' +
              'Most CI servers set it automatically.\n'
          )
        )
        return reject(new Error(messages.warnings.join('\n\n')))
      }
      return resolve({
        stats,
        warnings: messages.warnings
      })
    })
  })
}

function deploy () {
  console.log('🚀 ... Begin Deployment.')

  const manifest = YAML.load(paths.appManifest)

  fs.copySync(paths.appBuildDefault, paths.appBuild, {
    dereference: true
  })

  fs.writeFileSync(
    path.join(paths.appBuild, 'manifest.json'),
    JSON.stringify(manifest, null, 4)
  )

  console.log('🕸 ... Cleaning Up.')

  fs.remove(paths.appBuildDefault, err => {
    if (err) return console.error(err)

    console.log('👍 ... Deployment Complete.')
  })
}
