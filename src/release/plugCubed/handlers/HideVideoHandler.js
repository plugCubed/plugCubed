define(['jquery', 'plugCubed/Class', 'plugCubed/Lang', 'plugCubed/Settings', 'plugCubed/dialogs/Menu', 'plugCubed/Utils'], function($, Class, p3Lang, Settings, Menu, p3Utils) {
    var hideplaybackButton, Handler, Context;

    Context = window.plugCubedModules.context;
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
                $('.community__playing').hide();
                $('.left-side-wrapper-inner').css('background-size', '0 0');
                p3Utils.toggleVideoOverlay(true, 'video.hidden');
            } else {
                $('.community__playing').show();
                $('.left-side-wrapper-inner').css('background-size', '');
                p3Utils.toggleVideoOverlay(false, 'video.hidden');
            }
            Settings.save();
            Menu.setEnabled('hidevideo', Settings.hideVideo);
            hideplaybackButton
                .find('.box')
                .text(Settings.hideVideo ? p3Lang.i18n('video.show') : p3Lang.i18n('video.hide'));
            $('.item.p3-s-hidevideo').find('span').text(Settings.hideVideo ? p3Lang.i18n('video.show') : p3Lang.i18n('video.hide'));
        },
        close: function() {
            if (Settings.hideVideo) {
                $('.left-side-wrapper-inner').css('background-size', '');
                p3Utils.toggleVideoOverlay(false, 'video.hidden');
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

    $('#playback-controls div.button.snooze').on('click', function() {
        p3Utils.toggleVideoOverlay(true, 'video.snoozed');
        $('#playback-controls div.button.p3-hideplayback').hide();
        setTimeout(function() {
            p3Utils.toggleVideoOverlay(false, 'video.snoozed');
            $('#playback-controls div.button.p3-hideplayback').show();
        }, API.getTimeRemaining() * 1000);
    });
    $('#playback-controls div.button.refresh').on('click', function() {
        if ($('#p3-videoSnoozed').length) {
            p3Utils.toggleVideoOverlay(false, 'video.snoozed');
            $('#playback-controls div.button.p3-hideplayback').show();
        }
    });

    Context.on('change:streamDisabled', function() {
        if (window.plugCubedModules.database.settings.streamDisabled) {
            p3Utils.toggleVideoOverlay(true, 'video.disabled');
        } else {
            p3Utils.toggleVideoOverlay(false, 'video.disabled');
        }
    });

    return new Handler();
});
