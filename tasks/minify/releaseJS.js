'use strict';

const gulp = require('gulp');
const bytediff = require('gulp-bytediff');
const justReplace = require('gulp-just-replace');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');

gulp.task('minify:releaseJS', () => {
    return gulp
        .src('bin/release/plugCubed.js')
        .pipe(justReplace('minified: false', 'minified: true'))
        .pipe(bytediff.start())
        .pipe(sourcemaps.init())
        .pipe(uglify({
            preserveComments: 'license',
            compress: {
                collapse_vars: true,
                negate_iife: false,
            }
        }))
        .pipe(bytediff.stop())
        .pipe(rename('plugCubed.min.js'))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('bin/release/'));
});
