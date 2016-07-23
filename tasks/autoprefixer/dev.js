'use strict';

const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const justReplace = require('gulp-just-replace');

gulp.task('autoprefixer:dev', () => {
    return gulp
        .src('src/dev/plugCubed.css')
        .pipe(justReplace([{
            search: /https?:\/\/plugcubed\.net\/scripts\/(alpha|dev|release)\//gi,
            replacement: 'https://plugcubed.net/scripts/dev/'
        }]))
        .pipe(autoprefixer({
            browsers: ['> 1%', 'ie >= 9', 'last 5 versions']
        }))
        .pipe(gulp.dest('src/dev'))
        .pipe(gulp.dest('bin/dev'));
});
