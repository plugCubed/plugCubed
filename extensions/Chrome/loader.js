var s, loader = function() {
    var a = {
        b: function() {
            if (typeof API !== 'undefined' && API.enabled)
                this.c(); else
                setTimeout(function() {
                    a.b();
                }, 100);
        }, c: function() {
            console.log('plugCubed Chrome loader v.1.0 enabled!');
            $.getScript('http://d1rfegul30378.cloudfront.net/files/plugCubed.js');
            $('#chromeP3Loader').remove();
        }
    };
    a.b();
};

s = document.createElement('script');
s.type = 'text/javascript';
s.id = 'chromeP3Loader';
s.innerText = '(' + loader.toString() + ')();';
document.head.appendChild(s);