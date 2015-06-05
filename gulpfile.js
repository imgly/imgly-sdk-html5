"use strict";
var path = require('path')
var gulp = require("gulp");
var source = require("vinyl-source-stream");
var runSequence = require("run-sequence");

var browserSync = require("browser-sync");
var webpack = require("webpack");
var watchify = require("watchify");
var babelify = require("babelify");
var brfs = require("brfs");
var reload = browserSync.reload;
var webpack = require('gulp-webpack')
var gulpLoadPlugins = require("gulp-load-plugins");
var $ = gulpLoadPlugins();
var WebpackNotifierPlugin = require('webpack-notifier')

var env = process.env.ENV || 'development'

/**
 * Configuration
 * @type {Object}
 */
var config = {
  serverPort: 8080,
  externals: [
    { require: "./src/js/vendor/lodash", expose: "lodash" }
  ]
};

var sassFiles = [
  "./src/css/imglykit-night-ui.sass"
];

/**
 * `gulp set-production`
 * Sets the production state to true
 */
var isProduction = false;
gulp.task("set-production", function () {
  isProduction = true;
});

/**
 * `gulp clean`
 * Cleans the build directory
 */
gulp.task("clean", function () {
  return gulp.src("./build").pipe($.clean());
});

/**
 * `gulp standard`
 * Checks the JavaScript code for standard style
 */
gulp.task("standard", function () {
  return gulp.src(["./src/js/**/*.js", "!src/js/vendor/**/*.js"])
    .pipe($.standard())
    .pipe($.standard.reporter("default", {
      breakOnError: true
    }));
});

/**
 * `gulp sass`
 * Compiles the main .sass file to .css
 */
gulp.task("sass", function () {
  return gulp.src(sassFiles)
    .pipe($.plumber())
    .pipe($.compass({
      css: "build/css",
      sass: "src/css"
    }))
    .on("error", $.notify.onError({ onError: true }))
    .on("error", $.util.log)
    .on("error", $.util.beep)
    .pipe(gulp.dest("./build"))
    .pipe($.if(!isProduction, reload({ stream: true, once: true })));
});

/**
 * `gulp copy`
 * Copies the static assets files to the build folder
 */
gulp.task("copy", function () {
  return gulp.src("./src/assets/**")
    .pipe($.plumber())
    .pipe(gulp.dest("./build/assets"))
    .pipe($.if(!isProduction, reload({ stream: true, once: true })));
});

/**
 * `gulp uglify:js`
 * Uglifies the compiled JS files
 */
gulp.task("uglify:js", function () {
  return gulp.src("./build/js/imglykit.js")
    .pipe($.plumber())
    .pipe($.uglifyjs({
      mangle: false
    }))
    .pipe($.rename({ suffix: ".min" }))
    .pipe(gulp.dest("./build/js"));
});

/**
 * `gulp uglify:css`
 * Uglifies the compiled CSS files
 */
gulp.task("cssmin:minify", function () {
  return gulp.src("./build/*.css")
    .pipe($.plumber())
    .pipe($.cssmin())
    .pipe($.rename({ suffix: ".min" }))
    .pipe(gulp.dest("./build"));
});

/**
 * `gulp jsdoc`
 * Generates the documentation
 */
gulp.task("jsdoc", function () {
  gulp.src(["./src/js/**/*.js", "!src/js/vendor/**/*.js"])
    .pipe($.babel())
    .pipe($.jsdoc.parser())
    .pipe($.jsdoc.generator("./doc", {
      path: "node_modules/jaguarjs-jsdoc"
    }));
});

/**
 * `gulp webpack`
 * Runs webpack on the JS source files which packs all source
 * files together. If `set-production` has NOT been called before,
 * this task will watch for changes and update the package every time
 * a source file has been changed.
 */
gulp.task("webpack", function () {
  var input = path.resolve(__dirname, './index.js');
  var output = "js/imglykit.js";

  var sourceFiles = path.resolve(__dirname, 'src')

  // Initialize webpack
  return gulp.src(input)
    .pipe(webpack({
      watch: env === 'development',
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
          'lodash': path.resolve(sourceFiles + '/js/vendor/lodash.js')
        }
      },
      entry: {
        imglykit: './imglykit'
      },
      node: {
        fs: 'empty',
        path: 'empty'
      },
      externals: [
        'canvas'
      ],
      module: {
        loaders: [
          {
            test: /\.jsx?$/,
            include: /src\/js/,
            loaders: [
              'transform?brfs',
              'babel-loader?cacheDirectory'
            ]
          }
        ]
      },
      plugins: [
        new WebpackNotifierPlugin()
      ]
    }))
    .pipe(gulp.dest(path.resolve(__dirname, 'build', 'js')))
});

/**
 * `gulp watch`
 * Watches any changes on the CSS/SASS files and the static assets,
 * makes sure they are rebuilt / moved to the build folder
 */
gulp.task("watch", function () {
  gulp.watch("./src/css/**/*.{css,scss,sass}", ["build:css"]);
  gulp.watch("./assets/**/*", ["copy"]);
});

/**
 * `gulp serve`
 * Runs a static server and a browsersync server
 */
gulp.task("serve", function () {
  return browserSync({
    notify: false,
    open: false,
    server: {
      baseDir: ["."]
    },
    ports: {
      min: config.serverPort
    }
  });
});

/**
 * High level gulp tasks
 */
gulp.task("build:copy", ["copy"]);
gulp.task("build:js", ["webpack"]);
gulp.task("build:css", ["sass"]);

/**
 * `gulp build`
 * Runs all build tasks
 */
gulp.task("build", function () {
  return runSequence(
    "clean",
    [
      "build:copy",
      "build:js",
      "build:css"
    ]
  );
});

/**
 * `gulp release`
 * Runs all build tasks and minifies the results
 */
gulp.task("release", function () {
  return runSequence(
    "set-production",
    "clean",
    // "standard",
    "build:copy",
    "build:js",
    "build:css",
    "uglify:js",
    "cssmin:minify"
  );
});

/**
 * `gulp`
 * Builds the sources, runs the server and watches for changes
 */
gulp.task("default", function () {
  return runSequence("build", "serve", "watch");
});
