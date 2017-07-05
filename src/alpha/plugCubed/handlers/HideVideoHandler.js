define(['jquery', 'plugCubed/Class', 'plugCubed/Lang', 'plugCubed/Settings', 'plugCubed/dialogs/Menu'], function($, Class, p3Lang, Settings, Menu) {
    var hideplaybackButton, Handler;

    Handler = Class.extend({
        create: function() {
            hideplaybackButton = $('<div>')
                .addClass('button p3-hideplayback')
                .css('background-color', 'rgba(28,31,37,.82)')
                .append($('<div>')
                    .addClass('box')
                    .text(Settings.hideVideo ? p3Lang.i18n('video.show') : p3Lang.i18n('video.hide')));
            $('#playback-controls')
                .append(hideplaybackButton)
                .find('.button')
                .width('20%')
                .parent()
                .find('.button .box .icon')
                .hide();
            hideplaybackButton.click($.proxy(this.onClick, this));
        },
        onClick: function() {
            this.toggleHideVideo();
        },
        toggleHideVideo: function() {
            Settings.hideVideo = !Settings.hideVideo;
            if (Settings.hideVideo) {
                $('#playback-container').hide();
            } else {
                $('#playback-container').show();
            }
            Settings.save();
            Menu.setEnabled('hidevideo', Settings.hideVideo);
            hideplaybackButton
                .find('.box')
                .text(Settings.hideVideo ? p3Lang.i18n('video.show') : p3Lang.i18n('video.hide'));
        },
        close: function() {
            if (Settings.hideVideo) {
                $('#playback-container').show();
                Settings.hideVideo = false;
                Settings.save();
            }

            hideplaybackButton.remove();
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
