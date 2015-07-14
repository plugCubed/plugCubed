var path = require('path');
module.exports = function() {
    this.grunto('mozilla-addon-sdk', function() {
        return {
            latest: {
                options: {
                    revision: "latest"
                }
            }
        };
    }).grunto('mozilla-cfx-xpi', function() {
        console.log(path.resolve('extensions', 'Firefox'))
        return {
            release: {
                options: {
                    'mozilla-addon-sdk': 'latest',
                    extension_dir: path.resolve('extensions', 'Firefox'),
                    dist_dir: path.resolve('extensions', 'Firefox-release'),
                    strip_sdk: false
                }
            }
        };
    });
};
