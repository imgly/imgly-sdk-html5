var gulp = require('gulp')
var handleErrors = require('./util/handleErrors')
var yuicompressor = require('gulp-yuicompressor')
var rename = require('gulp-rename')
var config = require('../config')

gulp.task('uglify:css', function () {
  return gulp.src(config.sass.destFiles)
    .pipe(yuicompressor({
      type: 'css'
    }))
    .on('error', handleErrors)
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(config.sass.dest))
})
