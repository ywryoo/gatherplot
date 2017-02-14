/**
 * Created by Yangwook Ryoo on 2017.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

 // https://github.com/angular/angular2-seed/blob/master/webpack.config.js

const webpack = require('webpack')
const path = require('path')
const packageInfo = require('./package.json')

const appConfig = {
  app: packageInfo.appPath || 'app',
  dist: 'dist',
  deploy: '../gp2-core/static/gatherplot'
}

const prodConfig = {
  entry: './' + appConfig.app + '/scripts/main.browser.ts',
  output: {
    filename: '/gatherplot.min.js',
    path: appConfig.dist
  },
  resolve: {
    extensions: [ '.ts', '.js' ],
    modules: [ path.resolve(__dirname, 'node_modules') ]
  },
  module: {
    loaders: [
      // .ts files for TypeScript
      {
        test: /\.ts$/,
        loaders: [
          'awesome-typescript-loader',
          'angular2-template-loader',
          'angular2-router-loader',
        ]
      },
      {
        test: /\.css$/,
        loaders: ['to-string-loader', 'css-loader', 'postcss-loader']
      },
      { test: /\.html$/, loader: 'raw-loader' }
    ]
  },
  plugins: [
    new webpack.ContextReplacementPlugin(
      /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
      __dirname
    ),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  ],
  devtool: false
}
const devConfig = {
  entry: './' + appConfig.app + '/scripts/main.browser.ts',
  output: {
    filename: '/gatherplot.min.js',
    path: appConfig.dist
  },
  resolve: {
    extensions: [ '.ts', '.js' ],
    modules: [ path.resolve(__dirname, 'node_modules') ]
  },
  module: {
    loaders: [
      // .ts files for TypeScript
      {
        test: /\.ts$/,
        loaders: [
          'awesome-typescript-loader',
          'angular2-template-loader',
          'angular2-router-loader',
          'source-map-loader'
        ]
      },
      {
        test: /\.css$/,
        loaders: ['to-string-loader', 'css-loader', 'postcss-loader']
      },
      { test: /\.html$/, loader: 'raw-loader' }
    ]
  },
  plugins: [
    new webpack.ContextReplacementPlugin(
      /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
      __dirname
    )
  ],
  devtool: 'eval-cheap-module-source-ma'
}

// Our Webpack Defaults
const defaultConfig = {

}

module.exports = {
  production: prodConfig,
  dev: devConfig
}
