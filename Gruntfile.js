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
            // Watch all js in working directory.
            files: ['site/resume.html'],
            // Check then minify js to dist directory
            tasks:['copy:html'],
          },
		  js: {
		    // Watch all js in working directory.
		    files: ['site/js/**/*.js'],
		    // Check then minify js to dist directory
		    tasks:['jshint', 'uglify'],
		  },
		  css: {
		    // Watch all css in working directory.
		    files: ['site/sass/**/*.scss'],
		    // Minify css to dist directory
		    tasks:['compass','cssmin'],
		  },
          img: {
            // Watch all css in working directory.
            files: ['site/img/**/*.*'],
            // Minify css to dist directory
            tasks:['imagemin:img'],
          },
          imgcss: {
            // Watch all css in working directory.
            files: ['site/imgcss/**/*.*'],
            // Minify css to dist directory
            tasks:['imagemin:css'],
          }
		},
		/* PREPARE DEPLOY TASKS */
        copy: {
            html: {
                files: [
                  // includes files within path 
                  {expand: true, cwd:'site/', src: ['*.html'], dest: 'dist/', filter: 'isFile'}
                ]
            }
        },
    	jshint: {
    		all: ['Gruntfile.js', 'site/js/*.js']
  		},
  		uglify: {
            dist: {
                files: {
                    'dist/js/min.js': ['site/js/*.js']
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
                tasks: ['watch:site', 'watch:css', 'watch:img', 'watch:imgcss', 'watch:html'],
                options: {
                    logConcurrentOutput: true
                }
            }
        }


	});
	/*
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-imagemin');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('connect-livereload');
	*/

    grunt.registerTask('preview', ['connect:client', 'concurrent']);
};