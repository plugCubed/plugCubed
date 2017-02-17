define(['jquery', 'plugCubed/Class', 'plugCubed/RoomSettings', 'plugCubed/StyleManager', 'plugCubed/Settings', 'plugCubed/Utils'], function($, Class, RoomSettings, Styles, Settings, p3Utils) {
    var Handler = Class.extend({
        clear: function() {
            Styles.unset(['CCC-text-admin', 'CCC-text-ambassador', 'CCC-text-host', 'CCC-text-cohost', 'CCC-text-manager', 'CCC-text-bouncer', 'CCC-text-residentdj', 'CCC-text-regular', 'CCC-text-you', 'CCC-image-admin', 'CCC-image-ambassador', 'CCC-image-host', 'CCC-image-cohost', 'CCC-image-manager', 'CCC-image-bouncer', 'CCC-image-residentdj']);
        },
        update: function() {
            var useRoomSettings = Settings.useRoomSettings[p3Utils.getRoomID()];

            useRoomSettings = !!(useRoomSettings == null || useRoomSettings === true);

            this.clear();

            if ((useRoomSettings && RoomSettings.chatColors.admin) || Settings.colors.admin !== Settings.colorInfo.ranks.admin.color) {
                Styles.set('CCC-text-admin', ['#user-rollover .rank-admin .username', '#user-lists .user > .icon-chat-admin + .name', '#footer-user .info .name .icon-chat-admin + span', '#waitlist .icon-chat-admin + span', '.from-admin .un', '.admin { color:' + p3Utils.toRGB(Settings.colors.admin !== Settings.colorInfo.ranks.admin.color ? Settings.colors.admin : RoomSettings.chatColors.admin) + '!important; }'].join(',\n'));
            }
            if ((useRoomSettings && RoomSettings.chatColors.ambassador) || Settings.colors.ambassador !== Settings.colorInfo.ranks.ambassador.color) {
                Styles.set('CCC-text-ambassador', ['#user-rollover .rank-ambassador .username', '#user-lists .user > .icon-chat-ambassador + .name', '#footer-user .info .name .icon-chat-ambassador + span', '#waitlist .icon-chat-ambassador + span', '.from-ambassador .un', '.ambassador { color:' + p3Utils.toRGB(Settings.colors.ambassador !== Settings.colorInfo.ranks.ambassador.color ? Settings.colors.ambassador : RoomSettings.chatColors.ambassador) + '!important; }'].join(',\n'));
            }
            if ((useRoomSettings && RoomSettings.chatColors.host) || Settings.colors.host !== Settings.colorInfo.ranks.host.color) {
                Styles.set('CCC-text-host', ['#user-rollover .rank-host .username', '#user-lists .user > .icon-chat-host + .name', '#footer-user .info .name .icon-chat-host + span', '#waitlist .icon-chat-host + span', '.from-host .un', '.host { color:' + p3Utils.toRGB(Settings.colors.host !== Settings.colorInfo.ranks.host.color ? Settings.colors.host : RoomSettings.chatColors.host) + '!important; }'].join(',\n'));
            }
            if ((useRoomSettings && RoomSettings.chatColors.cohost) || Settings.colors.cohost !== Settings.colorInfo.ranks.cohost.color) {
                Styles.set('CCC-text-cohost', ['#user-rollover .rank-cohost .username', '#user-lists .user > .icon-chat-cohost + .name', '#footer-user .info .name .icon-chat-cohost + span', '#waitlist .icon-chat-cohost + span', '.from-cohost .un', '.cohost { color:' + p3Utils.toRGB(Settings.colors.cohost !== Settings.colorInfo.ranks.cohost.color ? Settings.colors.cohost : RoomSettings.chatColors.cohost) + '!important; }'].join(',\n'));
            }
            if ((useRoomSettings && RoomSettings.chatColors.manager) || Settings.colors.manager !== Settings.colorInfo.ranks.manager.color) {
                Styles.set('CCC-text-manager', ['#user-rollover .rank-manager .username', '#user-lists .user > .icon-chat-manager + .name', '#footer-user .info .name .icon-chat-manager + span', '#waitlist .icon-chat-manager + span', '.from-manager .un', '.manager:not(.list) { color:' + p3Utils.toRGB(Settings.colors.manager !== Settings.colorInfo.ranks.manager.color ? Settings.colors.manager : RoomSettings.chatColors.manager) + '!important; }'].join(',\n'));
            }
            if ((useRoomSettings && RoomSettings.chatColors.bouncer) || Settings.colors.bouncer !== Settings.colorInfo.ranks.bouncer.color) {
                Styles.set('CCC-text-bouncer', ['#user-rollover .rank-bouncer .username', '#user-lists .user > .icon-chat-bouncer + .name', '#footer-user .info .name .icon-chat-bouncer + span', '#waitlist .icon-chat-bouncer + span', '.from-bouncer .un', '.bouncer:not(.list) { color:' + p3Utils.toRGB(Settings.colors.bouncer !== Settings.colorInfo.ranks.bouncer.color ? Settings.colors.bouncer : RoomSettings.chatColors.bouncer) + '!important; }'].join(',\n'));
            }
            if ((useRoomSettings && RoomSettings.chatColors.residentdj) || Settings.colors.residentdj !== Settings.colorInfo.ranks.residentdj.color) {
                Styles.set('CCC-text-residentdj', ['#user-rollover .rank-residentdj .username', '#user-lists .user > .icon-chat-dj + .name', '#footer-user .info .name .icon-chat-dj + span', '#waitlist .icon-chat-dj + span', '.from-dj .un', '.dj { color:' + p3Utils.toRGB(Settings.colors.residentdj !== Settings.colorInfo.ranks.residentdj.color ? Settings.colors.residentdj : RoomSettings.chatColors.residentdj) + '!important; }'].join(',\n'));
            }
            if ((useRoomSettings && RoomSettings.chatColors.regular) || Settings.colors.regular !== Settings.colorInfo.ranks.regular.color) {
                Styles.set('CCC-text-regular', ['#user-rollover .rank-regular .username', '#user-lists .user > .name:first-child', '.from-regular .un', '#waitlist .user .name i:not(.icon) +  span', '.regular { color:' + p3Utils.toRGB(Settings.colors.regular !== Settings.colorInfo.ranks.regular.color ? Settings.colors.regular : RoomSettings.chatColors.regular) + '!important; }'].join(',\n'));
            }
            if (Settings.colors.you !== Settings.colorInfo.ranks.you.color) {
                Styles.set('CCC-text-you', ['#user-rollover.is-you .username', '#user-lists .list .user.is-you .name', '.from-you .un', '.you { color:' + p3Utils.toRGB(Settings.colors.you) + '!important; }'].join(',\n'));
            }
            if (useRoomSettings) {
                if (RoomSettings.chatIcons.admin) {
                    Styles.set('CCC-image-admin', ['.icon-chat-admin { background-image: url("' + RoomSettings.chatIcons.admin + '"); background-position: 0 0; }'].join(',\n'));
                }
                if (RoomSettings.chatIcons.ambassador) {
                    Styles.set('CCC-image-ambassador', ['.icon-chat-ambassador { background-image: url("' + RoomSettings.chatIcons.ambassador + '"); background-position: 0 0; }'].join(',\n'));
                }
                if (RoomSettings.chatIcons.host) {
                    Styles.set('CCC-image-host', ['.icon-chat-host { background-image: url("' + RoomSettings.chatIcons.host + '"); background-position: 0 0; }'].join(',\n'));
                }
                if (RoomSettings.chatIcons.cohost) {
                    Styles.set('CCC-image-cohost', ['.icon-chat-cohost { background-image: url("' + RoomSettings.chatIcons.cohost + '"); background-position: 0 0; }'].join(',\n'));
                }
                if (RoomSettings.chatIcons.manager) {
                    Styles.set('CCC-image-manager', ['.icon-chat-manager { background-image: url("' + RoomSettings.chatIcons.manager + '"); background-position: 0 0; }'].join(',\n'));
                }
                if (RoomSettings.chatIcons.bouncer) {
                    Styles.set('CCC-image-bouncer', ['.icon-chat-bouncer { background-image: url("' + RoomSettings.chatIcons.bouncer + '"); background-position: 0 0; }'].join(',\n'));
                }
                if (RoomSettings.chatIcons.residentdj) {
                    Styles.set('CCC-image-residentdj', ['.icon-chat-dj { background-image: url("' + RoomSettings.chatIcons.residentdj + '"); background-position: 0 0; }'].join(',\n'));
                }
            }
        }
    });

    return new Handler();
});
