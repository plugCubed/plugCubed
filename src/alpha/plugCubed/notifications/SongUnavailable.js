define(['jquery', 'plugCubed/handlers/TriggerHandler', 'plugCubed/Settings', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/enums/Notifications'], function($, TriggerHandler, Settings, p3Utils, p3Lang, enumNotifications) {
    var Handler = TriggerHandler.extend({
        trigger: API.ADVANCE,
        handler: function(data) {
            if (!data.media) return;
            if ((Settings.notify & enumNotifications.SONG_UNAVAILABLE) === enumNotifications.SONG_UNAVAILABLE && p3Utils.hasPermission(undefined, API.ROLE.BOUNCER)) {

                function notify(message) { // eslint-disable-line no-inner-declarations
                    p3Utils.playMentionSound();
                    p3Utils.chatLog(undefined, (Array.isArray(message) ? p3Lang.i18n(message[0], message[1]) : p3Lang.i18n(message)) + '<br><span onclick="if (API.getMedia().cid === \'' + data.media.cid + '\') API.moderateForceSkip()" style="cursor:pointer;">Click here to skip</span>', undefined, -6);
                }

                if (data.media.format === 1) {
                    if (gapi != null) {
                        gapi.client.youtube.videos.list({
                            id: data.media.cid,
                            part: 'contentDetails,status'
                        })
                            .then(function(youtubeData) {
                                if (youtubeData.status === 200) {
                                    if (youtubeData.result && youtubeData.result.items && youtubeData.result.items.length > 0) {
                                        var result = youtubeData.result.items[0];

                                        console.info('Items:', result);
                                        if (result.status) {
                                            var status = result.status;

                                            console.info('Status:', status);
                                            if (!status.embeddable) {
                                                notify('notify.message.songEmbed');
                                            } else if (status.privacyStatus && status.privacyStatus.toLowerCase() !== 'public') {
                                                if (status.privacyStatus.toLowerCase() === 'deleted') {
                                                    notify('notify.message.songDeleted');
                                                } else if (status.privacyStatus.toLowerCase() === 'private') {
                                                    notify('notify.message.songPrivate');
                                                }
                                            } else if (status.rejectionReason) {
                                                notify(['notify.message.songRejected', status.rejectionReason]);
                                            }
                                        }
                                    } else {
                                        notify('notify.message.songNotFound');
                                    }
                                }
                            });
                    }
                } else if (data.media.format === 2) {
                    if (SC != null) {
                        SC
                            .get('/tracks/' + data.media.cid)
                            .catch(function(err) {
                                console.error(err);
                                if (err !== null && typeof err === 'object') {
                                    if (err.status) {
                                        if (err.status === 404) {
                                            notify('notify.message.songNotFound');
                                        } else if (err.status === 403) {
                                            notify('notify.message.songPrivate');
                                        }
                                    }
                                }
                            });
                    }
                }
            }
        }
    });

    return new Handler();
});
