var path = require('path');
module.exports = function(grunt) {
    this.concat({
        files: {
            'bin/release/plugCubed.extension.js': [path.join('src', 'shared', '_prefixExtension.js'), path.join('bin', 'release', 'plugCubed.js'), path.join('src', 'shared', '_postfixExtension.js')]
        }
    });
};
