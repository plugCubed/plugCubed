var load = function() {

    // Regex to test if user is not in a room then do not load plugCubed
    if (window.location && window.location.href && !/(?:https?:\/\/(?:[a-z]+.)*plug\.dj)\/(?!about|ba|dashboard|giftsub|jobs|plot|press|privacy|subscribe|teams|terms|_\/|@\/)(.+)/i.test(window.location.href)) return;

    console.log('plugCubed Firefox Loader v2 enabled!');
    var plug = document.createElement('script');

    plug.type = 'text/javascript';
    plug.id = 'plugCubed-loader';
    plug.src = self.options.mainJS;
    document.head.appendChild(plug);
};

load();
