define(['jquery', 'plugCubed/handlers/TriggerHandler', 'plugCubed/Settings', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/enums/Notifications'], function ($, TriggerHandler, Settings, p3Utils, p3Lang, enumNotifications) {
    var handler = TriggerHandler.extend({
        trigger: API.ADVANCE,
        handler: function (data) {
            return;
            if ((Settings.notify & enumNotifications.SONG_UNAVAILABLE) === enumNotifications.SONG_UNAVAILABLE) {
                var url;
                if (data.media.format === 1) {
                    url = 'https://gdata.youtube.com/feeds/api/videos/' + data.media.cid + '?v=2&alt=jsonc';
                } else if (data.media.format === 2) {
                    url = 'https://api.soundcloud.com/tracks/' + data.media.cid + '/?client_id=apigee';
                }
                $.ajax({
                    url: url,
                    dataType: 'json',
                    crossDomain: true,
                    success: function (response) {
                        var final;
                        if (data.media.format === 1) {
                            if (response.data.accessControl.embed === 'denied') {
                                final = 'notify.message.songEmbed';
                            }
                        } else if (data.media.format === 2) {
                            if (response.streamable === false) {
                                final = 'notify.message.songStreamable';
                            }
                        }
                        if (typeof final !== 'undefined') {
                            p3Utils.playMentionSound();
                            setTimeout(p3Utils.playMentionSound, 50);
                            p3Utils.chatLog('system', p3Lang.i18n(final) + '<br><span onclick="if (API.getMedia().cid === \'' + data.media.cid + '\') API.moderateForceSkip()" style="cursor:pointer;">Click here to skip</span>', undefined, -1);
                        }
                    },
                    error: function (response) {
                        var final;
                        if (data.media.format === 1) {
                            if (response.status === 403 && response.responseJSON.error.message === 'Private video') {
                                final = 'notify.message.songPrivate';
                            } else if (response.status === 404 && response.responseJSON.error.message === 'Video not found') {
                                final = 'notify.message.songNotFound';
                            }
                        } else if (data.media.format === 2) {
                            if (response.status === 403) {
                                final = 'notify.message.songPrivate'; //TODO: Run a second check just in case it's the API acting up.
                            } else if (response.status === 404 && response.responseJSON.errors[0].error_message === '404 - Not Found') {
                                final = 'notify.message.songNotFound';
                            }
                        }
                        if (typeof final !== 'undefined') {
                            p3Utils.playMentionSound();
                            setTimeout(p3Utils.playMentionSound, 50);
                            p3Utils.chatLog('system', p3Lang.i18n(final) + '<br><span onclick="if (API.getMedia().cid === \'' + data.media.cid + '\') API.moderateForceSkip()" style="cursor:pointer;">Click here to skip</span>', undefined, -1);
                        }
                    }
                });
            }
        }
    });
    return new handler();
});