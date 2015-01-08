module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),            
    
    concat: {
    	options : {
    		banner: '/*! \n<%= pkg.name %> <%= pkg.version %>\n*/\n'
      },
      
      dist: {
        src: ['src/javascript/module_begin.js', 'src/javascript/httpclient.js','src/javascript/safeslingerexchange.js','src/javascript/module_end.js'],
        dest: 'build/safeslinger.js'
      },
    },
    watch: {
      scripts: {
        files: ['src/javascript/*.js'],
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
          src: ['<%= concat.dist.dest %>']
        }
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('default', ['build']);
  grunt.registerTask('build', ['concat:dist', 'jshint:dist']);
}