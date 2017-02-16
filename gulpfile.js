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
  deploy: '../static'
}
// TODO move appConfig to package.json; functionalize tasks;
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
      .pipe(gulp.dest(appConfig.dist + '/static/images'))
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

gulp.task('copyBootstrap', (done) => {
  gulp.src('node_modules/bootstrap/dist/**/*')
      .pipe(gulp.dest(appConfig.dist + '/static/vendor/bootstrap'))
      .on('end', done)
})

gulp.task('copyFontAwesome', (done) => {
  gulp.src('node_modules/font-awesome/**/*')
      .pipe(gulp.dest(appConfig.dist + '/static/vendor/font-awesome'))
      .on('end', done)
})

gulp.task('copyJquery', (done) => {
  gulp.src('node_modules/jquery/dist/jquery.min.js')
      .pipe(gulp.dest(appConfig.dist + '/static/vendor/jquery'))
      .on('end', done)
})

gulp.task('copyVendors',  ['copyBootstrap', 'copyFontAwesome', 'copyJquery'], (done) => {
  done()
})

gulp.task('copyData', (done) => {
  gulp.src(appConfig.app + '/data/**/*')
      .pipe(gulp.dest(appConfig.dist + '/static/data'))
      .on('end', done)
})

gulp.task('copyImagesAfterClean', ['clean'], (done) => {
  gulp.src(appConfig.app + '/images/**/*')
      .pipe(imagemin())
      .pipe(gulp.dest(appConfig.dist + '/static/images'))
      .on('end', done)
})

gulp.task('copyHtmlsAfterClean', ['clean'], (done) => {
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

gulp.task('copyBootstrapAfterClean', ['clean'], (done) => {
  gulp.src('node_modules/bootstrap/dist/**/*')
      .pipe(gulp.dest(appConfig.dist + '/static/vendor/bootstrap'))
      .on('end', done)
})

gulp.task('copyFontAwesomeAfterClean', ['clean'], (done) => {
  gulp.src('node_modules/font-awesome/**/*')
      .pipe(gulp.dest(appConfig.dist + '/static/vendor/font-awesome'))
      .on('end', done)
})

gulp.task('copyJqueryAfterClean', ['clean'], (done) => {
  gulp.src('node_modules/jquery/dist/jquery.min.js')
      .pipe(gulp.dest(appConfig.dist + '/static/vendor/jquery'))
      .on('end', done)
})

gulp.task('copyVendorsAfterClean',  ['copyBootstrapAfterClean', 'copyFontAwesomeAfterClean', 'copyJqueryAfterClean'], (done) => {
  done()
})

gulp.task('copyDataAfterClean', ['clean'], (done) => {
  gulp.src(appConfig.app + '/data/**/*')
      .pipe(gulp.dest(appConfig.dist + '/static/data'))
      .on('end', done)
})

gulp.task('copy', [
  'copyData',
  'copyHtmls',
  'copyVendors',
  'copyImages'],
  (done) => {
    done()
  })

gulp.task('copyAfterClean', [
  'copyDataAfterClean',
  'copyHtmlsAfterClean',
  'copyVendorsAfterClean',
  'copyImagesAfterClean'],
  (done) => {
    done()
  })

gulp.task('watchData', ['copyData'], (done) => {
  browserSync.reload()
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

gulp.task('default', ['copy', 'watchApp'], () => {
  gulp.watch(appConfig.app + '/data/**/*', ['watchData'])
  gulp.watch(appConfig.app + '/images/**/*', ['copyImages'])
  gulp.watch(appConfig.app + '/*.html', ['copyHtmls'])
  gulp.watch([
    'node_modules/bootstrap/dist/**/*',
    'node_modules/font-awesome/**/*',
    'node_modules/jquery/**/*'
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

gulp.task('build:production', ['clean'], (done) => {
  webpack(webpackConfig.production).run(onBuild(done))
})

gulp.task('build:dev', ['clean'], (done) => {
  webpack(webpackConfig.dev).run(onBuild(done))
})

gulp.task('build:dev', ['copyAfterClean', 'build:dev'], (done) => {
  done()
})

gulp.task('build', ['copyAfterClean', 'build:production'], (done) => {
  done()
})

gulp.task('cleanServer', (done) => {
  return del([appConfig.deploy + '/**'], {force: true})
})

gulp.task('copyHtmlsToServer', ['cleanServer'], (done) => {
  gulp.src(appConfig.dist + '/*.html')
      .pipe(gulp.dest(appConfig.deploy))
      .on('end', done)
})

gulp.task('copyStaticToServer', ['build', 'cleanServer'], (done) => {
  gulp.src(appConfig.dist + '/static/**/*')
      .pipe(gulp.dest(appConfig.deploy))
      .on('end', done)
})

gulp.task('copyToServer', ['copyStaticToServer', 'copyHtmlsToServer'], (done) => {
  done()
})
