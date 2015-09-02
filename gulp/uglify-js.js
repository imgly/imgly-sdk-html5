var gulp = require('gulp')
var handleErrors = require('./util/handleErrors')
var yuicompressor = require('gulp-yuicompressor')
var rename = require('gulp-rename')
var config = require('../config')

gulp.task('uglify:js', function () {
  return gulp.src(config.js.destFile)
    .pipe(yuicompressor({
      type: 'js'
    }))
    .on('error', handleErrors)
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(config.js.dest))
})
