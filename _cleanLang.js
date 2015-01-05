var fs = require('fs');

// Release
fs.readdir('src/release/langs', function(err, files) {
    if (err) console.log('Error cleaning language files', err);
    for (var i in files) {
        if (!files.hasOwnProperty(i)) continue;
        var path = 'src/release/langs/' + files[i];
        if (path.substr(-5) === '.json') {
            fs.writeFileSync(path, fs.readFileSync(path, 'utf8').split("\\'").join("'"));
        }
    }
});

// Alpha
fs.readdir('src/alpha/langs', function(err, files) {
    if (err) console.log('Error cleaning language files', err);
    var langs = [];
    for (var i in files) {
        if (!files.hasOwnProperty(i)) continue;
        var path = 'src/alpha/langs/' + files[i];
        if (path.substr(-5) === '.json') {
            langs.push(path.split('.')[1]);
            fs.writeFileSync(path, fs.readFileSync(path, 'utf8').split("\\'").join("'"));
        }
    }
    fs.writeFileSync('src/dev/lang.json', JSON.stringify(langs));
});

// Dev
fs.readdir('src/dev/langs', function(err, files) {
    if (err) console.log('Error cleaning language files', err);
    var langs = [];
    for (var i in files) {
        if (!files.hasOwnProperty(i)) continue;
        var path = 'src/dev/langs/' + files[i];
        if (path.substr(-5) === '.json') {
            langs.push(path.split('.')[1]);
            fs.writeFileSync(path, fs.readFileSync(path, 'utf8').split("\\'").join("'"));
        }
    }
    fs.writeFileSync('src/dev/lang.json', JSON.stringify(langs));
});