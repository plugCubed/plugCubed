var load = function() {
    console.log('plugCubed Firefox Loader v2 enabled!');
    var plug = document.createElement('script');

    plug.type = 'text/javascript';
    plug.id = 'plugCubed-loader';
    plug.src = self.options.mainJS;
    document.head.appendChild(plug);
};

load();
