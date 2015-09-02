var gulp = require('gulp')
var sass = require('gulp-sass')
var sourcemaps = require('gulp-sourcemaps')
var watch = require('gulp-watch')
var handleErrors = require('./util/handleErrors')
var config = require('../config')

var watching = false

gulp.task('sass', function () {
  var task = gulp.src(config.sass.src)
    .pipe(sourcemaps.init())
    .pipe(sass(config.sass.settings))
    .on('error', handleErrors)
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(config.sass.dest))

  if (config.env === 'development' && !watching) {
    watching = true

    // Watch for changes
    watch(config.sass.allSrc, { verbose: true }, function () {
      gulp.start('sass')
    })
  }
  return task
})
