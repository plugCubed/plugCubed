var path = require('path');
var versionAlpha = require(path.resolve('src', 'alpha', 'version.js'));
module.exports = function() {
    this.replace({
        src: ['bin/alpha/plugCubed.src.js'],
        overwrite: true,
        replacements: [{
            from: 'VERSION.MAJOR',
            to: versionAlpha.major.toString()
        }, {
            from: 'VERSION.MINOR',
            to: versionAlpha.minor.toString()
        }, {
            from: 'VERSION.PATCH',
            to: versionAlpha.patch.toString()
        }, {
            from: 'VERSION.PRERELEASE',
            to: 'alpha'
        }, {
            from: 'VERSION.BUILD',
            to: versionAlpha.build.toString()
        }]
    });
};
