'use strict';

const path = require('path');
const gulp = require('gulp');
const HubRegistry = require('gulp-hub');
const tryRequire = require('try-require');

const devVersion = tryRequire(path.join('src', 'dev', 'version.js'));
const devVersionExists = (devVersion === null && typeof devVersion !== 'object');
const regex = devVersionExists ? ['tasks/**/*.js'] : 'tasks/**/+(alpha|release).js';
const hub = new HubRegistry(regex);

gulp.registry(hub);

gulp.task('minify:alpha', gulp.parallel('minify:alphaJS', 'minify:alphaCSS', (done) => {
    done();
}));

gulp.task('minify:release', gulp.parallel('minify:releaseJS', 'minify:releaseCSS', (done) => {
    done();
}));

gulp.task('build:alpha', gulp.series('clean:alpha', 'replace:linksAlpha', 'requirejs:alpha', 'replace:versionAlpha', 'autoprefixer:alpha', 'template:alpha', 'minify:alpha', (done) => {
    done();
}));

gulp.task('build:extensions', gulp.parallel(['replace:extensionChrome', 'replace:extensionFirefox', 'replace:extensionMaxthon'], ['extensions:chrome', 'extensions:firefox', 'extensions:opera', 'extensions:maxthon'], (done) => {
    done();
}));

gulp.task('build:release', gulp.series('clean:release', 'replace:linksRelease', 'requirejs:release', 'replace:versionRelease', 'autoprefixer:release', 'template:release', ['build:extensions', 'minify:release'], (done) => {
    done();
}));

if (devVersionExists) {
    gulp.task('build:all', gulp.series('build:alpha', 'build:dev', 'build:release', (done) => {
        done();
    }));

    gulp.task('build:dev', gulp.series('clean:dev', 'replace:linksDev', 'requirejs:dev', 'replace:versionDev', 'autoprefixer:dev', 'template:dev', (done) => {
        done();
    }));

    gulp.task('watch:dev', (done) => {
        const devWatcher = gulp.watch('**/*.{css,js}', {
            cwd: path.resolve('src', 'dev')
        }, ['build:dev']);

        devWatcher.on('change', (event) => {
            console.log(`File ${event.path} was ${event.type} running build:dev task...`);
        });
    });
}

gulp.task('watch:alpha', (done) => {
    const alphaWatcher = gulp.watch('**/*.{css,js}', {
        cwd: path.resolve('src', 'alpha')
    }, ['build:alpha']);

    alphaWatcher.on('change', (event) => {
        console.log(`File ${event.path} was ${event.type} running build:alpha task...`);
    });
});


gulp.task('watch:release', (done) => {
    const releaseWatcher = gulp.watch('**/*.{css,js}', {
        cwd: path.resolve('src', 'release')
    }, ['build:release']);

    releaseWatcher.on('change', (event) => {
        console.log(`File ${event.path} was ${event.type} running build:release task...`);
    });
});
