/**
 * Grunt config.
 */
module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    // Python tests.
    nose: {
      options: {
        stop: true,
        virtualenv: 'tools/python',
        config: 'nose.cfg'
      },
      main: {
        src: [
          'src/main/python'
        ]
      }
    }
  });

  // https://www.npmjs.org/package/grunt-nose
  grunt.loadNpmTasks('grunt-nose');

  grunt.registerTask('test', ['nose']);

};
