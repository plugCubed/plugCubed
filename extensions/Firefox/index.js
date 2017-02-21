var pageMod = require('sdk/page-mod');
var data = require('sdk/self').data;

pageMod.PageMod({
    include: '*.plug.dj',
    attachTo: 'top',
    contentScriptFile: data.url('loader.js'),
    contentScriptOptions: {
        mainJS: data.url('plugCubed.js')
    }
});

