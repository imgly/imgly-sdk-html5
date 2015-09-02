var gulp = require('gulp')
var sassLint = require('gulp-9e-sass-lint')
var watch = require('gulp-watch')
var config = require('../config')

var watching = false

gulp.task('sass-lint', function () {
  var task = gulp.src(config.sass.allSrc)
    .pipe(sassLint())
    .pipe(sassLint.reporter('default', {
      breakOnError: config.env === 'production'
    }))

  if (config.env === 'development' && !watching) {
    watching = true
    // Watch for changes
    watch(config.sass.allSrc, { verbose: true }, function () {
      gulp.start('sass-lint')
    })
  }

  return task
})
