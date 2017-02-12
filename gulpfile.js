/**
 * Created by Yangwook Ryoo on 2017.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */
'use strict'

const gulp = require('gulp')
const del = require('del')
const imagemin = require('gulp-imagemin')
const htmlmin = require('gulp-htmlmin')
const postcss = require('gulp-postcss')
const concat = require('gulp-concat')
const sourcemaps = require('gulp-sourcemaps')
const autoprefixer = require('autoprefixer')
const webpack = require('webpack')
const browserSync = require('browser-sync').create()
const packageInfo = require('./package.json')

const appConfig = {
  app: packageInfo.appPath || 'app',
  dist: 'dist',
  deploy: '../gp2-core/static/gatherplot'
}

const webpackConfig = {
  production: {
    entry: './' + appConfig.app + '/scripts/app.ts',
    output: {
      filename: '/gatherplot.min.js',
      path: appConfig.dist + '/app'
    },
    module: {
      exprContextCritical: false,
      loaders: [
        {
          test: /\.ts/,
          loaders: ['ts-loader'],
          exclude: /node_modules/
        }
      ]
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js']
    },
    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        }
      })
    ]
  },
  dev: {
    entry: './' + appConfig.app + '/scripts/app.ts',
    output: {
      filename: '/gatherplot.min.js',
      path: appConfig.dist + '/app'
    },
    devtool: 'source-map',
    module: {
      exprContextCritical: false,
      loaders: [
        {
          test: /\.ts/,
          loaders: ['ts-loader'],
          exclude: /node_modules/
        }
      ]
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js']
    }
  }
}

// showing error or done
function onBuild (done) {
  return (err, stats) => {
    if (err) {
      console.error('Error', err)
    } else {
      console.log(stats.toString({ chunks: false }))
    }
    if (done) {
      done()
    }
  }
}

gulp.task('clean', done => {
  return del([appConfig.dist + '/**'])
})

gulp.task('copyImages', done => {
  gulp.src(appConfig.app + '/images/**/*')
      .pipe(imagemin())
      .pipe(gulp.dest(appConfig.dist + '/images'))
      .on('end', done)
})

gulp.task('copyHtmls', done => {
  gulp.src(appConfig.app + '/*.html')
      .pipe(htmlmin({
        collapseWhitespace: false,
        conservativeCollapse: true,
        collapseBooleanAttributes: false,
        removeCommentsFromCDATA: false,
        removeOptionalTags: false
      }))
      .pipe(gulp.dest(appConfig.dist))
      .on('end', done)
})

gulp.task('copyTemplates', done => {
  gulp.src(appConfig.app + '/templates/**/*')
      .pipe(htmlmin({
        collapseWhitespace: false,
        conservativeCollapse: true,
        collapseBooleanAttributes: false,
        removeCommentsFromCDATA: false,
        removeOptionalTags: false
      }))
      .pipe(gulp.dest(appConfig.dist + '/templates'))
      .on('end', done)
})

gulp.task('copyVendors', done => {
  gulp.src([
    'node_modules/bootstrap/dist/**/*',
    'node_modules/font-awesome/css/font-awesome.min.css',
    'node_modules/font-awesome/fonts/**/*',
    'node_modules/core-js/client/shim.min.js',
    'node_modules/zone.js/dist/**/*',
    'node_modules/jquery/dist/jquery.min.js',
    'node_modules/angular-ui-select/select.min.*',
    'node_modules/angular-ui-grid/ui-grid.*'
  ], {
    base: 'node_modules'
  })
      .pipe(gulp.dest(appConfig.dist + '/vendor'))
      .on('end', done)
})

gulp.task('copyStyles', done => {
  gulp.src(appConfig.app + '/styles/**/*.css')
      .pipe(sourcemaps.init())
      .pipe(postcss([ autoprefixer() ]))
      .pipe(concat('gatherplot.min.css'))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(appConfig.dist + '/styles'))
      .on('end', done)
})

gulp.task('copyData', done => {
  gulp.src(appConfig.app + '/data/**/*')
      .pipe(gulp.dest(appConfig.dist + '/data'))
      .on('end', done)
})

gulp.task('copy', [
  'copyStyles',
  'copyData',
  'copyHtmls',
  'copyVendors',
  'copyImages',
  'copyTemplates'],
  done => {
    done()
  })

gulp.task('build:production', done => {
  webpack(webpackConfig.production).run(onBuild(done))
})

gulp.task('build:dev', done => {
  webpack(webpackConfig.dev).run(onBuild(done))
})

gulp.task('watchData', ['copyData'], function (done) {
  browserSync.reload()
  done()
})

gulp.task('watchVendors', ['copyVendors'], function (done) {
  browserSync.reload()
  done()
})

gulp.task('watchApp', ['build:dev'], function (done) {
  browserSync.reload()
  done()
})

gulp.task('watch', ['copy', 'build:dev'], () => {
  gulp.watch(appConfig.app + '/data/**/*', ['watchData'])
  gulp.watch(appConfig.app + '/images/**/*', ['copyImages'])
  gulp.watch(appConfig.app + '/*.html', ['copyHtmls'])
  gulp.watch(appConfig.app + '/templates/**/*', ['copyTemplates'])
  gulp.watch([
    'node_modules/bootstrap/dist/**/*',
    'node_modules/font-awesome/css/font-awesome.min.css',
    'node_modules/font-awesome/fonts/**/*',
    'node_modules/core-js/client/shim.min.js',
    'node_modules/zone.js/dist/**/*',
    'node_modules/jquery/dist/jquery.min.js',
    'node_modules/angular-ui-select/select.min.*',
    'node_modules/angular-ui-grid/ui-grid.*'
  ], ['watchVendors'])
  gulp.watch(appConfig.app + '/styles/**/*', ['copyStyles'])
  gulp.watch(appConfig.app + '/scripts/**/*', ['watchApp'])

  browserSync.init({
    server: {
      baseDir: './' + appConfig.dist + '/'
    },
    files: [
      './' + appConfig.dist + '/**/*.css',
      './' + appConfig.dist + '/**/*.png',
      './' + appConfig.dist + '/**/*.svg',
      './' + appConfig.dist + '/**/*.jpg',
      './' + appConfig.dist + '/**/*.gif',
      './' + appConfig.dist + '/**/*.html',
      './' + appConfig.dist + '/**/*.js'
    ]
  })
})

gulp.task('default', ['copy', 'build:dev'], done => {
  done()
})

gulp.task('build', ['copy', 'build:production'], done => {
  done()
})

gulp.task('copyToServer', ['default'], done => {
  gulp.src(appConfig.dist + '/**/*')
      .pipe(gulp.dest(appConfig.deploy))
      .on('end', done)
})
