'use strict';

const gulp = require('gulp');
const mocha = require('gulp-mocha');

gulp.task('test:alpha', () => {
    return gulp
        .src('test/alpha/**.js')
        .pipe(mocha({
            timeout: 5000
        }));
});
