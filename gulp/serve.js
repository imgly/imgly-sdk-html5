var gulp = require('gulp')
var config = require('../config')
var webserver = require('gulp-webserver')

gulp.task('serve', function () {
  return gulp.src('.')
    .pipe(webserver({
      directoryListing: true,
      open: true,
      port: config.serverPort
    }))
})
