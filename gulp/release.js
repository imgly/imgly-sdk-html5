var config = require('../config')
var gulp = require('gulp')
var gulpSequence = require('gulp-sequence')

gulp.task('build', function (cb) {
  var tasks = ['clean', 'assets', 'sass', 'webpack', 'uglify:js', 'uglify:css']

  if (config.env === 'production') {
    tasks.push('rev')
  }

  tasks.push(cb)
  gulpSequence.apply(this, tasks)
})
