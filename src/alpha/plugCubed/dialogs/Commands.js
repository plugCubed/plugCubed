define(['jquery', 'plugCubed/Class', 'plugCubed/Lang', 'plugCubed/Utils'], function($, Class, p3Lang, p3Utils) {
    var userCommands = [
        ['/nick', 'commands.descriptions.nick'],
        ['/avail', 'commands.descriptions.avail'],
        ['/afk', 'commands.descriptions.afk'],
        ['/work', 'commands.descriptions.work'],
        ['/gaming', 'commands.descriptions.gaming'],
        ['/join', 'commands.descriptions.join'],
        ['/leave', 'commands.descriptions.leave'],
        ['/whoami', 'commands.descriptions.whoami'],
        ['/mute', 'commands.descriptions.mute'],
        ['/automute', 'commands.descriptions.automute'],
        ['/unmute', 'commands.descriptions.unmute'],
        ['/nextsong', 'commands.descriptions.nextsong'],
        ['/refresh', 'commands.descriptions.refresh'],
        ['/alertson (commands.variables.word)', 'commands.descriptions.alertson'],
        ['/alertsoff', 'commands.descriptions.alertsoff'],
        ['/curate', 'commands.descriptions.curate'],
        ['/getpos', 'commands.descriptions.getpos'],
        ['/version', 'commands.descriptions.version'],
        ['/commands', 'commands.descriptions.commands'],
        ['/link', 'commands.descriptions.link']
    ], modCommands = [
        ['/whois (commands.variables.username)', 'commands.descriptions.whois', API.ROLE.BOUNCER],
        ['/skip', 'commands.descriptions.skip', API.ROLE.BOUNCER],
        ['/ban (commands.variables.username)', 'commands.descriptions.ban', API.ROLE.BOUNCER],
        ['/lockskip', 'commands.descriptions.lockskip', API.ROLE.MANAGER],
        ['/lock', 'commands.descriptions.lock', API.ROLE.MANAGER],
        ['/unlock', 'commands.descriptions.unlock', API.ROLE.MANAGER],
        ['/add (commands.variables.username)', 'commands.descriptions.add', API.ROLE.BOUNCER],
        ['/remove (commands.variables.username)', 'commands.descriptions.remove', API.ROLE.BOUNCER],
        ['/strobe (commands.variables.onoff)', 'commands.descriptions.strobe', API.ROLE.COHOST],
        ['/rave (commands.variables.onoff)', 'commands.descriptions.rave', API.ROLE.COHOST],
        ['/whois all', 'commands.descriptions.whois', API.ROLE.AMBASSADOR],
        ['/banall', 'commands.descriptions.banall', API.ROLE.AMBASSADOR]
    ], a = Class.extend({
        print: function() {
            var content = '<strong style="font-size:1.4em;position:relative;left: -20px">' + p3Lang.i18n('commands.header') + '</strong><br />';
            content += '<strong style="position:relative;left:-20px">=== ' + p3Lang.i18n('commands.userCommands') + ' ===</strong><br />';
            for (var i in userCommands) {
                var command = userCommands[i][0];
                if (command.split('(').length > 1)
                    command = command.split('(')[0] + '(' + p3Lang.i18n(command.split('(')[1].split(')')[0]) + ')';
                content += '<div style="position:relative;left:-10px">' + command + '<br /><em style="position:relative;left:10px">' + p3Lang.i18n(userCommands[i][1]) + '</em></div>';
            }
            if (API.hasPermission(undefined, API.ROLE.BOUNCER)) {
                content += '<br /><strong style="position:relative;left:-20px">=== ' + p3Lang.i18n('commands.modCommands') + ' ===</strong><br />';
                for (var i in modCommands) {
                    if (API.hasPermission(undefined, modCommands[i][2])) {
                        var command = modCommands[i][0];
                        if (command.split('(').length > 1)
                            command = command.split('(')[0] + '(' + p3Lang.i18n(command.split('(')[1].split(')')[0]) + ')';
                        content += '<div style="position:relative;left:-10px">' + command + '<br /><em style="position:relative;left:10px">' + p3Lang.i18n(modCommands[i][1]) + '</em></div>';
                    }
                }
            }
            p3Utils.chatLog(undefined, content);
        }
    });
    return new a();
});