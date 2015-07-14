var path = require('path');
var versionRelease =  require(path.resolve('src', 'release', 'version.js'));
module.exports = function() {
    this.replace({
        src: ['extensions/shared/manifest.src.json'],
        dest: 'extensions/Opera/manifest.json',
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
            to: versionRelease.prerelease
        }, {
            from: 'VERSION.BUILD',
            to: versionRelease.build.toString()
        }]
    });
};
