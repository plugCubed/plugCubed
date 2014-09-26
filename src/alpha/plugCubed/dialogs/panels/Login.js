define(['plugCubed/Class','plugCubed/dialogs/ControlPanel', 'plugCubed/Socket'], function(Class, ControlPanel, Socket) {
    var handler, loggedIn, $loginDiv, $selectButton = '', $contentDiv, panel;

    handler = Class.extend({
        register: function() {
            panel = ControlPanel.addPanel('Login');

            $contentDiv = $('<div>').append($('<p>').text('Login to your plugCubed account.')).append($('<p>').text('Using this system, you can validate and lock your userIDs to your plugCubed account.'));

            panel.addContent($contentDiv);

            function checkLoggedIn() {
                $.getJSON('https://login.plugcubed.net/check', function(data) {
                    loggedIn = data.loggedIn;
                    $selectButton = ControlPanel.button(loggedIn ? 'Already logged in' : 'Login', loggedIn ? false : true, function() {
                        if (loggedIn)
                            return;
                        $selectButton.text('Please wait');
                        var loginWindow = window.open('https://login.plugcubed.net', 'p3Login_' + Date.now(), 'height=200,width=520,toolbar=0,scrollbars=0,status=0,resizable=0,location=1,menubar=0');
                        (function() {
                            var check = function() {
                                if (loginWindow.closed) {
                                    checkLoggedIn();
                                    return;
                                }
                                setTimeout(function() {
                                    check();
                                }, 500);
                            };
                            setTimeout(function() {
                                check();
                            }, 1000);
                        })();
                    });
                });
            }

            checkLoggedIn();

            $loginDiv = $('<div>').width(500).css('margin', '25px auto auto auto').append($selectButton);

            panel.addContent($loginDiv);
        },
        close: function() {
            ControlPanel.removePanel(panel);
        }
    });
    return new handler();
});