'use strict';

// Node Modules
const path = require('path');

// 3rd Party Modules
const del = require('del');
const fs = require('graceful-fs');
const gulp = require('gulp');
const mkdirp = require('mkdirp');

gulp.task('clean:release', (done) => {

    del(['bin/release/**'])
    .then(() => {
        mkdirp(path.join('bin', 'release'), {
            fs
        }, done);
    })
    .catch(console.error);
});
