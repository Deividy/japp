module.exports = function (grunt) {
    grunt.initConfig({

        uglify: {
            dev: {
                options: {
                    beautify: true,
                    compress: false,
                    mangle: false,
                    preserveComments: 'all'
                },

                files: {
                    'japp.js': [ 'src/app.js', 'src/display.js', 'src/page.js' ],
                }

            },
            prod: {
                files: {
                    'japp.min.js': [ 'japp.js' ]
                }
            }
        },
        karma: {
            unit: {
                configFile: 'karma.conf.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-karma');

    grunt.registerTask('default', [ 'uglify:dev', 'uglify:prod', 'karma:unit' ]);
    grunt.registerTask('test', [ 'karma:unit' ]);
};
