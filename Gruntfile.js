var fs, path;
fs = require('fs');
path = require('path');

var config;
config = require(path.resolve((process.env.USERPROFILE || process.env.HOME), 'p3.config.js'));

var deleteFolderRecursive = function(path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function(file) {
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) {
                deleteFolderRecursive(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};


var versionRelease, versionAlpha, versionDev;
versionRelease = require('./src/release/version.js');
versionAlpha = require('./src/alpha/version.js');
versionDev = require('./src/dev/version.js');

module.exports = function(grunt) {
    require('time-grunt')(grunt);

    var verboseEnabled = grunt.option('verbose');

    grunt.initConfig({
        concat: {
            release: {
                src: ['src/release/plugCubed.js'],
                dest: 'bin/release/plugCubed.src.js'
            }
        },
        exec: {
            packCRX: {
                command: '"' + config.paths.chromePath + '" --pack-extension="' + path.resolve(__dirname, 'extensions', 'Opera') + '" --pack-extension-key="' + path.resolve(__dirname, 'extensions', 'key.pem') + '"'
            },
            packMXADDON: {
                command: '"' + config.paths.mxPackerPath + '" "' + path.resolve(__dirname, 'extensions', 'Maxthon') + '"'
            },
            alphaToRelease: {
                command: 'xcopy "src/alpha" "src/release" /S /Y'
            },
            devToAlpha: {
                command: 'xcopy "src/dev" "src/alpha" /S /Y'
            }
        },
        execute: {
            getRoom: {
                options: {
                    cwd: config.paths.plugDeobfuscation
                },
                src: [config.paths.plugDeobfuscation + '/getRoom.js']
            },
            createConfig: {
                options: {
                    cwd: config.paths.plugDeobfuscation,
                    args: ('-c -f app.js' + (verboseEnabled ? ' -v' : '')).split(' ')
                },
                src: [config.paths.plugDeobfuscation + '/main.js']
            },
            deobfuscate: {
                options: {
                    cwd: config.paths.plugDeobfuscation,
                    args: ('-d -f app.beautified.js' + (verboseEnabled ? ' -v' : '')).split(' ')
                },
                src: [config.paths.plugDeobfuscation + '/main.js']
            },
            reobfuscateRelease: {
                options: {
                    args: ('-r -f bin/release/plugCubed.src.js -o bin/release/plugCubed.js' + (verboseEnabled ? ' -v' : '')).split(' ')
                },
                src: [config.paths.plugDeobfuscation + '/main.js']
            },
            reobfuscateAlpha: {
                options: {
                    args: ('-r -f bin/alpha/plugCubed.src.js -o bin/alpha/plugCubed.js' + (verboseEnabled ? ' -v' : '')).split(' ')
                },
                src: [config.paths.plugDeobfuscation + '/main.js']
            },
            reobfuscateDev: {
                options: {
                    args: ('-r -f bin/dev/plugCubed.src.js -o bin/dev/plugCubed.js' + (verboseEnabled ? ' -v' : '')).split(' ')
                },
                src: [config.paths.plugDeobfuscation + '/main.js']
            },
            cleanLang: {
                src: ['_cleanLang.js']
            },
            incrementBuildRelease: {
                options: {
                    args: '--dir release'
                },
                src: ['_incrementBuild.js']
            },
            incrementBuildAlpha: {
                options: {
                    args: '--dir alpha'
                },
                src: ['_incrementBuild.js']
            },
            incrementBuildDev: {
                options: {
                    args: '--dir dev'
                },
                src: ['_incrementBuild.js']
            },
            closureCompilerRelease: {
                options: {
                    args: '--dir release'
                },
                src: ['_compile.js']
            },
            closureCompilerAlpha: {
                options: {
                    args: '--dir alpha'
                },
                src: ['_compile.js']
            },
            closureCompilerDev: {
                options: {
                    args: '--dir dev'
                },
                src: ['_compile.js']
            },
            extension: {
                src: ['_extension.js']
            }
        },
        replace: {
            linksRelease: {
                src: ['src/release/**/*.js', 'src/release/*.js', 'src/release/**/*.css', 'src/release/*.css'],
                overwrite: true,
                replacements: [{
                    from: 'https://d1rfegul30378.cloudfront.net/alpha/',
                    to: 'https://d1rfegul30378.cloudfront.net/files/'
                }, {
                    from: 'https://d1rfegul30378.cloudfront.net/dev/',
                    to: 'https://d1rfegul30378.cloudfront.net/files/'
                }, {
                    from: 'https://localhost:7000/_',
                    to: 'https://socket.plugcubed.net/_'
                }]
            },
            linksAlpha: {
                src: ['src/alpha/**/*.js', 'src/alpha/*.js', 'src/alpha/**/*.css', 'src/alpha/*.css'],
                overwrite: true,
                replacements: [{
                    from: 'https://d1rfegul30378.cloudfront.net/files/',
                    to: 'https://d1rfegul30378.cloudfront.net/alpha/'
                }, {
                    from: 'https://d1rfegul30378.cloudfront.net/dev/',
                    to: 'https://d1rfegul30378.cloudfront.net/alpha/'
                }, {
                    from: 'https://localhost:7000/_',
                    to: 'https://socket.plugcubed.net/_'
                }]
            },
            linksDev: {
                src: ['src/dev/**/*.js', 'src/dev/*.js', 'src/dev/**/*.css', 'src/dev/*.css'],
                overwrite: true,
                replacements: [{
                    from: 'https://d1rfegul30378.cloudfront.net/alpha/',
                    to: 'https://d1rfegul30378.cloudfront.net/dev/'
                }, {
                    from: 'https://d1rfegul30378.cloudfront.net/files/',
                    to: 'https://d1rfegul30378.cloudfront.net/dev/'
                }, {
                    from: 'https://socket.plugcubed.net/_',
                    to: 'https://localhost:7000/_'
                }]
            },
            versionRelease: {
                src: ['bin/release/plugCubed.src.js'],
                overwrite: true,
                replacements: [{
                    from: 'VERSION.MAJOR',
                    to: versionRelease.major.toString()
                }, {
                    from: 'VERSION.MINOR',
                    to: versionRelease.minor.toString()
                }, {
                    from: 'VERSION.PATCH',
                    to: versionRelease.patch.toString()
                }, {
                    from: 'VERSION.PRERELEASE',
                    to: ''
                }, {
                    from: 'VERSION.BUILD',
                    to: versionRelease.build.toString()
                }]
            },
            versionAlpha: {
                src: ['bin/alpha/plugCubed.src.js'],
                overwrite: true,
                replacements: [{
                    from: 'VERSION.MAJOR',
                    to: versionAlpha.major.toString()
                }, {
                    from: 'VERSION.MINOR',
                    to: versionAlpha.minor.toString()
                }, {
                    from: 'VERSION.PATCH',
                    to: versionAlpha.patch.toString()
                }, {
                    from: 'VERSION.PRERELEASE',
                    to: 'alpha'
                }, {
                    from: 'VERSION.BUILD',
                    to: versionAlpha.build.toString()
                }]
            },
            versionDev: {
                src: ['bin/dev/plugCubed.src.js'],
                overwrite: true,
                replacements: [{
                    from: 'VERSION.MAJOR',
                    to: versionDev.major.toString()
                }, {
                    from: 'VERSION.MINOR',
                    to: versionDev.minor.toString()
                }, {
                    from: 'VERSION.PATCH',
                    to: versionDev.patch.toString()
                }, {
                    from: 'VERSION.PRERELEASE',
                    to: 'dev'
                }, {
                    from: 'VERSION.BUILD',
                    to: versionDev.build.toString()
                }]
            },
            operaVersionExtension: {
                src: ['extensions/shared/manifest.src.json'],
                dest: 'extensions/Opera/manifest.json',
                replacements: [{
                    from: 'VERSION.MAJOR',
                    to: versionRelease.major.toString()
                }, {
                    from: 'VERSION.MINOR',
                    to: versionRelease.minor.toString()
                }, {
                    from: 'VERSION.PATCH',
                    to: versionRelease.patch.toString()
                }, {
                    from: 'VERSION.PRERELEASE',
                    to: versionRelease.prerelease
                }, {
                    from: 'VERSION.BUILD',
                    to: versionRelease.build.toString()
                }]
            },
            maxthonVersionExtension: {
                src: ['extensions/shared/def.src.json'],
                dest: 'extensions/Maxthon/def.json',
                replacements: [{
                    from: 'VERSION.MAJOR',
                    to: versionRelease.major.toString()
                }, {
                    from: 'VERSION.MINOR',
                    to: versionRelease.minor.toString()
                }, {
                    from: 'VERSION.PATCH',
                    to: versionRelease.patch.toString()
                }, {
                    from: 'VERSION.PRERELEASE',
                    to: versionRelease.prerelease
                }, {
                    from: 'VERSION.BUILD',
                    to: versionRelease.build.toString()
                }]
            },
            firefoxVersionExtension: {
                src: ['extensions/shared/package.src.json'],
                dest: 'extensions/Firefox/package.json',
                replacements: [{
                    from: 'VERSION.MAJOR',
                    to: versionRelease.major.toString()
                }, {
                    from: 'VERSION.MINOR',
                    to: versionRelease.minor.toString()
                }, {
                    from: 'VERSION.PATCH',
                    to: versionRelease.patch.toString()
                }, {
                    from: 'VERSION.PRERELEASE',
                    to: versionRelease.prerelease
                }, {
                    from: 'VERSION.BUILD',
                    to: versionRelease.build.toString()
                }]
            },
            enableMinifyRelease: {
                src: ['bin/release/plugCubed.src.js'],
                overwrite: true,
                replacements: [{
                    from: 'minified: false',
                    to: 'minified: true'
                }]
            },
            enableMinifyAlpha: {
                src: ['bin/alpha/plugCubed.src.js'],
                overwrite: true,
                replacements: [{
                    from: 'minified: false',
                    to: 'minified: true'
                }]
            },
            enableMinifyDev: {
                src: ['bin/dev/plugCubed.src.js'],
                overwrite: true,
                replacements: [{
                    from: 'minified: false',
                    to: 'minified: true'
                }]
            }
        },
        requirejs: {
            release: {
                options: {
                    appDir: './src/release',
                    baseUrl: '.',
                    dir: './out',
                    optimize: 'none',
                    keepBuildDir: false,
                    removeCombined: false,
                    findNestedDependencies: true,
                    paths: {
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
                                                fs.mkdir('./bin/alpha', function(err) {
                                                    if (err && err.code !== 'EEXIST') {
                                                        done(err);
                                                        return;
                                                    }
                                                    fs.rename('./out/plugCubed/combined.js', './bin/release/plugCubed.src.js', function(err) {
                                                        if (err) {
                                                            done(err);
                                                            return;
                                                        }

                                                        deleteFolderRecursive('./out/');

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
            },
            alpha: {
                options: {
                    appDir: './src/alpha',
                    baseUrl: '.',
                    dir: './out',
                    optimize: 'none',
                    keepBuildDir: false,
                    removeCombined: false,
                    findNestedDependencies: true,
                    paths: {
                        jquery: 'empty:',
                        underscore: 'empty:',
                        'lang/Lang': 'empty:'
                    },
                    modules: [{
                        name: 'plugCubed/Loader',
                        include: []
                    }],
                    done: function(done) {
                        fs.readFile('./src/alpha/plugCubed/_postfix.js', function(err, postfixData) {
                            if (err) {
                                done(err);
                                return;
                            }
                            fs.readFile('./out/plugCubed/Loader.js', function(err, p3Data) {
                                if (err) {
                                    done(err);
                                    return;
                                }
                                fs.readFile('./src/alpha/plugCubed/_prefix.js', function(err, prefixData) {
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
                                                fs.mkdir('./bin/alpha', function(err) {
                                                    if (err && err.code !== 'EEXIST') {
                                                        done(err);
                                                        return;
                                                    }
                                                    fs.rename('./out/plugCubed/combined.js', './bin/alpha/plugCubed.src.js', function(err) {
                                                        if (err) {
                                                            done(err);
                                                            return;
                                                        }

                                                        deleteFolderRecursive('./out/');

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
            },
            dev: {
                options: {
                    appDir: './src/dev',
                    baseUrl: '.',
                    dir: './out',
                    optimize: 'none',
                    keepBuildDir: false,
                    removeCombined: false,
                    findNestedDependencies: true,
                    paths: {
                        jquery: 'empty:',
                        underscore: 'empty:',
                        'lang/Lang': 'empty:'
                    },
                    modules: [{
                        name: 'plugCubed/Loader',
                        include: []
                    }],
                    done: function(done) {
                        fs.readFile('./src/dev/plugCubed/_postfix.js', function(err, postfixData) {
                            if (err) {
                                done(err);
                                return;
                            }
                            fs.readFile('./out/plugCubed/Loader.js', function(err, p3Data) {
                                if (err) {
                                    done(err);
                                    return;
                                }
                                fs.readFile('./src/dev/plugCubed/_prefix.js', function(err, prefixData) {
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
                                                fs.mkdir('./bin/dev', function(err) {
                                                    if (err && err.code !== 'EEXIST') {
                                                        done(err);
                                                        return;
                                                    }
                                                    fs.rename('./out/plugCubed/combined.js', './bin/dev/plugCubed.src.js', function(err) {
                                                        if (err) {
                                                            done(err);
                                                            return;
                                                        }

                                                        deleteFolderRecursive('./out/');

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
            }
        },
        "mozilla-addon-sdk": {
            '1_17': {
                options: {
                    revision: "1.17"
                }
            }
        },
        "mozilla-cfx-xpi": {
            release: {
                options: {
                    "mozilla-addon-sdk": "1_17",
                    extension_dir: path.resolve(__dirname, 'extensions', 'Firefox'),
                    dist_dir: "extensions/Firefox-release"
                }
            }
        },
        requirejs_obfuscate: {
            options: {
                root: 'plugCubed',
                quotes: 'single',
                length: 6,
                output: true
            },
            release: {
                options: {
                    dir: './bin/release/',
                    salt: config.requirejs.salt('release')
                }
            },
            alpha: {
                options: {
                    dir: './bin/alpha/',
                    salt: config.requirejs.salt('alpha')
                }
            },
            dev: {
                options: {
                    dir: './bin/dev/',
                    salt: config.requirejs.salt('dev')
                }
            }
        },
        s3: {
            options: {
                accessKeyId: config.aws.accessKeyId,
                secretAccessKey: config.aws.secretAccessKey,
                bucket: 'plug3',
                headers: {
                    CacheControl: 300
                },
                dryRun: false,
                cacheTTL: 5 * 60 * 1000
            },
            updateCode: {
                files: [{
                    src: config.paths.plugDeobfuscation + '/updatecode.txt',
                    dest: 'updatecode.txt'
                }]
            },
            donations: {
                files: [{
                    src: 'titles.json',
                    dest: 'titles.json'
                }]
            },
            release: {
                files: [{
                    src: 'bin/release/plugCubed.css',
                    dest: 'files/plugCubed.css'
                }, {
                    src: 'bin/release/plugCubed.js',
                    dest: 'files/plugCubed.js'
                }, {
                    src: 'bin/release/plugCubed.min.js',
                    dest: 'files/plugCubed.min.js'
                }, {
                    src: 'src/release/lang.json',
                    dest: 'files/lang.json'
                }, {
                    cwd: 'src/release/images',
                    src: '**.png',
                    dest: 'files/images/'
                }, {
                    cwd: 'src/release/langs',
                    src: '**.json',
                    dest: 'files/langs/'
                }]
            },
            alpha: {
                files: [{
                    src: 'bin/alpha/plugCubed.css',
                    dest: 'alpha/plugCubed.css'
                }, {
                    src: 'bin/alpha/plugCubed.js',
                    dest: 'alpha/plugCubed.js'
                }, {
                    src: 'bin/alpha/plugCubed.min.js',
                    dest: 'alpha/plugCubed.min.js'
                }, {
                    src: 'src/alpha/lang.json',
                    dest: 'alpha/lang.json'
                }, {
                    cwd: 'src/alpha/images',
                    src: '**.png',
                    dest: 'alpha/images/'
                }, {
                    cwd: 'src/alpha/langs',
                    src: '**.json',
                    dest: 'alpha/langs/'
                }]
            },
            dev: {
                files: [{
                    src: 'bin/dev/plugCubed.css',
                    dest: 'dev/plugCubed.css'
                }, {
                    src: 'src/dev/lang.json',
                    dest: 'dev/lang.json'
                }, {
                    cwd: 'src/dev/images',
                    src: '**.png',
                    dest: 'dev/images/'
                }, {
                    cwd: 'src/dev/images/badges',
                    src: '**.png',
                    dest: 'dev/images/badges/'
                }, {
                    cwd: 'src/dev/images/icons',
                    src: '**.png',
                    dest: 'dev/images/icons/'
                }, {
                    cwd: 'src/dev/images/ranks',
                    src: '**.png',
                    dest: 'dev/images/ranks/'
                }, {
                    cwd: 'src/dev/langs',
                    src: '**.json',
                    dest: 'dev/langs/'
                }]
            },
            userscript: {
                files: [{
                    src: 'plugCubed.user.js',
                    dest: 'files/plugCubed.user.js'
                }]
            }
        }
    });

    // Load tasks
    grunt.loadNpmTasks('grunt-aws');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-execute');
    grunt.loadNpmTasks('grunt-mozilla-addon-sdk');
    grunt.loadNpmTasks('grunt-requirejs-obfuscate');
    grunt.loadNpmTasks('grunt-text-replace');

    // Extensions
    grunt.registerTask('extension:packOpera', ['replace:operaVersionExtension', 'exec:packCRX']);
    grunt.registerTask('extension:packMaxthon', ['replace:maxthonVersionExtension', 'exec:packMXADDON']);
    grunt.registerTask('extension:packFirefox', ['replace:firefoxVersionExtension', 'mozilla-addon-sdk', 'mozilla-cfx-xpi']);
    grunt.registerTask('extension', ['execute:extension', 'extension:packFirefox', 'extension:packOpera', 'extension:packMaxthon']);

    grunt.registerTask('build:release', ['replace:linksRelease', 'requirejs:release', 'replace:versionRelease', 'execute:reobfuscateRelease', 'replace:enableMinifyRelease', 'requirejs_obfuscate:release', 'execute:closureCompilerRelease', 'extension']);
    grunt.registerTask('build:alpha', ['replace:linksAlpha', 'requirejs:alpha', 'replace:versionAlpha', 'execute:reobfuscateAlpha', 'replace:enableMinifyAlpha', 'requirejs_obfuscate:alpha', 'execute:closureCompilerAlpha']);
    grunt.registerTask('build:dev', ['replace:linksDev', 'requirejs:dev', 'replace:versionDev', 'execute:reobfuscateDev', 'replace:enableMinifyDev', 'execute:closureCompilerDev']);
    grunt.registerTask('build', ['execute:cleanLang', 'build:release', 'build:alpha', 'build:dev']);

    grunt.registerTask('update', ['execute:getRoom', 'execute:createConfig', 'execute:deobfuscate', 'build']);
    grunt.registerTask('default', 'build');

    grunt.registerTask('publish:release', ['execute:incrementBuildRelease', 'build:release', 's3:release']);
    grunt.registerTask('publish:alpha', ['execute:incrementBuildAlpha', 'build:alpha', 's3:alpha']);
    grunt.registerTask('publish:dev', ['execute:incrementBuildDev', 'build:dev', 's3:dev']);
    grunt.registerTask('publish', ['publish:release', 'publish:alpha', 'publish:dev']);
};