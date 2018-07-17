define(['jquery', 'plugCubed/Class', 'plugCubed/Lang'], function($, Class, p3Lang) {
    var Handler;

    Handler = Class.extend({
        register: function() {
            $('.volume-bar').on('DOMMouseScroll mousewheel', $.proxy(this.onScroll, this));
            $('.community__bottom .bottom__playback-controls--desktop > .list-unstyled').first().append($('<li id="p3-vol-percent" class="community__player-item percentage">').append($('<span>').text(API.getVolume() + '%')));
            window.plugCubedModules.currentMedia.on('change:volume', this.onVolChange);
        },
        onVolChange: function(volumeModel) {
            var currentVolume = volumeModel.get('volume');

            $('#p3-vol-percent').find('span').text(currentVolume + '%');
        },
        onScroll: function(scrollEvent) {
            if (scrollEvent.originalEvent.wheelDelta !== undefined) {
                API.setVolume(API.getVolume() + (scrollEvent.originalEvent.wheelDelta > 0 ? 5 : -5));
            } else if (scrollEvent.originalEvent.detail !== undefined && scrollEvent.originalEvent.detail !== 0) {
                API.setVolume(API.getVolume() + (scrollEvent.originalEvent.detail < 0 ? 5 : -5));
            }
        },
        close: function() {
            $('.volume-bar').off('DOMMouseScroll mousewheel', $.proxy(this.onScroll, this));
            $('#p3-vol-percent').remove();
            window.plugCubedModules.currentMedia.off('change:volume', this.onVolChange);
        }
    });

    return new Handler();
});
