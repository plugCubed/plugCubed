'use strict';

const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const justReplace = require('gulp-just-replace');

gulp.task('autoprefixer:release', () => {
    return gulp
        .src('src/release/plugCubed.css')
        .pipe(justReplace([{
            search: /https?:\/\/plugcubed\.net\/scripts\/(alpha|dev|release)\//gi,
            replacement: 'https://plugcubed.net/scripts/release/'
        }]))
        .pipe(autoprefixer({
            browsers: ['> 1%', 'ie >= 9', 'last 5 versions']
        }))
        .pipe(gulp.dest('src/release'));
});
