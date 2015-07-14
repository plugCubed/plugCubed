var path = require('path');
var versionRelease = require(path.resolve('src', 'release', 'version.js'));
module.exports = function() {
    this.replace({
        src: ['bin/release/plugCubed.src.js'],
        overwrite: true,
        replacements: [{
            from: 'VERSION.MAJOR',
            to: versionRelease.major.toString()
        }, {
            from: 'VERSION.MINOR',
            to: versionRelease.minor.toString()
        }, {
            from: 'VERSION.PATCH',
            to: versionRelease.patch.toString()
        }, {
            from: 'VERSION.PRERELEASE',
            to: 'release'
        }, {
            from: 'VERSION.BUILD',
            to: versionRelease.build.toString()
        }]
    });
};
