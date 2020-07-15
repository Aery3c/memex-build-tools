'use strict'
const path = require('path')
const paths = require('./paths')
const eslintFormatter = require('react-dev-utils/eslintFormatter')
const HtmlWebpackPlugin = require('html-webpack-plugin')
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
    filename: 'js/[name].bundle.js'
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
          }
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appSaveHTML,
      filename: 'save.html',
      chunks: ['save']
    })
  ]
}
