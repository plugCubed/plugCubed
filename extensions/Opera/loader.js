var load = function() {
    console.log('plugCubed Opera Loader v2 enabled!');
    var plug = document.createElement('script');

    plug.type = 'text/javascript';
    plug.id = 'plugCubed-loader';
    plug.src = chrome.extension.getURL('plugCubed.js');
    document.head.appendChild(plug);
};

load();
