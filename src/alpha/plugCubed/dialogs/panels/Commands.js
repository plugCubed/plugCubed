define(['plugCubed/Class', 'plugCubed/Utils', 'plugCubed/dialogs/ControlPanel', 'plugCubed/Lang'], function(Class, p3Utils, ControlPanel, p3Lang) {
    var Handler, $contentDiv, $table, panel;
    var userCmds = [
        ['/badges', '(commands.variables.on / | /commands.variables.off)', 'commands.descriptions.badges'],
        ['/join', 'commands.descriptions.join'],
        ['/leave', 'commands.descriptions.leave'],
        ['/whoami', 'commands.descriptions.whoami'],
        ['/mute', 'commands.descriptions.mute'],
        ['/automute', 'commands.descriptions.automute'],
        ['/unmute', 'commands.descriptions.unmute'],
        ['/nextsong', 'commands.descriptions.nextsong'],
        ['/refresh', 'commands.descriptions.refresh'],
        ['/status', 'commands.descriptions.status'],
        ['/alertson', '(commands.variables.word)', 'commands.descriptions.alertson'],
        ['/alertsoff', 'commands.descriptions.alertsoff'],
        ['/grab', 'commands.descriptions.grab'],
        ['/getpos', 'commands.descriptions.getpos'],
        ['/version', 'commands.descriptions.version'],
        ['/commands', 'commands.descriptions.commands'],
        ['/link', 'commands.descriptions.link'],
        ['/unload', 'commands.descriptions.unload'],
        ['/volume', '(commands.variables.number / + / | / - )', 'commands.descriptions.volume']
    ];
    var modCmds = [
        ['/whois', '(commands.variables.username)', 'commands.descriptions.whois', API.ROLE.BOUNCER],
        ['/skip', 'commands.descriptions.skip', API.ROLE.BOUNCER],
        ['/ban', '(commands.variables.username)', 'commands.descriptions.ban', API.ROLE.BOUNCER],
        ['/lockskip', 'commands.descriptions.lockskip', API.ROLE.MANAGER],
        ['/lock', 'commands.descriptions.lock', API.ROLE.MANAGER],
        ['/unlock', 'commands.descriptions.unlock', API.ROLE.MANAGER],
        ['/add', '(commands.variables.username)', 'commands.descriptions.add', API.ROLE.BOUNCER],
        ['/remove', '(commands.variables.username)', 'commands.descriptions.remove', API.ROLE.BOUNCER],
        ['/unban', '(commands.variables.username)', 'commands.descriptions.unban', API.ROLE.BOUNCER],
        ['/whois all', 'commands.descriptions.whois', API.ROLE.AMBASSADOR]
    ];

    function modCommands() {
        var response = $('<tr>');

        response.append($('<td>').attr({
            align: 'center',
            colspan: 3
        }).append($('<h3>').text(p3Lang.i18n('commands.modCommands'))).append($('<br>')));

        for (var i = 0; i < modCmds.length; i++) {
            if (!modCmds[i]) continue;
            if (API.hasPermission(undefined, modCmds[i][modCmds[i].length - 1])) {

                var command = modCmds[i][0];
                var $commandArgs = $('<td>').addClass('p3-command-args');
                var translatedString = '';

                if (modCmds[i].length === 4) {
                    var commandVars = modCmds[i][1];
                    var argumentTranslationParts = commandVars.split('(')[1].split(')')[0].split('/');

                    for (var j in argumentTranslationParts) {
                        if (!argumentTranslationParts.hasOwnProperty(j)) continue;
                        if (argumentTranslationParts[j] === ' | ' || argumentTranslationParts[j] === ' + ' || argumentTranslationParts[j] === ' - ') {
                            translatedString += argumentTranslationParts[j];
                        } else {
                            translatedString += p3Lang.i18n(argumentTranslationParts[j].trim());
                        }
                    }

                    $commandArgs = $commandArgs.text(translatedString);
                }
                response.append($('<tr>').append($('<td>').append($('<strong>').text(command)).addClass('p3-command').append($commandArgs)).append($('<td>').append($('<em>')).html(p3Lang.i18n(modCmds[i][(modCmds[i].length - 2)])).addClass('p3-command-description')));
            }
        }

        return response.prop('outerHTML');
    }

    function userCommands() {
        var response = $('<tr>');

        response.append($('<td>').attr({
            align: 'center',
            colspan: 3
        }).append($('<h3>').text(p3Lang.i18n('commands.userCommands'))).append($('<br>')));

        for (var i = 0; i < userCmds.length; i++) {
            if (!userCmds[i]) continue;

            var command = userCmds[i][0];
            var $commandArgs = $('<td>').addClass('p3-command-args');
            var translatedString = '';

            if (userCmds[i].length === 3) {
                var commandVars = userCmds[i][1];
                var argumentTranslationParts = commandVars.split('(')[1].split(')')[0].split('/');

                for (var j in argumentTranslationParts) {
                    if (!argumentTranslationParts.hasOwnProperty(j)) continue;
                    if (argumentTranslationParts[j] === ' | ' || argumentTranslationParts[j] === ' + ' || argumentTranslationParts[j] === ' - ') {
                        translatedString += argumentTranslationParts[j];
                    } else {
                        translatedString += p3Lang.i18n(argumentTranslationParts[j].trim());
                    }
                }

                $commandArgs = $commandArgs.text(translatedString);
            }
            response.append($('<tr>').append($('<td>').append($('<strong>').text(command)).addClass('p3-command').append($commandArgs)).append($('<td>').append($('<em>')).html(p3Lang.i18n(userCmds[i][(userCmds[i].length - 1)])).addClass('p3-command-description')));
        }

        return response.prop('outerHTML');
    }

    Handler = Class.extend({
        register: function() {
            panel = ControlPanel.addPanel('Commands');

            $contentDiv = $('<div>').append($('<h2>').text('plug³ Commands').css({
                'text-align': 'center'
            })).css({
                width: '650px',
                'font-size': '17px'
            });
            $table = $('<table>').addClass('p3-commands-list');

            $table.append(userCommands());
            if (API.hasPermission(undefined, API.ROLE.BOUNCER)) {
                $table.append(modCommands());
            }

            $contentDiv.append($('<br>')).append($table);

            panel.addContent($contentDiv);

        },
        close: function() {
            ControlPanel.removePanel(panel);

            $contentDiv = $table = null;
        }
    });

    return new Handler();

});
