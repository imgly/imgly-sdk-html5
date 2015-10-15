var gulp = require('gulp')
var handleErrors = require('./util/handleErrors')
var uglify = require('gulp-uglify')
var rename = require('gulp-rename')
var config = require('../config')

gulp.task('uglify:js', function () {
  return gulp.src(config.js.destFiles)
    .pipe(uglify({
      preserveComments: function (node, comment) {
        var isLicense = (comment.type === 'comment2' && comment.value.trim().charAt(0) === '!') ||
          comment.value.indexOf('React v') !== -1
        return isLicense
      }
    }))
    .on('error', handleErrors)
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(config.js.dest))
})
