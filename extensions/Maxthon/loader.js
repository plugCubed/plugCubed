var s, loader;

loader = function() {
    var a = {
        b: function() {
            if (typeof API !== 'undefined' && API.enabled) {
                this.c();
            } else {
                setTimeout(function() {
                    a.b();
                }, 100);
            }
        },
        c: function() {
            console.log('plugCubed Maxthon loader v2.0.0 enabled!');
            $.getScript('https://plugcubed.net/scripts/release/plugCubed.min.js');
            $('#maxthonP3Loader').remove();
        }
    };

    a.b();
};

s = document.createElement('script');
s.type = 'text/javascript';
s.id = 'maxthonP3Loader';
s.innerText = '(' + loader.toString() + ')();';
document.head.appendChild(s);
