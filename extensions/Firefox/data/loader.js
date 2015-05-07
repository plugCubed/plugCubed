var load = function() {
    console.log('plugCubed Firefox Loader v.0.1 enabled!');
    var plug = document.createElement('script');
    plug.type = 'text/javascript';
    plug.src = self.options.main_js;
    document.head.appendChild(plug);
};

var wait = function retry() {
    if (typeof unsafeWindow.API !== 'undefined' && unsafeWindow.API.enabled) load();
    else setTimeout(function() {
            retry();
        }, 100);
};

wait();
