var fs = require('fs');

fs.createReadStream('bin/release/plugCubed.js').pipe(fs.createWriteStream('extensions/Opera/plugCubed.js'));
fs.createReadStream('bin/release/plugCubed.js').pipe(fs.createWriteStream('extensions/Firefox/data/plugCubed.js'));