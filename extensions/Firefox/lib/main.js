var pageMod = require('sdk/page-mod');
var data = require('sdk/self').data;

pageMod.PageMod({
    include: 'https://plug.dj/*',
    exclude: ['https://plug.dj/communities/', 'https://plug.dj/about', 'https://plug.dj/terms', 'https://plug.dj/privacy', 'https://plug.dj/logout', 'https://plug.dj/'],
    attachTo: 'top',
    contentScriptFile: data.url('loader.js'),
    contentScriptOptions: {
        mainJS: data.url('plugCubed.js')
    }
});
