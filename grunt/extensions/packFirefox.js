var path = require('path');
module.exports = function() {
    this.$task('mozilla-addon-sdk', function() {
        return {
            latest: {
                options: {
                    revision: 'latest'
                }
            }
        };
    }).$task('mozilla-cfx-xpi', function() {
        return {
            release: {
                options: {
                    'mozilla-addon-sdk': 'latest',
                    extension_dir: path.resolve('../extensions', 'Firefox'),
                    dist_dir: path.resolve('extensions', 'Firefox-release'),
                    strip_sdk: false
                }
            }
        };
    });
};
