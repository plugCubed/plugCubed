var grunto = require('grunto');
var fs = require('fs');
var path = require('path');
var config = require(path.resolve('config', 'p3.config.js'));
module.exports = grunto(function(grunt) {

    this.scan({
        cwd: 'grunt',
        src: '**/*.js'
    });

    this.context({
        config: config,
        devExists: fs.existsSync(path.resolve('src', 'dev')),
        verboseEnabled: grunt.option('verbose')
    });

    this.config({
        requirejs_obfuscate: {
            options: {
                root: 'plugCubed',
                quotes: 'single',
                length: 6,
                output: true
            }
        },
        'mozilla-addon-sdk': {
            'latest': {
                options: {
                    revision: 'latest'
                }
            }
        },
        'mozilla-cfx-xpi': {
            release: {
                options: {
                    'mozilla-addon-sdk': 'latest',
                    extension_dir: path.resolve(__dirname, 'extensions', 'Firefox'),
                    dist_dir: 'extensions/Firefox-release',
                    strip_sdk: false
                }
            }
        },
        s3: {
            options: {
                accessKeyId: config.aws.accessKeyId,
                secretAccessKey: config.aws.secretAccessKey,
                bucket: 'plug3',
                region: 'eu-west-1',
                headers: {
                    CacheControl: 300
                },
                dryRun: false,
                cacheTTL: 5 * 60 * 1000
            }
        }
    });
});
