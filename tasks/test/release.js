'use strict';

const gulp = require('gulp');
const mocha = require('gulp-mocha');

gulp.task('test:release', () => {
    return gulp
        .src('test/release/**.js')
        .pipe(mocha({
            timeout: 5000
        }));
});
