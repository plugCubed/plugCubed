'use strict';

// Node Modules
const path = require('path');

// 3rd Party Modules
const rimraf = require('rimraf');
const fs = require('graceful-fs');
const gulp = require('gulp');
const mkdirp = require('mkdirp');

gulp.task('clean:release', (done) => {
    rimraf('bin/release/**', fs, () => {
        mkdirp(path.join('bin', 'release'), {
            fs
        }, done);
    });
});
