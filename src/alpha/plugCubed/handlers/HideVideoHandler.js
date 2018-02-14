define(['jquery', 'plugCubed/Class', 'plugCubed/Lang', 'plugCubed/Settings', 'plugCubed/dialogs/Menu'], function($, Class, p3Lang, Settings, Menu) {
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
                $('#playback-container').hide();
                $('#playback')
                    .find('.background')
                    .find('img')
                    .after(
                        $('<div>')
                            .text(p3Lang.i18n('video.hidden'))
                            .css({
                                'text-align': 'center', position: 'absolute', 'font-size': '100px'
                            })
                            .attr('id', 'p3-videoHidden')
                    );
            } else {
                $('#playback-container').show();
                $('#p3-videoHidden').remove();
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

    $('#playback-controls div.button.snooze').on('click', function() {
        $('#playback .background img')
            .after(
                $('<div>')
                    .text(p3Lang.i18n('video.snooze'))
                    .css({
                        'text-align': 'center', position: 'absolute', 'font-size': '100px'
                    })
                    .attr('id', 'p3-videoSnoozed')
            );
        $('#playback-controls div.button.p3-hideplayback').hide();
        setTimeout(function() {
            $('#p3-videoSnoozed').remove();
            $('#playback-controls div.button.p3-hideplayback').show();
        }, API.getTimeRemaining() * 1000);
    });
    $('#playback-controls div.button.refresh').on('click', function() {
        if ($('#p3-videoSnoozed').length) {
            $('#p3-videoSnoozed').remove();
            $('#playback-controls div.button.p3-hideplayback').show();
        }
    });

    Context.on('change:streamDisabled', function() {
        if (window.plugCubedModules.database.settings.streamDisabled) {
            $('#playback .background img')
                .after(
                    $('<div>')
                        .text(p3Lang.i18n('video.disabled'))
                        .css({
                            'text-align': 'center', position: 'absolute', 'font-size': '100px'
                        })
                        .attr('id', 'p3-VideoDisabled')
                );
        } else {
            $('#p3-VideoDisabled').remove();
        }
    });

    return new Handler();
});
