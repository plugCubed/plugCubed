var fs = require('fs');

function incrementBuild(versionFile) {
    "use strict";
    var curVersion = require(versionFile);
    curVersion.build++;
    fs.writeFileSync(versionFile, 'module.exports = ' + JSON.stringify(curVersion, null, 4) + ';');
}

if (process.argv[2].indexOf('--dir ') === 0) {
    switch (process.argv[2].substr(6)) {
    case 'release':
        incrementBuild('./src/release/version.js');
        break;
    case 'alpha':
        incrementBuild('./src/alpha/version.js');
        break;
    case 'dev':
        incrementBuild('./src/dev/version.js');
        break;
    default:
        console.log('[COMPILE] Unknown dir');
    }
} else { console.log('[COMPILE] Unknown dir'); }