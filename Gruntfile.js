module.exports = function (grunt) {

    grunt.initConfig({

        mochaTest: {
          test: {
            options: {
              reporter: 'spec',
              quiet: false, // Optionally suppress output to standard out (defaults to false)
            },
            src: ['test/**/*.js']
          }
        }
    });

    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.registerTask('test', 'mochaTest');

};