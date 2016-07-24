define(['plugCubed/Class', 'plugCubed/dialogs/ControlPanel'], function(Class, ControlPanel) {
    var Handler, $contentDiv, panel;

    Handler = Class.extend({
        register: function() {
            panel = ControlPanel.addPanel('Notifications');

            $contentDiv = $('<div>').append($('<p>').text('Control which notifications you want and how you want them.'));

            panel.addContent($contentDiv);
        },
        close: function() {
            ControlPanel.removePanel(panel);
        }
    });

    return new Handler();
});
