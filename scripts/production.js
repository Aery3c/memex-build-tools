'use strict'

const autoprefixer = require('autoprefixer')
const webpack = require('webpack')
const eslintFormatter = require('react-dev-utils/eslintFormatter')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const path = require('path')
const paths = require('./paths')

const getClientEnvironment = require('./env')

const publicUrl = paths.publicUrlOrPath
const env = getClientEnvironment(publicUrl)

module.exports = {
  // 如果有任何错误，不要尝试继续。
  bail: true,
  // 提供mode配置选项将告诉webpack相应地使用其内置优化。
  mode: 'production',
  entry: {
    background: [paths.appBackground],
    frame: [paths.appFrameJs],
    save: [paths.appSaveJs],
    login: [paths.appLoginJs],
    receiver: [paths.appReceiverJs],
    wsmwu: [paths.appWsmwuJs]
  },
  output: {
    path: paths.appBuildDefault,
    // 这不会产生一个真正的文件。它只是WebpackDevServer在开发中提供的虚拟路径。
    // 这是JS包，包含所有入口点的代码，以及Webpack运行时。
    filename: 'js/[name].bundle.js',
    // 如果你使用代码分割，还有额外的JS块文件。
    chunkFilename: 'js/[name].chunk.js',
    publicPath: publicUrl
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
          // 因为我们开发的是firefox和chrome的扩展, 需要添加扩展的api对象为全局变量, 否则eslint会报错
          globals: ['browser', 'chrome'],
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
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
            loader: require.resolve('url-loader'),
            options: {
              limit: 10000,
              name: 'media/[name].[hash:8].[ext]'
            }
          },
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
                  compact: true
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
          {
            test: /\.scss$/,
            use: [
              {
                loader: MiniCssExtractPlugin.loader
              },
              {
                loader: require.resolve('css-loader'),
                options: {
                  importLoaders: 1,
                  modules: {
                    localIdentName: '[local]_[hash:base64:5]'
                  }
                }
              },
              {
                loader: require.resolve('postcss-loader'),
                options: {
                  // Necessary for external CSS imports to work
                  // https://github.com/facebookincubator/create-react-app/issues/2677
                  ident: 'postcss',
                  plugins: () => [
                    require('postcss-flexbugs-fixes'),
                    autoprefixer({
                      overrideBrowserslist: [
                        '>1%',
                        'last 4 versions',
                        'Firefox ESR',
                        'not ie < 9' // React doesn't support IE8 anyway
                      ],
                      flexbox: 'no-2009'
                    })
                  ]
                }
              },
              { loader: require.resolve('sass-loader') }
            ]
          },
          {
            // Exclude `js` files to keep "css" loader working as it injects
            // it's runtime that would otherwise processed through "file" loader.
            // Also exclude `html` and `json` extensions so they get processed
            // by webpacks internal loaders.
            exclude: [/\.js$/, /\.html$/, /\.json$/],
            loader: require.resolve('file-loader'),
            options: {
              name: '[name].[hash:8].[ext]'
            }
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
      chunks: ['save'],
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true
      }
    }),
    new webpack.DefinePlugin(env.stringified),
    // Moment.js is an extremely popular library that bundles large locale files
    // by default due to how Webpack interprets its code. This is a practical
    // solution that requires the user to opt into importing specific locales.
    // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
    // You can remove this if you don't use Moment.js:
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // all options are optional
      filename: './css/[name].bundle.css',
      chunkFilename: '[id].css',
      ignoreOrder: false // Enable to remove warnings about conflicting order
    })
  ],
  optimization: {
    minimizer: [new UglifyJsPlugin({
      uglifyOptions: {
        warnings: false,
        compress: {
          // Disabled because of an issue with Uglify breaking seemingly valid code:
          // https://github.com/facebookincubator/create-react-app/issues/2376
          // Pending further investigation:
          // https://github.com/mishoo/UglifyJS2/issues/2011
          comparisons: false
        },
        output: {
          comments: false,
          // Turned on because emoji and regex is not minified properly using default
          // https://github.com/facebookincubator/create-react-app/issues/2488
          ascii_only: true
        },
        sourceMap: true
      }
    })]
  },
  performance: {
    // 关闭webpack性能提示引起警告而导致编译不通过
    hints: false
  }
}
