var ClosureCompiler, compressor, fs;

ClosureCompiler = require("closurecompiler");
compressor = require('yuicompressor');
fs = require('fs');

function compileJS(input, output) {
    ClosureCompiler.compile([input], {
        compilation_level: 'SIMPLE_OPTIMIZATIONS',
        process_jquery_primitives: true,
        charset: 'utf-8',
        language_in: 'ECMASCRIPT5'
    }, function(error, result) {
        if (error)
            console.log(error);
        if (result) {
            fs.writeFile(output, result, function(err) {
                if (err) {
                    console.log('[JS] Could not save to file', err);
                } else {
                    console.log('[JS] Saved to file');
                }
            });
        }
    });
}

function compileCSS(input, output) {
    compressor.compress(input, {
        charset: 'utf8',
        type: 'css',
        'line-break': 1
    }, function(err, data) {
        if (err) {
            console.log('[CSS] Could not save to file', err);
            return;
        }
        fs.writeFile(output, data, function(err) {
            if (err) {
                console.log('[CSS] Could not save to file', err);
            } else {
                console.log('[CSS] Saved to file');
            }
        });
    });
}

if (process.argv[2].indexOf('--dir ') === 0) {
    switch (process.argv[2].substr(6)) {
        case 'release':
            compileJS('./bin/release/plugCubed.js', './bin/release/plugCubed.min.js');
            compileCSS('./src/release/plugCubed.css', './bin/release/plugCubed.css');
            break;
        case 'alpha':
            compileJS('./bin/alpha/plugCubed.js', './bin/alpha/plugCubed.min.js');
            compileCSS('./src/alpha/plugCubed.css', './bin/alpha/plugCubed.css');
            break;
        case 'dev':
            compileJS('./bin/dev/plugCubed.js', './bin/dev/plugCubed.min.js');
            compileCSS('./src/dev/plugCubed.css', './bin/dev/plugCubed.css');
            break;
        default:
            console.log('[COMPILE] Unknown dir');
    }
} else console.log('[COMPILE] Unknown dir');