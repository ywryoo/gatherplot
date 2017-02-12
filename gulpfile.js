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
const webpack = require('webpack')
const browserSync = require('browser-sync').create()
const packageInfo = require('./package.json')
const webpackConfig = require('./webpack.config')
const appConfig = {
  app: packageInfo.appPath || 'src',
  dist: 'dist',
  deploy: '../gp2-core/static/gatherplot'
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

gulp.task('clean', (done) => {
  return del([appConfig.dist + '/**'])
})

gulp.task('copyImages', (done) => {
  gulp.src(appConfig.app + '/images/**/*')
      .pipe(imagemin())
      .pipe(gulp.dest(appConfig.dist + '/images'))
      .on('end', done)
})

gulp.task('copyHtmls', (done) => {
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

gulp.task('copyVendors', (done) => {
  gulp.src([
    'node_modules/bootstrap/dist/**/*',
    'node_modules/font-awesome/css/font-awesome.min.css',
    'node_modules/font-awesome/fonts/**/*',
    'node_modules/jquery/dist/jquery.min.js'
  ], {
    base: 'node_modules'
  })
      .pipe(gulp.dest(appConfig.dist + '/vendor'))
      .on('end', done)
})

gulp.task('copyData', (done) => {
  gulp.src(appConfig.app + '/data/**/*')
      .pipe(gulp.dest(appConfig.dist + '/data'))
      .on('end', done)
})

gulp.task('copyStyles', (done) => {
  gulp.src(appConfig.app + '/styles/**/*')
      .pipe(gulp.dest(appConfig.dist + '/styles'))
      .on('end', done)
})

gulp.task('copy', [
  'copyData',
  'copyStyles',
  'copyHtmls',
  'copyVendors',
  'copyImages'],
  (done) => {
    done()
  })

gulp.task('watchData', ['copyData'], (done) => {
  browserSync.reload()
  done()
})

gulp.task('watchStyles', ['copyStyles'], (done) => {
  browserSync.stream()
  done()
})

gulp.task('watchVendors', ['copyVendors'], (done) => {
  browserSync.reload()
  done()
})

gulp.task('watchApp', () => {
  webpack(webpackConfig.dev).watch({ignored: /node_modules/},
    (err, stats) => {
      if (err) console.error(err)
    }
  )
})

gulp.task('watch', ['copy', 'watchApp'], () => {
  gulp.watch(appConfig.app + '/data/**/*', ['watchData'])
  gulp.watch(appConfig.app + '/styles/**/*', ['watchStyles'])
  gulp.watch(appConfig.app + '/images/**/*', ['copyImages'])
  gulp.watch(appConfig.app + '/*.html', ['copyHtmls'])
  gulp.watch([
    'node_modules/bootstrap/dist/**/*',
    'node_modules/font-awesome/css/font-awesome.min.css',
    'node_modules/font-awesome/fonts/**/*',
    'node_modules/jquery/dist/jquery.min.js'
  ], ['watchVendors'])

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

gulp.task('build:production', (done) => {
  webpack(webpackConfig.production).run(onBuild(done))
})

gulp.task('build:dev', (done) => {
  webpack(webpackConfig.dev).run(onBuild(done))
})

gulp.task('default', ['copy', 'build:dev'], (done) => {
  done()
})

gulp.task('build', ['copy', 'build:production'], (done) => {
  done()
})

gulp.task('copyToServer', ['default'], (done) => {
  gulp.src(appConfig.dist + '/**/*')
      .pipe(gulp.dest(appConfig.deploy))
      .on('end', done)
})
