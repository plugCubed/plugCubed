var s, loader = function() {
    var a = {
        b: function() {
            if (typeof API !== 'undefined' && API.enabled)
                this.c(); else
                setTimeout(function() {
                    a.b();
                }, 100);
        },
        c: function() {
            console.log('plugCubed Firefox Loader v.0.1 enabled!');
            var plug = document.createElement('script');
            plug.type = 'text/javascript';
            plug.src = 'https://d1rfegul30378.cloudfront.net/files/plugCubed.js';
            document.head.appendChild(plug);
            var load = document.getElementById('firefoxP3Loader');
            load.parentNode.removeChild(load);
        }
    };
    a.b();
};

s = document.createElement('script');
s.type = 'text/javascript';
s.id = 'firefoxP3Loader';
s.text = '(' + loader.toString() + ')();';
document.head.appendChild(s);
