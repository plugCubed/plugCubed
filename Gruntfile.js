var grunto = require('grunto');
var exists;
var fs = require('fs');
var fsAccess = require('fs-access');
var path = require('path');
var config = require(path.join(__dirname, 'config', 'p3.config.js'));
module.exports = grunto(function(grunt) {

    this.scan({
        cwd: 'grunt',
        src: '**/*.js'
    });

    try {
        fsAccess.sync(path.join(__dirname, 'src', 'dev'));
        exists = true;
    } catch (er) {
        exists = false;
    }

    this.context({
        config: config,
        devExists: exists,
        prefix: fs.readFileSync(path.join(__dirname, 'src', 'shared', '_prefix.js')),
        postfix: fs.readFileSync(path.join(__dirname, 'src', 'shared', '_postfix.js')),
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
            latest: {
                options: {
                    revision: 'latest'
                }
            }
        },
        'mozilla-cfx-xpi': {
            release: {
                options: {
                    'mozilla-addon-sdk': 'latest',
                    extension_dir: path.join(__dirname, 'extensions', 'Firefox'),
                    dist_dir: path.join(__dirname, 'extensions', 'Firefox-release'),
                    strip_sdk: true
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
