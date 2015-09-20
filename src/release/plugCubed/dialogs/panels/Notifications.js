define(['plugCubed/Class', 'plugCubed/dialogs/ControlPanel'], function(Class, ControlPanel) {
    var handler;
    var $contentDiv;
    var panel;

    handler = Class.extend({
        register: function() {
            panel = ControlPanel.addPanel('Notifications');

            $contentDiv = $('<div>').append($('<p>').text('Control which notifications you want and how you want them.'));

            panel.addContent($contentDiv);
        },
        close: function() {
            ControlPanel.removePanel(panel);
        }
    });

    return new handler();
});
