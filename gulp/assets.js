var gulp = require('gulp')
var changed = require('gulp-changed')
var watch = require('gulp-watch')
var config = require('../config')

var watching = false
gulp.task('assets', function () {
  var task = gulp.src(config.assets.src)
    .pipe(changed(config.assets.dest)) // Ignore unchanged files
    .pipe(gulp.dest(config.assets.dest))

  // Only watch in development
  if (config.env === 'development' && !watching) {
    watching = true
    watch(config.assets.src, { verbose: true }, function () {
      gulp.start('assets')
    })
  }

  return task
})
