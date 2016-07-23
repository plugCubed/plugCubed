'use strict';


// 3rd Party Modules
const fs = require('graceful-fs');
const gulp = require('gulp');
const crxPack = require('gulp-crx-pack');

gulp.task('extensions:opera', () => {
    return gulp
        .src('./extensions/Opera')
        .pipe(crxPack({
            filename: 'Opera.crx',
            privateKey: fs.readFileSync('./extensions/key.pem', 'utf8')
        }))
        .pipe(gulp.dest('./extensions'));
});
