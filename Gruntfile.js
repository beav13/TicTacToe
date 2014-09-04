module.exports = function(grunt) {
  var target = grunt.option('target') || 'production';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'temp/tictactoe.js': ['frontend/scripts/tictactoe.js']
        }
      }
    },
    copy: {
      main: {
        files: [
          {expand: true, cwd: 'frontend/', src: ['images/**'], dest: target},
          {expand: true, cwd: 'frontend/', src: ['styles/**'], dest: target},
          {expand: true, cwd: 'frontend/', src: ['index.html', 'tictactoe.html'], dest: target},
          {expand: true, flatten:true, src: ['temp/tictactoe.js'], dest: target + '/scripts'}
        ]
      }
    },
	clean: ["temp"]
  });
  
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('default', ['uglify', 'copy', 'clean']);
};