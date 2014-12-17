define(['jquery', 'plugCubed/Class', 'plugCubed/RoomSettings', 'plugCubed/StyleManager', 'plugCubed/Settings', 'plugCubed/Utils'], function($, Class, RoomSettings, Styles, Settings, p3Utils) {
    var handler = Class.extend({
        update: function() {
            var useRoomSettings = Settings.useRoomSettings[document.location.pathname.split('/')[1]];
            useRoomSettings = !!(useRoomSettings === undefined || useRoomSettings === true);

            Styles.unset(['CCC-text-admin', 'CCC-text-ambassador', 'CCC-text-host', 'CCC-text-cohost', 'CCC-text-manager', 'CCC-text-bouncer', 'CCC-text-residentdj', 'CCC-text-regular', 'CCC-text-you', 'CCC-image-admin', 'CCC-image-ambassador', 'CCC-image-host', 'CCC-image-cohost', 'CCC-image-manager', 'CCC-image-bouncer', 'CCC-image-residentdj']);

            if ((useRoomSettings && RoomSettings.chatColors.admin) || Settings.colors.admin !== Settings.colorInfo.ranks.admin.color) {
                Styles.set('CCC-text-admin', ['#user-panel:not(.is-none) .user > .icon-chat-admin + .name', '#user-lists .user > .icon-chat-admin + .name', '.message > .icon-chat-admin ~ .from', '.emote > .icon-chat-admin ~ .from', '.mention > .icon-chat-admin ~ .from { color:' + p3Utils.toRGB(Settings.colors.admin !== Settings.colorInfo.ranks.admin.color ? Settings.colors.admin : RoomSettings.chatColors.admin) + '!important; }'].join(",\n"));
            }
            if ((useRoomSettings && RoomSettings.chatColors.ambassador) || Settings.colors.ambassador !== Settings.colorInfo.ranks.ambassador.color) {
                Styles.set('CCC-text-ambassador', ['#user-panel:not(.is-none) .user > .icon-chat-ambassador + .name', '#user-lists .user > .icon-chat-ambassador + .name', '.message > .icon-chat-ambassador ~ .from', '.emote > .icon-chat-ambassador ~ .from', '.mention > .icon-chat-ambassador ~ .from { color:' + p3Utils.toRGB(Settings.colors.ambassador !== Settings.colorInfo.ranks.ambassador.color ? Settings.colors.ambassador : RoomSettings.chatColors.ambassador) + '!important; }'].join(",\n"));
            }
            if ((useRoomSettings && RoomSettings.chatColors.host) || Settings.colors.host !== Settings.colorInfo.ranks.host.color) {
                Styles.set('CCC-text-host', ['#user-panel:not(.is-none) .user > .icon-chat-host + .name', '#user-lists .user > .icon-chat-host + .name', '.message > .icon-chat-host ~ .from', '.emote > .icon-chat-host ~ .from', '.mention > .icon-chat-host ~ .from { color:' + p3Utils.toRGB(Settings.colors.host !== Settings.colorInfo.ranks.host.color ? Settings.colors.host : RoomSettings.chatColors.host) + '!important; }'].join(",\n"));
            }
            if ((useRoomSettings && RoomSettings.chatColors.cohost) || Settings.colors.cohost !== Settings.colorInfo.ranks.cohost.color) {
                Styles.set('CCC-text-cohost', ['#user-panel:not(.is-none) .user > .icon-chat-cohost + .name', '#user-lists .user > .icon-chat-cohost + .name', '.message > .icon-chat-cohost ~ .from', '.emote > .icon-chat-cohost ~ .from', '.mention > .icon-chat-cohost ~ .from', '.cohost .icon-chat-host { color:' + p3Utils.toRGB(Settings.colors.cohost !== Settings.colorInfo.ranks.cohost.color ? Settings.colors.cohost : RoomSettings.chatColors.cohost) + '!important; }'].join(",\n"));
            }
            if ((useRoomSettings && RoomSettings.chatColors.manager) || Settings.colors.manager !== Settings.colorInfo.ranks.manager.color) {
                Styles.set('CCC-text-manager', ['#user-panel:not(.is-none) .user > .icon-chat-manager + .name', '#user-lists .user > .icon-chat-manager + .name', '.message > .icon-chat-manager ~ .from', '.emote > .icon-chat-manager ~ .from', '.mention > .icon-chat-manager ~ .from { color:' + p3Utils.toRGB(Settings.colors.manager !== Settings.colorInfo.ranks.manager.color ? Settings.colors.manager : RoomSettings.chatColors.manager) + '!important; }'].join(",\n"));
            }
            if ((useRoomSettings && RoomSettings.chatColors.bouncer) || Settings.colors.bouncer !== Settings.colorInfo.ranks.bouncer.color) {
                Styles.set('CCC-text-bouncer', ['#user-panel:not(.is-none) .user > .icon-chat-bouncer + .name', '#user-lists .user > .icon-chat-bouncer + .name', '.message > .icon-chat-bouncer ~ .from', '.emote > .icon-chat-bouncer ~ .from', '.mention > .icon-chat-bouncer ~ .from { color:' + p3Utils.toRGB(Settings.colors.bouncer !== Settings.colorInfo.ranks.bouncer.color ? Settings.colors.bouncer : RoomSettings.chatColors.bouncer) + '!important; }'].join(",\n"));
            }
            if ((useRoomSettings && RoomSettings.chatColors.residentdj) || Settings.colors.residentdj !== Settings.colorInfo.ranks.residentdj.color) {
                Styles.set('CCC-text-residentdj', ['#user-panel:not(.is-none) .user > .icon-chat-dj + .name', '#user-lists .user > .icon-chat-dj + .name', '.message > .icon-chat-dj ~ .from', '.emote > .icon-chat-dj ~ .from', '.mention > .icon-chat-dj ~ .from { color:' + p3Utils.toRGB(Settings.colors.residentdj !== Settings.colorInfo.ranks.residentdj.color ? Settings.colors.residentdj : RoomSettings.chatColors.residentdj) + '!important; }'].join(",\n"));
            }
            if ((useRoomSettings && RoomSettings.chatColors.regular) || Settings.colors.regular !== Settings.colorInfo.ranks.regular.color) {
                Styles.set('CCC-text-regular', ['#user-panel:not(.is-none) .user > .name:first-child', '#user-lists .user > .name:first-child', '.message > .from', '.emote > .from', '.mention > .from { color:' + p3Utils.toRGB(Settings.colors.regular !== Settings.colorInfo.ranks.regular.color ? Settings.colors.regular : RoomSettings.chatColors.regular) + '!important; }'].join(",\n"));
            }
            if ((useRoomSettings && RoomSettings.chatColors.you) || Settings.colors.you !== Settings.colorInfo.ranks.you.color) {
                Styles.set('CCC-text-you', ['#user-lists .list .user.is-you .name', '.message > .from-you', '.emote > .from-you', '.mention > .from-you { color:' + p3Utils.toRGB(Settings.colors.you !== Settings.colorInfo.ranks.you.color ? Settings.colors.you : RoomSettings.chatColors.you) + '!important; }'].join(",\n"));
            }
            if (useRoomSettings) {
                if (RoomSettings.chatIcons.admin)
                    Styles.set('CCC-image-admin', ['.icon-chat-admin { background-image: url("' + RoomSettings.chatIcons.admin + '"); background-position: 0 0; }'].join(",\n"));
                if (RoomSettings.chatIcons.ambassador)
                    Styles.set('CCC-image-ambassador', ['.icon-chat-ambassador { background-image: url("' + RoomSettings.chatIcons.ambassador + '"); background-position: 0 0; }'].join(",\n"));
                if (RoomSettings.chatIcons.host)
                    Styles.set('CCC-image-host', ['.icon-chat-host { background-image: url("' + RoomSettings.chatIcons.host + '"); background-position: 0 0; }'].join(",\n"));
                if (RoomSettings.chatIcons.cohost)
                    Styles.set('CCC-image-cohost', ['.icon-chat-cohost, .cohost .icon-chat-host { background-image: url("' + RoomSettings.chatIcons.cohost + '"); background-position: 0 0; }'].join(",\n"));
                if (RoomSettings.chatIcons.manager)
                    Styles.set('CCC-image-manager', ['.icon-chat-manager { background-image: url("' + RoomSettings.chatIcons.manager + '"); background-position: 0 0; }'].join(",\n"));
                if (RoomSettings.chatIcons.bouncer)
                    Styles.set('CCC-image-bouncer', ['.icon-chat-bouncer { background-image: url("' + RoomSettings.chatIcons.bouncer + '"); background-position: 0 0; }'].join(",\n"));
                if (RoomSettings.chatIcons.residentdj)
                    Styles.set('CCC-image-residentdj', ['.icon-chat-dj { background-image: url("' + RoomSettings.chatIcons.residentdj + '"); background-position: 0 0; }'].join(",\n"));
            }
        }
    });
    return new handler();
});