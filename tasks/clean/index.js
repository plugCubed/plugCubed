'use strict';

// Node Modules
const path = require('path');

// 3rd Party Modules
const rimraf = require('rimraf');
const fs = require('graceful-fs');
const gulp = require('gulp');
const mkdirp = require('make-dir');

versions.forEach((version) => {
    if (version == null) return;

    gulp.task(`clean:${version}`, (done) => {
        rimraf(`bin/${version}/**`, fs, () => {
            mkdirp(path.join('bin', version), {
                fs
            }).then(() => {
                done();
            }).catch((err) => {
                done(err);
            });
        });
    });
});
