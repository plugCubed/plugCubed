define(['plugCubed/Class', 'plugCubed/dialogs/ControlPanel'], function(Class, ControlPanel) {
    var Handler, $contentDiv, panel;

    Handler = Class.extend({
        register: function() {
            panel = ControlPanel.addPanel('Chat Customizations');

            $contentDiv = $('<div>').append($('<p>').text('Customize your chat with emojis, notificaitons, markdown, and other features.'));

            panel.addContent($contentDiv);
        },
        close: function() {
            ControlPanel.removePanel(panel);
        }
    });

    return new Handler();
});
