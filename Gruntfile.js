module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),            
    
    concat: {
    	options : {
    		banner: '/*! \n<%= pkg.name %> <%= pkg.version %>\n*/\n'
      },
      
      dist: {
        src: ['src/javascript/module_begin.js', 'src/javascript/httpclient.js',
        'src/javascript/safeslingerexchange.js','src/javascript/dh.js','src/javascript/util/SafeSlingerUtil.js',
        'src/javascript/module_end.js'],
        dest: 'build/safeslinger.js'
      },
      ui : {
		src: ['src/javascript/ui/module_begin.js','src/javascript/ui/constructUI.js',
		'src/javascript/ui/landingpage.js', 'src/javascript/ui/numofusers.js', 
		'src/javascript/ui/lowestnumber.js','src/javascript/ui/showphrases.js',
		'src/javascript/ui/endingpage.js',
		'src/javascript/util/SafeSlingerUIUtil.js',
		'src/javascript/ui/module_end.js'],
		dest: 'build/safeslinger-ui.js'
      },
      uivc : {
        src: ['src/javascript/ui-vc/module_begin.js','src/javascript/ui-vc/constructUI.js',
        'src/javascript/ui-vc/landingpage.js', 
        'src/javascript/ui-vc/module_end.js'],
        dest: 'build/safeslinger-ui-vc.js'
      }
    },
    uglify: {  
        options: {  
            compress: {
                global_defs: {
                    DEBUG: false
                }
            }  
        },  
        applib: {  
            src: [ 'build/safeslinger.js' ],  
            dest: 'build/safeslinger.min.js'  
        }  
    },
    watch: {
      scripts: {
        files: ['src/javascript/*.js','src/javascript/ui/*.js','src/javascript/ui-vc/*.js', 'src/javascript/util/*.js'],
        tasks: ['concat'],
        options: {
          interrupt: true,
        }
      }
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        eqnull: true,
        browser: true,
        camelcase : true,
        //indent: 2,
        latedef : true,
        newcap : true,
        undef : true,
        //trailing : true,
        //unused : true,
        globals: {
          console: true,
          saveAs: true
        },
      },
      dist: {
        files: {
          src: ['<%= concat.dist.dest %>', '<%= concat.dist.ui %>', '<%= concat.dist.ui-vc %>']
        }
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  //grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('default', ['build']);
  //grunt.registerTask('build', ['concat:dist', 'concat:ui', 'jshint:dist']);
  grunt.registerTask('build', ['concat:dist', 'concat:ui', 'concat:uivc', 'uglify']);
}