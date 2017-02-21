define(['jquery', 'plugCubed/Class', 'plugCubed/Lang'], function($, Class, p3Lang) {
    var Handler;

    Handler = Class.extend({
        register: function() {
            $('#volume').on('mousewheel', $.proxy(this.onScroll, this));
        },
        onScroll: function(scrollEvent) {
            API.setVolume(API.getVolume() - (scrollEvent.originalEvent.wheelDelta > 0 ? -5 : 5));
        },
        close: function() {
            $('#volume').off('mousewheel', $.proxy(this.onScroll, this));
        }
    });

    return new Handler();
});
