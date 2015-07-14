module.exports = function() {
    if (this.devExists) {
        var path = require('path');
        var versionDev = require(path.resolve('src', 'dev', 'version.js'));
        this.replace({
            src: ['bin/dev/plugCubed.src.js'],
            overwrite: true,
            replacements: [{
                from: 'VERSION.MAJOR',
                to: versionDev.major.toString()
            }, {
                from: 'VERSION.MINOR',
                to: versionDev.minor.toString()
            }, {
                from: 'VERSION.PATCH',
                to: versionDev.patch.toString()
            }, {
                from: 'VERSION.PRERELEASE',
                to: 'dev'
            }, {
                from: 'VERSION.BUILD',
                to: versionDev.build.toString()
            }]
        });
    }
};
