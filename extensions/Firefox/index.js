var pageMod = require('sdk/page-mod');
var data = require('sdk/self').data;

pageMod.PageMod({
    include: '*.plug.dj',
    exclude: [
        '*.plug.dj/',
        '*.plug.dj/@/',
        '*.plug.dj/_/',
        '*.plug.dj/about',
        '*.plug.dj/ba',
        '*.plug.dj/dashboard',
        '*.plug.dj/jobs',
        '*.plug.dj/logout',
        '*.plug.dj/partners',
        '*.plug.dj/plot',
        '*.plug.dj/press',
        '*.plug.dj/privacy',
        '*.plug.dj/purchase',
        '*.plug.dj/subscribe',
        '*.plug.dj/team',
        '*.plug.dj/terms'
    ],
    attachTo: 'top',
    contentScriptFile: data.url('loader.js'),
    contentScriptOptions: {
        mainJS: data.url('plugCubed.js')
    }
});
