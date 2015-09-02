var gulp = require('gulp')
var standard = require('gulp-standard')
var watch = require('gulp-watch')
var config = require('../config')

var watching = false

gulp.task('standard', function () {
  var task = gulp.src(config.js.standardSrc)
    .pipe(standard())
    .pipe(standard.reporter('default', {
      breakOnError: config.env === 'production'
    }))
    .pipe(gulp.dest(config.js.dest))

  if (config.env === 'development' && !watching) {
    watching = true
    // Watch for changes
    watch(config.js.standardSrc, { verbose: true }, function () {
      gulp.start('standard')
    })
  }

  return task
})
