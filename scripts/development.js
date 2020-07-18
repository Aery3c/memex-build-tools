'use strict'
const webpack = require('webpack')
const eslintFormatter = require('react-dev-utils/eslintFormatter')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const WatchModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin')
const ChromeExtensionReloader = require('webpack-chrome-extension-reloader')

const path = require('path')
const paths = require('./paths')

const getClientEnvironment = require('./env')

// `publicUrl` is just like `publicPath`, but we will provide it to our app
// as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
// Omit trailing slash as %PUBLIC_PATH%/xyz looks better than %PUBLIC_PATH%xyz.
const publicUrl = paths.publicUrlOrPath

// Get environment variables to inject into our app.
const env = getClientEnvironment(publicUrl)

const imageInlineSizeLimit = parseInt(
  process.env.IMAGE_INLINE_SIZE_LIMIT || '10000'
)

module.exports = {
  devtool: 'cheap-module-source-map',
  // 提供mode配置选项将告诉webpack相应地使用其内置优化。
  mode: 'development',

  entry: {
    background: [paths.appBackground],
    frame: [paths.appFrameJs],
    save: [paths.appSaveJs],
    login: [paths.appLoginJs]
  },
  output: {
    path: paths.appBuildDefault,
    filename: 'js/[name].bundle.js',
    chunkFilename: 'js/[name].chunk.js',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: require.resolve('eslint-loader'),
        options: {
          // 外部应用调用需要
          eslintPath: require.resolve('eslint'),
          // 使用create-react-app 内置的格式化
          formatter: eslintFormatter,
          baseConfig: {
            extends: [require.resolve('eslint-config-react-app')]
          },
          // ignore-false禁止使用.eslintignore，ignorePath和ignorePattern（默认值：true）。对应于--no-ignore。
          // ignore: false,
          // 使用外部的.eslintignore文件, 由于我们集成了firefox的Readability第三方库且这个库不是安装在node_modules当中, 在编译过程中会接受eslint的检查, 但我们不希望这种情况发生
          ignorePath: path.join(__dirname, '../.eslintignore'),
          // 禁用使用外部的.eslintrc, 因为外部的配置文件通常是给编辑器使用, 内部编译坚持使用自己的规则
          useEslintrc: false
        },
        include: paths.appSrc
      },
      {
        oneOf: [
          // Process JS with Babel.
          {
            test: /\.js$/,
            include: paths.appSrc,
            use: [
              {
                loader: require.resolve('babel-loader'),
                options: {
                  babelrc: false,
                  presets: [
                    require.resolve('babel-preset-react-app')
                  ],
                  plugins: [
                    require.resolve('babel-plugin-styled-components')
                  ],
                  // 这是webpack“Babel -loader”的一个特性(不是Babel本身)。
                  // 它在./node_modules/.cache/babel-loader中启用缓存结果
                  // 目录，以便更快地重新构建。
                  cacheDirectory: true
                }
              },
              {
                loader: require.resolve('stylelint-custom-processor-loader'),
                options: {
                  // #https://github.com/emilgoldsmith/stylelint-custom-processor-loader/blob/master/README.md#configpath
                  configPath: path.join(__dirname, '../.stylelintrc'),
                  // #https://github.com/emilgoldsmith/stylelint-custom-processor-loader#emitwarning-default-false
                  // 如果此选项设置为真，则始终返回警告。如果您正在使用热模块替换，您可能希望在开发中启用它，否则当出现stylelint错误时，更新将被跳过。
                  emitWarning: false
                }
              }
            ]
          },
          // "url" loader works like "file" loader except that it embeds assets
          // smaller than specified limit in bytes as data URLs to avoid requests.
          // A missing `test` is equivalent to a match.
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
            loader: require.resolve('url-loader'),
            options: {
              limit: imageInlineSizeLimit,
              name: 'static/media/[name].[hash:8].[ext]'
            }
          },
          // "file" loader makes sure those assets get served by WebpackDevServer.
          // When you `import` an asset, you get its (virtual) filename.
          // In production, they would get copied to the `build` folder.
          // This loader doesn't use a "test" so it will catch all modules
          // that fall through the other loaders.
          {
            loader: require.resolve('file-loader'),
            // Exclude `js` files to keep "css" loader working as it injects
            // its runtime that would otherwise be processed through "file" loader.
            // Also exclude `html` and `json` extensions so they get processed
            // by webpacks internal loaders.
            exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
            options: {
              name: 'static/media/[name].[hash:8].[ext]'
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appHtml
    }),
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appSaveHTML,
      filename: 'save.html',
      chunks: ['save']
    }),
    // 向工厂函数添加模块名称，这样它们就会出现在浏览器分析器中。
    new webpack.NamedModulesPlugin(),
    // 使JS代码可以使用一些环境变量，例如:
    // 如果(process.env。NODE_ENV === 'development'){…}。见“。env.js”。
    new webpack.DefinePlugin(env.stringified),
    // This is necessary to emit hot updates (currently CSS only):
    new webpack.HotModuleReplacementPlugin(),
    // Watcher doesn't work well if you mistype casing in a path so we use
    // a plugin that prints an error when you attempt to do this.
    // See https://github.com/facebookincubator/create-react-app/issues/240
    new CaseSensitivePathsPlugin(),
    // If you require a missing module and then `npm install` it, you still have
    // to restart the development server for Webpack to discover it. This plugin
    // makes the discovery automatic so you don't have to restart.
    // See https://github.com/facebookincubator/create-react-app/issues/186
    new WatchModulesPlugin(paths.appNodeModules),
    // #https://github.com/rubenspgcavalcante/webpack-chrome-extension-reloader
    new ChromeExtensionReloader({
      reloadPage: true,
      entries: {
        contentScript: ['save.bundle.js', 'frame.bundle.js']
      }
    })
  ],
  // 在开发期间关闭性能提示，因为我们不做任何提示
  // 为了提高速度而进行的分割或缩小。这些警告成为麻烦。
  performance: {
    hints: false
  }
}
