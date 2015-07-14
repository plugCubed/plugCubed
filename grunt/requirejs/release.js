var fs = require('fs');
module.exports = function(grunt) {
    this.requirejs({
        options: {
            appDir: './src/release',
            baseUrl: '.',
            dir: './out',
            optimize: 'none',
            keepBuildDir: false,
            removeCombined: false,
            findNestedDependencies: true,
            paths: {
                backbone: 'empty:',
                jquery: 'empty:',
                underscore: 'empty:',
                'lang/Lang': 'empty:'
            },
            modules: [{
                name: 'plugCubed/Loader',
                include: []
            }],
            done: function(done) {
                fs.readFile('./src/release/plugCubed/_postfix.js', function(err, postfixData) {
                    if (err) {
                        done(err);
                        return;
                    }
                    fs.readFile('./out/plugCubed/Loader.js', function(err, p3Data) {
                        if (err) {
                            done(err);
                            return;
                        }
                        fs.readFile('./src/release/plugCubed/_prefix.js', function(err, prefixData) {
                            if (err) {
                                done(err);
                                return;
                            }
                            fs.writeFile('./out/plugCubed/combined.js', prefixData, function(err) {
                                if (err) {
                                    done(err);
                                    return;
                                }
                                fs.appendFile('./out/plugCubed/combined.js', p3Data, function(err) {
                                    if (err) {
                                        done(err);
                                        return;
                                    }
                                    fs.appendFile('./out/plugCubed/combined.js', postfixData, function(err) {
                                        if (err) {
                                            done(err);
                                            return;
                                        }
                                        fs.mkdir('./bin/release', function(err) {
                                            if (err && err.code !== 'EEXIST') {
                                                done(err);
                                                return;
                                            }
                                            fs.rename('./out/plugCubed/combined.js', './bin/release/plugCubed.src.js', function(err) {
                                                if (err) {
                                                    done(err);
                                                    return;
                                                }

                                                grunt.file.delete('./out/');

                                                done();
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            }
        }
    });
};
