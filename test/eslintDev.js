var fsAccess = require('fs-access');
var path = require('path');
fsAccess(path.join('src', 'dev'), function(err) {
    if (!err) {
        var lint = require('mocha-eslint');

        var paths = [
            'src/dev/plugCubed/**/*.js'
        ];

        var options = {};

        lint(paths, options);
        return;
    }
});
