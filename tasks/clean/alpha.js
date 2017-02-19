'use strict';

// Node Modules
const path = require('path');

// 3rd Party Modules
const rimraf = require('rimraf');
const fs = require('graceful-fs');
const gulp = require('gulp');
const mkdirp = require('mkdirp');

gulp.task('clean:alpha', (done) => {
    rimraf('bin/alpha/**', fs, () => {
        mkdirp(path.join('bin', 'alpha'), {
            fs
        }, done);
    });
});
