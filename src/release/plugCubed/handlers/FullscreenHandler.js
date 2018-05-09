define(['jquery', 'plugCubed/Class', 'plugCubed/Lang'], function($, Class, p3Lang) {
    var fullScreenButton, Context, Database, Handler;

    Context = window.plugCubedModules.context;
    Database = window.plugCubedModules.database;
    Handler = Class.extend({
        create: function() {
            fullScreenButton = $('<div>')
                .addClass('button p3-fullscreen')
                .css('background-color', 'rgba(28,31,37,.7)')
                .append($('<div>')
                    .addClass('box')
                    .text(Database.settings.videoOnly ? p3Lang.i18n('fullscreen.shrink') : p3Lang.i18n('fullscreen.enlarge')));
            $('#playback-controls')
                .append(fullScreenButton)
                .find('.button')
                .width('20%')
                .parent()
                .find('.button .box .icon')
                .hide();

            fullScreenButton.click($.proxy(this.onClick, this));
        },
        onClick: function() {
            this.toggleFullScreen();
        },
        toggleFullScreen: function() {
            Database.settings.videoOnly = !Database.settings.videoOnly;
            Database.save();
            Context.trigger('change:videoOnly').trigger('audience:pause', Database.settings.videoOnly);
            fullScreenButton
                .find('.box')
                .text(Database.settings.videoOnly ? p3Lang.i18n('fullscreen.shrink') : p3Lang.i18n('fullscreen.enlarge'));
        },
        close: function() {
            fullScreenButton.remove();
            $('#playback-controls')
                .find('.button')
                .removeAttr('style')
                .parent()
                .find('.button .box .icon')
                .show();
        }
    });

    return new Handler();
});
