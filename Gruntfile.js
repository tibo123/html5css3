var serveStatic = require('serve-static');
var serveIndex = require('serve-index');
// This is the default port that livereload listens on;
// change it if you configure livereload to use another port.
var LIVERELOAD_PORT = 35728;
// lrSnippet is just a function.
// It's a piece of Connect middleware that injects
// a script into the static served html.
var lrSnippet = require('connect-livereload')({ port: LIVERELOAD_PORT });
// All the middleware necessary to serve static files.
var livereloadMiddleware = function (connect, options) {
  return [
    // Inject a livereloading script into static files.
    lrSnippet,
    // Serve static files.
    serveStatic(options.base[0]),
    // Make empty directories browsable.
    serveIndex(options.base[0])
  ];
};
module.exports = function(grunt){
  // load all grunt tasks matching the ['grunt-*', '@*/grunt-*'] patterns
  require('load-grunt-tasks')(grunt);
  grunt.initConfig({  
  /* SERVER CONNECTION + LIVERELOAD*/
  // The connect task is used to serve static files with a local server.
    connect: {
      client: {
        options: {
          // The server's port, and the folder to serve from:
          // Ex: 'localhost:9000' would serve up 'dist/index.html'
          port: 9001,
          base:'dist',
          // Custom middleware for the HTTP server:
          // The injected JavaScript reloads the page.
          middleware: livereloadMiddleware
        }
      }
    },
      // The watch task is used to run tasks in response to file changes
    watch: {
      site: {
        // 
        files: ['dist/**/*'],
        // In our case, we don't configure any additional tasks,
        // since livereload is built into the watch task,
        // and since the browser refresh is handled by the snippet.
        // Any other tasks to run (e.g. compile CoffeeScript) go here:
        tasks:[],
        options: {
          livereload:LIVERELOAD_PORT
        }
      },
      html: {
        files: ['site/**/*.html'],
        tasks:['copy:html'],
      },
      js: {
        // Watch all js in working directory.
        files: ['site/scripts/*.js'],//'site/js/**/*.js',
        // Check then minify js to dist directory
        tasks:['jshint', 'uglify'],
      },
      json: {
        files: ['site/json/*.json'],
        tasks:['copy:json'],
      },
      bower: {
        files: ['site/bower_components/**/*'],
        tasks:['copy:bower'],
      },
      css: {
        // Watch all css in working directory.
        files: ['site/sass/**/*.scss'],
        // Minify css to dist directory
        tasks:['compass','cssmin'],
      },
      img: {
        files: ['site/img/**/*.*'],
        tasks:['imagemin:img'],
      },
      imgcss: {
        files: ['site/imgcss/**/*.*'],
        tasks:['imagemin:css'],
      }
    },
  /* PREPARE DEPLOY TASKS */
    copy: {
      html: {
        files: [
          {expand: true, cwd:'site/', src: ['*.html', 'elements/**/*.html', 'styles/**/*.html'], dest: 'dist/', filter: 'isFile'}
        ]
      },
      bower: {
        files: [
          {expand: true, cwd:'site/bower_components/', src: ['**/*'], dest: 'dist/bower_components/', filter: 'isFile'}
        ]
      },
      json: {
        files: [
          {expand: true, cwd:'site/json/', src: ['**/*'], dest: 'dist/json/', filter: 'isFile'}
        ]
      }
    },
    jshint: {
      all: ['site/scripts/*.js']
    },
    uglify: {
      dist: {
        files: {
          'dist/scripts/app.js': ['site/scripts/*.js']
        }
      }
    },
    cssmin: {
      options: {
        shorthandCompacting: false,
        roundingPrecision: -1
      },
      target: {
        files: {
          'dist/css/min.css': ['site/sass/css/**/*.css']
        }
      }
    },
    compass: {                  // Task 
      dist: {                   // Target 
        options: {              // Target options 
          sassDir: 'site/sass',
          cssDir: 'site/sass/css',
        }
      }
    },
    imagemin: {
      img: {
        files: [{
          expand: true,                  // Enable dynamic expansion 
          cwd: 'site/img/',                   // Src matches are relative to this path 
          src: ['*.{png,jpg,gif}'],      // Actual patterns to match 
          dest: 'dist/img/'               // Destination path prefix 
        }]
      },
      css: {
        files: [{
          expand: true,                  // Enable dynamic expansion 
          cwd: 'site/imgcss/',                // Src matches are relative to this path 
          src: ['*.{png,jpg,gif}'],      // Actual patterns to match 
          dest: 'dist/css/img/'           // Destination path prefix 
        }]
      }
    },
    concurrent: {
      dev: {
        tasks: ['watch:site', 'watch:js', 'watch:imgcss', 'watch:html', 'watch:bower'],
        options: {
            logConcurrentOutput: true
        }
      }
    }
  });

  grunt.registerTask('init', ['copy:bower']);
  grunt.registerTask('preview', ['connect:client', 'concurrent']);
};