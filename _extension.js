var fs = require('fs');
var Extension = require('crx');
var path = require('path');
var crx = new Extension({
    privateKey: fs.readFileSync(path.join(__dirname, 'extensions', 'key.pem'))
});
var p3Release = path.join(__dirname, 'bin', 'release', 'plugCubed.extension.js');

//Writes plug³ release files to the extension folders.
fs.createReadStream(p3Release).pipe(fs.createWriteStream(path.join(__dirname, 'extensions', 'Opera', 'plugCubed.js')));
fs.createReadStream(p3Release).pipe(fs.createWriteStream(path.join(__dirname, 'extensions', 'Chrome', 'plugCubed.js')));
fs.createReadStream(p3Release).pipe(fs.createWriteStream(path.join(__dirname, 'extensions', 'Firefox', 'data', 'plugCubed.js')));

//create Opera CRX
crx.load(path.join(__dirname, 'extensions', 'Opera'))
    .then(function() {
        return crx.pack().then(function(crxBuffer) {
            fs.writeFile(path.join(__dirname, 'extensions', 'Opera.crx'), crxBuffer);
            console.log('[Extension Pack]', 'Opera CRX written');
        }).then(function() {
            //create Chrome Zip
            crx.load(path.join(__dirname, 'extensions', 'Chrome'))
                .then(function() {
                    return crx.loadContents();
                })
                .then(function(archiveBuffer) {
                    fs.writeFile(path.join(__dirname, 'extensions', 'Chrome.zip'), archiveBuffer);
                    console.log('[Extension Pack]', 'Chrome Zip Written');
                    return crx.pack(archiveBuffer);
                });
        });
    });
