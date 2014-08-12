var fs = require('fs');

module.exports = function(grunt) {
  grunt.initConfig({

    compass: {                  // Task
      dev: {                   // Target
        options: {              // Target options
          sassDir: 'sass',
          cssDir: 'build'
        }
      },
      dist: {
        options: {
          sassDir: 'sass',
          cssDir: 'build',
          outputStyle: 'compressed'
        }
      }
    },

    clean: ['build/imgly.concat.js', 'build/imgly.min.js'],

    concat: {
      build: {
        src: [
          'javascripts/vendor/jquery-1.10.1.js',
          'javascripts/vendor/eventemitter.js',
          'javascripts/vendor/perf.js',
          'javascripts/vendor/resize.js',
          'javascripts/vendor/modernizr.js',
          'javascripts/vendor/spectrum-min.js',
          'build/imgly.js'
        ],
        dest: 'build/imgly.concat.js'
      }
    },

    uglify: {
      build: {
        files: {
          'build/imgly.min.js': ['build/imgly.concat.js']
        }
      }
    },

    watch: {
      scripts: {
        files: ['build/imgly.js'],
        tasks: ['concat', 'notify:done'],
        options: {
          livereload: true
        }
      },
      styles: {
        files: ['**/*.sass'],
        tasks: ['compass:dev'],
        options: {
          livereload: true
        }
      }
    },

    notify: {
      done: {
        options: {
          message: 'compilation done!'
        }
      },
      compiling: {
        options: {
          message: 'compiling...'
        }
      }
    },

    connect: {
      server: {
        options: {
          hostname: "*"
        }
      }
    },

    watchify: {
      options: {
        insertGlobals: true,
        callback: function (b) {
          b.transform(require("coffeeify"));
          b.ignore("q");

          return b;
        }
      },
      imgly: {
        src: ['./coffeescripts/imgly.coffee'],
        dest: 'build/imgly.js'
      }
    },

    cleanNames: {
      concat: {
        src: 'build/imgly.concat.js'
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-notify');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-watchify');

  grunt.registerMultiTask('cleanNames', 'make require\'d filenames unreadable', function(done) {
    var src  = this.data.src
      , done = this.async();
    fs.readFile(src, function (err, body) {
      if(err) throw err;

      body = body.toString();

      // appearences of require()
      var regex = /"([a-zA-Z0-9-_\.\/\\]*)\.coffee"/ig;

      // Collect them and give them new, unique names
      var match, file, fileMap = {}, newFileName = 0;
      while(match = regex.exec(body)) {
        console.log(match[1]);
        file = match[1] + ".coffee";
        if(!fileMap[file]) {
          fileMap[file] = newFileName.toString();
          newFileName++;
        }
      }

      // Replace all occurences
      for(var key in fileMap) {
        body = body.replace(new RegExp("\"" + key + "\"", "g"), "\"" + fileMap[key] + "\"");
      }

      fs.writeFile(src, body, function (err) {
        if(err) throw err;

        done();
      })
    });
  });

  grunt.registerTask('default', ['connect', 'watchify', 'watch'])

  grunt.registerTask('build', [
    'clean',
    'watchify',
    'concat',
    'cleanNames',
    'uglify',
    'compass:dist'
  ])
};
