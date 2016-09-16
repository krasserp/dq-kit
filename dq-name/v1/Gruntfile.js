module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %> */',
	compress:{
		drop_console:true
	}
      },
      build: {
        files:[{
		expand:true,
		cwd:'static',
		src:['!*.min.js','**/*.js'],
		dest:'static',
		ext: '.min.js',
		extDot: 'first'
     	 }]
	}
    },
    watch:{
      javascript:{
        files:['static/*.js','!static/*.min.js'],
        tasks:['uglify']
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['watch']);

};
