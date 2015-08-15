define(['jquery', 'plugCubed/Class', 'plugCubed/Lang', 'plugCubed/bridges/Context', 'plugCubed/bridges/Database'], function($, Class, p3Lang, Context, Database) {
    var fullScreenButton;
    var handler = Class.extend({
        create: function() {
            fullScreenButton = $('<div>').addClass('button p3-fullscreen').append($('<div>').addClass('box').text('Enlarge')).css('background-color', 'rgba(28,31,37,.7)');

            $('#playback-controls').append(fullScreenButton)
                .find('.button').width('25%')
                .parent().find('.button .box .icon').hide();

            fullScreenButton.click($.proxy(this.onClick, this));
        },
        onClick: function() {
            this.toggleFullScreen();
        },
        toggleFullScreen: function() {
            Database.settings.videoOnly = !Database.settings.videoOnly;
            Context.trigger('change:videoOnly');
            if (Database.settings.videoOnly) {
                fullScreenButton.find('.box').text(p3Lang.i18n('fullscreen.shrink'));
            } else {
                fullScreenButton.find('.box').text(p3Lang.i18n('fullscreen.enlarge'));
            }
        },
        close: function() {
            fullScreenButton.remove();
            $('#playback-controls').find('.button').removeAttr('style')
                .parent().find('.button .box .icon').show();
        }
    });
    return new handler();
});