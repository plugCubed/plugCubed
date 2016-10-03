define(['plugCubed/Class', 'plugCubed/dialogs/ControlPanel', 'plugCubed/StyleManager', 'plugCubed/RoomSettings', 'PlugCubed/Settings'], function(Class, ControlPanel, Styles, RoomSettings, Settings) {
    var Handler, $contentDiv, $formDiv, $twitchButton, panel;

    Handler = Class.extend({
        register: function() {
            panel = ControlPanel.addPanel('Chat Emojis');

            $contentDiv = $('<div>').append($('<p>').text('Customize the emojis you want to see.'));

            panel.addContent($contentDiv);

            $formDiv = $('<div>').width(500).css('margin', '25px auto auto auto');
            $twitchButton = ControlPanel.button('Twitch Emoji', false, function() {
                Settings.emotes.twitchEmotes = !Settings.emotes.twitchEmotes;
                if (Settings.emotes.twitchEmotes) {
                    require('plugCubed/handlers/ChatHandler').loadTwitchEmotes();
                }
                Settings.save();
            });

            $formDiv.append($twitchButton.getJQueryElement());

            panel.addContent($formDiv);
        },
        close: function() {
            ControlPanel.removePanel(panel);

            $contentDiv = $formDiv = $twitchButton = panel = null;
        }
    });

    return new Handler();
});
