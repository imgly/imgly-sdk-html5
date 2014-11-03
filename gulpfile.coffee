es              = require 'event-stream'
gulp            = require 'gulp'
fs              = require 'fs'
source          = require 'vinyl-source-stream'
browserify      = require 'browserify'
watchify        = require 'watchify'
coffeeify       = require 'coffeeify'
runSequence     = require 'run-sequence'
gulpLoadPlugins = require 'gulp-load-plugins'
browserSync     = require 'browser-sync'
reload          = browserSync.reload
$               = gulpLoadPlugins()
isProduction    = false

###############################################################################
# constants
###############################################################################

EXTERNALS         = [
  { require: "jquery", expose: 'jquery' }
  { require: "q", expose: 'q' }
  { require: "spectrum", expose: 'spectrum' }
]

SERVER_PORT       = 8000

###############################################################################
# clean
###############################################################################

gulp.task 'clean', ->
  gulp.src("./build").pipe($.clean())

###############################################################################
# compass
###############################################################################

gulp.task 'compass', ->
  gulp.src(["./sass/imgly.sass"])
    .pipe($.plumber())
    .pipe($.compass(
      css: "build",
      sass: "sass"
    ))
    .on('error', $.notify.onError({ onError: true }))
    .on('error', $.util.log)
    .on('error', $.util.beep)
    .pipe(gulp.dest("./build"))
    .pipe($.if(!isProduction, reload({ stream: true, once: true })))

###############################################################################
# copy
###############################################################################

gulp.task 'copy', ->
  gulp.src("./assets/**")
    .pipe($.plumber())
    .pipe(gulp.dest("./build/assets"))
    .pipe($.if(!isProduction, reload({ stream: true, once: true })))

###############################################################################
# uglify:all
###############################################################################

gulp.task 'uglify:all', ->
  gulp.src('./build/*.js')
    .pipe($.plumber())
    .pipe($.uglify())
    .pipe($.rename({ suffix: '.min' }))
    .pipe(gulp.dest("./build"))

###############################################################################
# cssmin:minify
###############################################################################

gulp.task 'cssmin:minify', ->
  gulp.src('./build/stylesheets/*.css')
    .pipe($.plumber())
    .pipe($.cssmin())
    .pipe($.rename({ suffix: '.min' }))
    .pipe(gulp.dest("./build/stylesheets"));

###############################################################################
# Browserify
###############################################################################

requireExternals = (bundler, externals) ->
  for external in externals
    if external.expose?
      bundler.require external.require, expose: external.expose
    else
      bundler.require external.require

gulp.task 'watchify', ->
  console.log 'watchify'
  entry = "./coffeescripts/imgly.coffee"
  output = 'imgly.js'
  if isProduction
    bundler = browserify(entry)
  else
    bundler = watchify(entry)
  bundler.transform coffeeify
  requireExternals bundler, EXTERNALS

  rebundle = ->
    console.log "rebundle"
    stream = bundler.bundle()
    stream.on 'error', $.notify.onError({ onError: true })
      .pipe($.plumber())
      .pipe(source(output))
      .pipe(gulp.dest("./build"))
      .pipe($.if(!isProduction, reload({ stream: true, once: true })))
    stream

  bundler.on 'update', rebundle
  rebundle()

###############################################################################
# watch
###############################################################################

gulp.task 'watch', ->
  gulp.watch "./sass/**/*.{css,scss,sass}", ['build:stylesheets']
  gulp.watch "./assets/**/*", ['copy']

###############################################################################
# serve
###############################################################################
gulp.task 'serve', ->
  browserSync({
    notify: false,
    server: {
      baseDir: ["."]
    },
    ports: {
      min: SERVER_PORT
    }
  })
  console.log "Point your browser to #{SERVER_PORT}"

###############################################################################
# high level tasks
###############################################################################

gulp.task 'build:markup', ['copy']
gulp.task 'build:scripts', ->
  runSequence 'watchify', 'uglify:all'
gulp.task 'build:stylesheets', ->
  runSequence 'compass', 'cssmin:minify'

gulp.task 'build', ->
  console.log 'browserify:sequence'
  seq = runSequence(
    'clean',
    [
      'build:markup'
      'build:scripts'
      'build:stylesheets'
    ]
  )
  seq


gulp.task 'default', ->
  runSequence('build', 'serve', 'watch')
