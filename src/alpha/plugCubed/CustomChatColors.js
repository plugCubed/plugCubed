define(['jquery', 'plugCubed/Class', 'plugCubed/RSS', 'plugCubed/StyleManager', 'plugCubed/Settings', 'plugCubed/Utils'], function($, Class, RSS, Styles, Settings, p3Utils) {
    var handler = Class.extend({
        update: function() {
            var userRoomSettings = Settings.useRoomSettings[document.location.pathname.split('/')[1]];
            userRoomSettings = !!(userRoomSettings === undefined || userRoomSettings === true);
            if ((userRoomSettings && RSS.chatColors.admin) || Settings.colors.admin !== Settings.colorInfo.ranks.admin.color) {
                Styles.set('CCC-text-admin', ['#user-panel:not(.is-none) .user > .icon-chat-admin + .name', '#user-lists .user > .icon-chat-admin + .name', '.message.from-admin > .from', '.emote.from-admin > .from', '.mention.from-admin > .from { color:' + p3Utils.toRGB(Settings.colors.admin !== Settings.colorInfo.ranks.admin.color ? Settings.colors.admin : RSS.chatColors.admin) + '!important; }'].join(",\n"));
            }
            if ((userRoomSettings && RSS.chatColors.ambassador) || Settings.colors.ambassador !== Settings.colorInfo.ranks.ambassador.color) {
                Styles.set('CCC-text-ambassador', ['#user-panel:not(.is-none) .user > .icon-chat-ambassador + .name', '#user-lists .user > .icon-chat-ambassador + .name', '.message.from-ambassador > .from', '.emote.from-ambassador > .from', '.mention.from-ambassador > .from { color:' + p3Utils.toRGB(Settings.colors.ambassador !== Settings.colorInfo.ranks.ambassador.color ? Settings.colors.ambassador : RSS.chatColors.ambassador) + '!important; }'].join(",\n"));
            }
            if ((userRoomSettings && RSS.chatColors.host) || Settings.colors.host !== Settings.colorInfo.ranks.host.color) {
                Styles.set('CCC-text-host', ['#user-panel:not(.is-none) .user > .icon-chat-host + .name', '#user-lists .user > .icon-chat-host + .name', '.message.from-host > .from', '.emote.from-host > .from', '.mention.from-host > .from { color:' + p3Utils.toRGB(Settings.colors.host !== Settings.colorInfo.ranks.host.color ? Settings.colors.host : RSS.chatColors.host) + '!important; }'].join(",\n"));
            }
            if ((userRoomSettings && RSS.chatColors.cohost) || Settings.colors.cohost !== Settings.colorInfo.ranks.cohost.color) {
                Styles.set('CCC-text-cohost', ['#user-panel:not(.is-none) .user > .icon-chat-cohost + .name', '#user-lists .user > .icon-chat-cohost + .name', '.message.from-cohost > .from', '.emote.from-cohost > .from', '.mention.from-cohost > .from { color:' + p3Utils.toRGB(Settings.colors.cohost !== Settings.colorInfo.ranks.cohost.color ? Settings.colors.cohost : RSS.chatColors.cohost) + '!important; }'].join(",\n"));
            }
            if ((userRoomSettings && RSS.chatColors.manager) || Settings.colors.manager !== Settings.colorInfo.ranks.manager.color) {
                Styles.set('CCC-text-manager', ['#user-panel:not(.is-none) .user > .icon-chat-manager + .name', '#user-lists .user > .icon-chat-manager + .name', '.message.from-manager > .from', '.emote.from-manager > .from', '.mention.from-manager > .from { color:' + p3Utils.toRGB(Settings.colors.manager !== Settings.colorInfo.ranks.manager.color ? Settings.colors.manager : RSS.chatColors.manager) + '!important; }'].join(",\n"));
            }
            if ((userRoomSettings && RSS.chatColors.bouncer) || Settings.colors.bouncer !== Settings.colorInfo.ranks.bouncer.color) {
                Styles.set('CCC-text-bouncer', ['#user-panel:not(.is-none) .user > .icon-chat-bouncer + .name', '#user-lists .user > .icon-chat-bouncer + .name', '.message.from-bouncer > .from', '.emote.from-bouncer > .from', '.mention.from-bouncer > .from { color:' + p3Utils.toRGB(Settings.colors.bouncer !== Settings.colorInfo.ranks.bouncer.color ? Settings.colors.bouncer : RSS.chatColors.bouncer) + '!important; }'].join(",\n"));
            }
            if ((userRoomSettings && RSS.chatColors.residentdj) || Settings.colors.residentdj !== Settings.colorInfo.ranks.residentdj.color) {
                Styles.set('CCC-text-residentdj', ['#user-panel:not(.is-none) .user > .icon-chat-dj + .name', '#user-lists .user > .icon-chat-dj + .name', '.message.from-residentdj > .from', '.emote.from-residentdj > .from', '.mention.from-residentdj > .from { color:' + p3Utils.toRGB(Settings.colors.residentdj !== Settings.colorInfo.ranks.residentdj.color ? Settings.colors.residentdj : RSS.chatColors.residentdj) + '!important; }'].join(",\n"));
            }
            if ((userRoomSettings && RSS.chatColors.regular) || Settings.colors.regular !== Settings.colorInfo.ranks.regular.color) {
                Styles.set('CCC-text-regular', ['#user-panel:not(.is-none) .user > .name:first-child', '#user-lists .user > .name:first-child', '.message.from > .from', '.emote.from > .from', '.mention.from > .from { color:' + p3Utils.toRGB(Settings.colors.regular !== Settings.colorInfo.ranks.regular.color ? Settings.colors.regular : RSS.chatColors.regular) + '!important; }'].join(",\n"));
            }
            if ((userRoomSettings && RSS.chatColors.you) || Settings.colors.you !== Settings.colorInfo.ranks.you.color) {
                Styles.set('CCC-text-you', ['#user-lists .list .user .name', '.message.from-you > .from', '.emote.from-you > .from', '.mention.from-you > .from { color:' + p3Utils.toRGB(Settings.colors.you !== Settings.colorInfo.ranks.you.color ? Settings.colors.you : RSS.chatColors.you) + '!important; }'].join(",\n"));
            }
            if (userRoomSettings) {
                if (RSS.chatIcons.admin)
                    Styles.set('CCC-image-admin', ['.icon-chat-admin', '.message.from-admin > .icon', '.emote.from-admin > .icon', '.mention.from-admin > .icon { background-image: url("' + RSS.chatIcons.admin + '"); background-position: 0 0; }'].join(",\n"));
                if (RSS.chatIcons.ambassador)
                    Styles.set('CCC-image-ambassador', ['.icon-chat-ambassador', '.message.from-ambassador > .icon', '.emote.from-ambassador > .icon', '.mention.from-ambassador > .icon { background-image: url("' + RSS.chatIcons.ambassador + '"); background-position: 0 0; }'].join(",\n"));
                if (RSS.chatIcons.host)
                    Styles.set('CCC-image-host', ['.icon-chat-host', '.message.from-host > .icon', '.emote.from-host > .icon', '.mention.from-host > .icon { background-image: url("' + RSS.chatIcons.host + '"); background-position: 0 0; }'].join(",\n"));
                if (RSS.chatIcons.cohost)
                    Styles.set('CCC-image-cohost', ['.icon-chat-cohost', '.message.from-cohost > .icon', '.emote.from-cohost > .icon', '.mention.from-cohost > .icon { background-image: url("' + RSS.chatIcons.cohost + '"); background-position: 0 0; }'].join(",\n"));
                if (RSS.chatIcons.manager)
                    Styles.set('CCC-image-manager', ['.icon-chat-manager', '.message.from-manager > .icon', '.emote.from-manager > .icon', '.mention.from-manager > .icon { background-image: url("' + RSS.chatIcons.manager + '"); background-position: 0 0; }'].join(",\n"));
                if (RSS.chatIcons.bouncer)
                    Styles.set('CCC-image-bouncer', ['.icon-chat-bouncer', '.message.from-bouncer > .icon', '.emote.from-bouncer > .icon', '.mention.from-bouncer > .icon { background-image: url("' + RSS.chatIcons.bouncer + '"); background-position: 0 0; }'].join(",\n"));
                if (RSS.chatIcons.residentdj)
                    Styles.set('CCC-image-residentdj', ['.icon-chat-residentdj', '.message.from-residentdj > .icon', '.emote.from-residentdj > .icon', '.mention.from-residentdj > .icon { background-image: url("' + RSS.chatIcons.residentdj + '"); background-position: 0 0; }'].join(",\n"));
            }
        }
    });
    return new handler();
});