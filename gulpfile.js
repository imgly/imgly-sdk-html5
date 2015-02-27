"use strict";
var gulp = require("gulp");
var source = require("vinyl-source-stream");
var runSequence = require("run-sequence");

var browserSync = require("browser-sync");
var browserify = require("browserify");
var watchify = require("watchify");
var babelify = require("babelify");
var brfs = require("brfs");
var reload = browserSync.reload;

var gulpLoadPlugins = require("gulp-load-plugins");
var $ = gulpLoadPlugins();

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
  return gulp.src("./build/*.js")
    .pipe($.plumber())
    .pipe($.uglify())
    .pipe($.rename({ suffix: ".min" }))
    .pipe(gulp.dest("./build"));
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
  gulp.src(["./src/js/**/*.js"])
    .pipe($.babel())
    .pipe($.jsdoc.parser())
    .pipe($.jsdoc.generator("./doc", {
      path: "node_modules/jaguarjs-jsdoc"
    }));
});

/**
 * `gulp browserify`
 * Runs browserify on the JS source files which packs all source
 * files together. If `set-production` has NOT been called before,
 * this task will watch for changes and update the package every time
 * a source file has been changed.
 */
gulp.task("browserify", function () {
  var input = "./index.js";
  var output = "js/imglykit.js";

  // Initialize browserify
  var args = watchify.args;
  args.debug = !isProduction;
  args.entries = [input];
  args.extensions = [".js"];
  args.fullPaths = !isProduction;
  var b = browserify(args);

  b.transform(babelify);
  b.transform(brfs);

  // Make sure to use watchify in development
  var bundler = isProduction ? b : watchify(b);

  // Add externals
  config.externals.forEach(function (external) {
    var options = {};
    if (typeof external.expose !== "undefined") {
      options.expose = external.expose;
    }
    bundler.require(external.require, options);
  });

  // We don't need the canvas package in the frontend
  bundler.external("canvas");

  // Creates the bundle
  function rebundle() {
    return bundler.bundle()
      .on("error", $.notify.onError({ onError: true }))
      .pipe($.plumber())
      .pipe(source(output))
      .pipe(gulp.dest("./build"))
      .pipe($.if(!isProduction, reload({ stream: true, once: true })));
  }

  // Re-bundle on any changes
  bundler.on("update", rebundle);

  // Initially bundle
  return rebundle();
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
gulp.task("build:js", ["browserify"]);
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
  )
});

/**
 * `gulp release`
 * Runs all build tasks and minifies the results
 */
gulp.task("release", function () {
  return runSequence(
    "set-production",
    "clean",
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
