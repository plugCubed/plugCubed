'use strict';

// Node Modules
const path = require('path');

// 3rd Party Modules
const del = require('del');
const fs = require('graceful-fs');
const gulp = require('gulp');
const mkdirp = require('mkdirp');

gulp.task('clean:alpha', (done) => {

    del(['bin/alpha/**'])
        .then(() => {
            mkdirp(path.join('bin', 'alpha'), {
                fs
            }, done);
        })
        .catch(console.error);
});
