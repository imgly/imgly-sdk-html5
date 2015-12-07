var gulp = require('gulp')
var gulpSequence = require('gulp-sequence')

gulp.task('release', function (cb) {
  var tasks = ['assets', 'sass', 'webpack', 'uglify:js', 'uglify:css']
  tasks.push(cb)
  gulpSequence.apply(this, tasks)
})
