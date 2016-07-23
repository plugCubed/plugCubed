'use strict';

const gulp = require('gulp');
const justReplace = require('gulp-just-replace');

gulp.task('replace:linksDev', () => {
    return gulp
        .src('src/dev/plugCubed/**/*.js')
        .pipe(justReplace([{
            search: /https?:\/\/plugcubed\.net\/scripts\/(alpha|dev|release)\//gi,
            replacement: 'https://plugcubed.net/scripts/dev/'
        }]))
        .pipe(gulp.dest('src/dev/plugCubed'));
});
