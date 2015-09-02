var gulp = require('gulp')
var config = require('../config')
var browserSync = require('browser-sync')

gulp.task('serve', function () {
  return browserSync({
    notify: false,
    open: false,
    server: {
      baseDir: ['.'],
      middleware: function (req, res, next) {
        res.setHeader('Content-Security-Policy', "default-src https: 'self'; connect-src https: 'self'; font-src https: 'self' data:; frame-src https: 'self'; img-src https: 'self' data:; media-src https: 'self'; object-src https: 'self'; script-src https: 'self'; style-src https: 'self' 'unsafe-inline';")
        next()
      }
    },
    ports: {
      min: config.serverPort
    }
  })
})
