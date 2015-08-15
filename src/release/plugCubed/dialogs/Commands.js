define(['jquery', 'plugCubed/Class', 'plugCubed/Lang', 'plugCubed/Utils'], function($, Class, p3Lang, p3Utils) {
    var userCommands = [
        ['/badges (commands.variables.on/commands.variables.off)', 'commands.descriptions.badges'],
        ['/join', 'commands.descriptions.join'],
        ['/leave', 'commands.descriptions.leave'],
        ['/whoami', 'commands.descriptions.whoami'],
        ['/mute', 'commands.descriptions.mute'],
        ['/automute', 'commands.descriptions.automute'],
        ['/unmute', 'commands.descriptions.unmute'],
        ['/nextsong', 'commands.descriptions.nextsong'],
        ['/refresh', 'commands.descriptions.refresh'],
        ['/status', 'commands.descriptions.status'],
        ['/alertson (commands.variables.word)', 'commands.descriptions.alertson'],
        ['/alertsoff', 'commands.descriptions.alertsoff'],
        ['/grab', 'commands.descriptions.grab'],
        ['/getpos', 'commands.descriptions.getpos'],
        ['/version', 'commands.descriptions.version'],
        ['/commands', 'commands.descriptions.commands'],
        ['/link', 'commands.descriptions.link'],
        ['/volume (commands.variables.number/+/-)']
    ];
    var modCommands = [
        ['/whois (commands.variables.username)', 'commands.descriptions.whois', API.ROLE.BOUNCER],
        ['/skip', 'commands.descriptions.skip', API.ROLE.BOUNCER],
        ['/ban (commands.variables.username)', 'commands.descriptions.ban', API.ROLE.BOUNCER],
        ['/lockskip', 'commands.descriptions.lockskip', API.ROLE.MANAGER],
        ['/lock', 'commands.descriptions.lock', API.ROLE.MANAGER],
        ['/unlock', 'commands.descriptions.unlock', API.ROLE.MANAGER],
        ['/add (commands.variables.username)', 'commands.descriptions.add', API.ROLE.BOUNCER],
        ['/remove (commands.variables.username)', 'commands.descriptions.remove', API.ROLE.BOUNCER],
        ['/whois all', 'commands.descriptions.whois', API.ROLE.AMBASSADOR],
        ['/banall', 'commands.descriptions.banall', API.ROLE.AMBASSADOR]
    ];
    var a = Class.extend({
        userCommands: function() {
            var response = '<strong style="position:relative;left: 20%;">=== ' + p3Lang.i18n('commands.userCommands') + ' ===</strong><br><ul class="p3-commands">';
            for (var i in userCommands) {
                if (!userCommands.hasOwnProperty(i)) continue;
                var command = userCommands[i][0];
                if (command.split('(').length > 1 && command.split(')').length > 1) {
                    var argumentTranslationParts = command.split('(')[1].split(')')[0].split('/');

                    command = command.split('(')[0] + '<em>';

                    for (var j in argumentTranslationParts) {
                        if (!argumentTranslationParts.hasOwnProperty(j)) continue;
                        if (argumentTranslationParts[j] == '+' || argumentTranslationParts[j] == '-') {
                            command += argumentTranslationParts[j];
                        } else {
                            command += p3Lang.i18n(argumentTranslationParts[j]);
                        }
                    }

                    command += '</em>';
                }
                response += '<li class="userCommands">' + command + '<br><em>' + p3Lang.i18n(userCommands[i][1]) + '</em></li>';
            }
            response += '</ul>';
            return response;
        },
        modCommands: function() {
            var response = '<br><strong style="position:relative;left: 20%;">=== ' + p3Lang.i18n('commands.modCommands') + ' ===</strong><br><ul class="p3-commands">';
            for (var i in modCommands) {
                if (!modCommands.hasOwnProperty(i)) continue;
                if (API.hasPermission(undefined, modCommands[i][2])) {
                    var command = modCommands[i][0];
                    if (command.split('(').length > 1) {
                        var argumentTranslationParts = command.split('(')[1].split(')')[0].split('/');

                        command = command.split('(')[0] + '<em>';

                        for (var j in argumentTranslationParts) {
                            if (!argumentTranslationParts.hasOwnProperty(j)) continue;
                            if (argumentTranslationParts[j] == '+' || argumentTranslationParts[j] == '-') {
                                command += argumentTranslationParts[j];
                            } else {
                                command += p3Lang.i18n(argumentTranslationParts[j]);
                            }
                        }

                        command += '</em>';
                    }
                    response += '<li class="modCommands">' + command + '<br><em>' + p3Lang.i18n(modCommands[i][1]) + '</em></li>';
                }
            }
            response += '</ul>';
            return response;
        },
        print: function() {
            var content = '<strong style="font-size:1.4em;position:relative;left: 20%">' + p3Lang.i18n('commands.header') + '</strong><br>';
            content += this.userCommands();
            if (API.hasPermission(undefined, API.ROLE.BOUNCER)) {
                content += this.modCommands();
            }
            p3Utils.chatLog(undefined, content, undefined, -1);
        }
    });
    return new a();
});