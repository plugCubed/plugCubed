define(['plugCubed/handlers/TriggerHandler', 'plugCubed/Lang', 'plugCubed/Settings', 'plugCubed/RoomSettings', 'plugCubed/Utils', 'plugCubed/bridges/PlaybackModel', 'plugCubed/dialogs/Menu', 'lang/Lang'], function(TriggerHandler, p3Lang, Settings, RoomSettings, p3Utils, PlaybackModel, Menu, Lang) {
    var handler = TriggerHandler.extend({
        trigger: 'chat',
        handler: function(data) {
            if (!(RoomSettings.rules.allowAutorespond !== false && Settings.autorespond))
                return;

            var that = this;

            var a = data.type === 'mention' && API.hasPermission(data.uid, API.ROLE.BOUNCER), b = data.message.indexOf('@') < 0 && (API.hasPermission(data.uid, API.ROLE.MANAGER) || p3Utils.isPlugCubedDeveloper(data.uid));
            if (a || b) {
                if (data.message.indexOf('!afkdisable') > -1) {
                    Settings.autorespond = false;
                    Menu.setEnabled('autorespond', Settings.autorespond);
                    Settings.save();
                    API.sendChat(p3Lang.i18n('autorespond.commandDisable', '@' + data.un));
                    $('#chat-input-field').removeAttr('disabled').attr('placeholder', Lang.chat.placeholder);
                    if (this.timeoutId != null)
                        clearTimeout(this.timeoutId);
                    return;
                }
            }

            if (data.type === 'mention' && data.message.indexOf('@'  + API.getUser().username) > -1) {
                if (Settings.autorespond && !Settings.recent) {
                    Settings.recent = true;
                    $('#chat-input-field').attr('placeholder', p3Lang.i18n('autorespond.nextIn', p3Utils.getTimestamp(Date.now() + 18E4)));
                    this.timeoutId = setTimeout(function() {
                        $('#chat-input-field').attr('placeholder', p3Lang.i18n('autorespond.next'));
                        Settings.recent = false;
                        Settings.save();
                        that.timeoutId = null;
                    }, 18E4);
                    API.sendChat('[AFK] @' + data.un + ' ' + Settings.awaymsg.split('@').join(''));
                }
            }
        },
        close: function() {
            this._super();
            if (Settings.autorespond) {
                $('#chat-input-field').removeAttr('disabled').attr('placeholder', Lang.chat.placeholder);
            }
        }
    });

    return new handler();
});