var pageMod = require('sdk/page-mod');
var self = require('sdk/self');

pageMod.PageMod({
    include: 'https://plug.dj/*',
    exclude: [
        'https://plug.dj/communities/',
        'https://plug.dj/about',
        'https://plug.dj/terms',
        'https://plug.dj/privacy',
        'https://plug.dj/logout',
        'https://plug.dj/'],
    contentScriptFile: self.data.url('loader.js')
});
