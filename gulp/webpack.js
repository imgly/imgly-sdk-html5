var gulp = require('gulp')
var gutil = require('gulp-util')
var webpack = require('gulp-webpack')
var config = require('../config')

gulp.task('webpack', function (cb) {
  return gulp.src(config.js.src)
    .pipe(webpack(config.webpack, null, function (err, stats) {
      if (err) throw err

      if (stats.hasErrors() && config.env === 'production') {
        throw new gutil.PluginError('webpack', stats.compilation.errors[0])
      }

      gutil.log('[webpack]', stats.toString({
        chunks: false,
        colors: true
      }))
    }))
    .pipe(gulp.dest(config.js.dest))
})
