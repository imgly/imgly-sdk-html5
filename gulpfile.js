var path = require('path')
var gulp = require('gulp')
var runSequence = require('run-sequence')

var browserSync = require('browser-sync')
var reload = browserSync.reload
var webpack = require('gulp-webpack')
var gulpLoadPlugins = require('gulp-load-plugins')
var $ = gulpLoadPlugins()
var WebpackNotifierPlugin = require('webpack-notifier')

/**
 * Configuration
 * @type {Object}
 */
var config = {
  serverPort: 8080,
  externals: [

  ]
}

var sassFiles = [
  './src/css/imglykit-night-ui.sass'
]

/**
 * `gulp set-production`
 * Sets the production state to true
 */
var isProduction = false
gulp.task('set-production', function () {
  isProduction = true
})

/**
 * `gulp clean`
 * Cleans the build directory
 */
gulp.task('clean', function () {
  return gulp.src('./build').pipe($.clean())
})

/**
 * `gulp standard`
 * Checks the JavaScript code for standard style
 */
gulp.task('standard', function () {
  return gulp.src(['./src/js/**/*.js', '!src/js/vendor/**/*.js'])
    .pipe($.standard())
    .pipe($.standard.reporter('default', {
      breakOnError: true
    }))
})

/**
 * `gulp sass`
 * Compiles the main .sass file to .css
 */
gulp.task('sass', function () {
  return gulp.src(sassFiles)
    .pipe($.plumber())
    .pipe($.sass({
      includePaths: ['node_modules/compass-mixins/lib'],
      indentedSyntax: true,
      errLogToConsole: true
    }))
    .on('error', $.notify.onError({ onError: true }))
    .on('error', $.util.log)
    .on('error', $.util.beep)
    .pipe(gulp.dest('./build/css'))
    .pipe($.notify('SASS build complete'))
})

/**
 * `gulp copy`
 * Copies the static assets files to the build folder
 */
gulp.task('copy', function () {
  return gulp.src('./src/assets/**')
    .pipe($.plumber())
    .pipe(gulp.dest('./build/assets'))
    .pipe($.if(!isProduction, reload({ stream: true, once: true })))
})

/**
 * `gulp uglify:js`
 * Uglifies the compiled JS files
 */
gulp.task('uglify:js', function () {
  return gulp.src('./build/js/imglykit.js')
    .pipe($.plumber())
    .pipe($.yuicompressor({
      type: 'js'
    }))
    .pipe($.rename({ suffix: '.min' }))
    .pipe(gulp.dest('./build/js'))
})

/**
 * `gulp uglify:css`
 * Uglifies the compiled CSS files
 */
gulp.task('uglify:css', function () {
  return gulp.src('./build/css/imglykit-night-ui.css')
    .pipe($.plumber())
    .pipe($.yuicompressor({
      type: 'css'
    }))
    .pipe($.rename({ suffix: '.min' }))
    .pipe(gulp.dest('./build/css'))
})

/**
 * `gulp jsdoc`
 * Generates the documentation
 */
gulp.task('jsdoc', function () {
  gulp.src(['./src/js/**/*.js', '!src/js/vendor/**/*.js'])
    .pipe($.babel())
    .pipe($.jsdoc.parser())
    .pipe($.jsdoc.generator('./doc', {
      path: 'node_modules/jaguarjs-jsdoc'
    }))
})

/**
 * `gulp webpack`
 * Runs webpack on the JS source files which packs all source
 * files together. If `set-production` has NOT been called before,
 * this task will watch for changes and update the package every time
 * a source file has been changed.
 */
gulp.task('webpack', function () {
  var input = path.resolve(__dirname, './index.js')

  var sourceFiles = path.resolve(__dirname, 'src')

  // Initialize webpack
  return gulp.src(input)
    .pipe(webpack({
      watch: !isProduction,
      context: path.resolve(sourceFiles + '/js'),
      output: {
        library: 'ImglyKit',
        libraryTarget: 'umd',
        filename: 'imglykit.js',
        path: path.resolve(__dirname, 'build', 'js')
      },
      resolve: {
        extensions: ['', '.js', '.jsx'],
        root: path.resolve(sourceFiles + '/js'),
        modulesDirectories: ['node_modules'],
        alias: {

        }
      },
      entry: {
        imglykit: './imglykit'
      },
      node: {
        fs: 'empty',
        path: 'empty'
      },
      devtool: isProduction ? null : 'inline-source-map',
      externals: [
        'canvas'
      ],
      module: {
        loaders: [
          {
            test: /\.json?$/,
            loader: 'json'
          },
          {
            test: /\.jsx?$/,
            include: /src\/js/,
            loaders: [
              path.resolve(__dirname, 'loaders', 'dotjs-loader'),
              'babel-loader?cacheDirectory&sourceMap'
            ]
          }
        ]
      },
      plugins: [
        new WebpackNotifierPlugin()
      ]
    }))
    .pipe(gulp.dest(path.resolve(__dirname, 'build', 'js')))
})

/**
 * `gulp watch`
 * Watches any changes on the CSS/SASS files and the static assets,
 * makes sure they are rebuilt / moved to the build folder
 */
gulp.task('watch', function () {
  gulp.watch('./src/css/**/*.{css,scss,sass}', ['build:css'])
  gulp.watch('./assets/**/*', ['copy'])
})

/**
 * `gulp serve`
 * Runs a static server and a browsersync server
 */
gulp.task('serve', function () {
  return browserSync({
    notify: false,
    open: false,
    server: {
      baseDir: ['.'],
      middleware: function (req, res, next) {
        //res.setHeader('Content-Security-Policy', "default-src https: 'self'; connect-src https: 'self'; font-src https: 'self' data:; frame-src https: 'self'; img-src https: 'self' data:; media-src https: 'self'; object-src https: 'self'; script-src https: 'self'; style-src https: 'self' 'unsafe-inline';")
        next()
      }
    },
    ports: {
      min: config.serverPort
    }
  })
})

/**
 * High level gulp tasks
 */
gulp.task('build:copy', ['copy'])
gulp.task('build:js', ['webpack'])
gulp.task('build:css', ['sass'])

/**
 * `gulp build`
 * Runs all build tasks
 */
gulp.task('build', function () {
  return runSequence(
    'clean',
    [
      'build:copy',
      'build:js',
      'build:css'
    ]
  )
})

/**
 * `gulp release`
 * Runs all build tasks and minifies the results
 */
gulp.task('release', function () {
  return runSequence(
    'set-production',
    'clean',
    // 'standard',
    'build:copy',
    'build:js',
    'build:css',
    'uglify:js',
    'uglify:css'
  )
})

/**
 * `gulp`
 * Builds the sources, runs the server and watches for changes
 */
gulp.task('default', function () {
  return runSequence('build', 'serve', 'watch')
})
