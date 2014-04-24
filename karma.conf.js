var browsers = [ 'Firefox', 'PhantomJS' ];

if (!process.env.TRAVIS) {
    browsers.push('Chrome');
}

module.exports = function(config) {
    config.set({
        basePath: '',

        frameworks: ['mocha'],

        files: [
            'bower_components/jquery/dist/jquery.js',
            'bower_components/underscore/underscore.js',
            'bower_components/backbone/backbone.js',
            'bower_components/functoids/functoids.js',
            'node_modules/should/should.js',

            'src/app.js',
            'src/display.js',
            'src/page.js',

            'specs/*.html',
            'specs/*.spec.*'
        ],

        preprocessors: {
            'specs/*.html': [ 'html2js' ]
        },

        exclude: [ ],
        reporters: ['progress'],

        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: false,
        
        browsers: browsers,

        captureTimeout: 60000,
        singleRun: true
    });
};
