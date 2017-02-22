define(['jquery', 'plugCubed/Class', 'plugCubed/Lang'], function($, Class, p3Lang) {
    var Handler;

    Handler = Class.extend({
        register: function() {
            $('#volume').on('DOMMouseScroll mousewheel', $.proxy(this.onScroll, this));
        },
        onScroll: function(scrollEvent) {
            if (scrollEvent.originalEvent.wheelDelta !== undefined) {
                API.setVolume(API.getVolume() + (scrollEvent.originalEvent.wheelDelta > 0 ? 5 : -5));
            } else if (scrollEvent.originalEvent.detail !== undefined && scrollEvent.originalEvent.detail !== 0) {
                API.setVolume(API.getVolume() + (scrollEvent.originalEvent.detail < 0 ? 5 : -5));
            }
        },
        close: function() {
            $('#volume').off('DOMMouseScroll mousewheel', $.proxy(this.onScroll, this));
        }
    });

    return new Handler();
});
