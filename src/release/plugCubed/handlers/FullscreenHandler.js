define(['jquery', 'plugCubed/Class', 'plugCubed/StyleManager'], function($, Class, Styles) {
    var fullScreen = false, fullScreenButton;

    function fullScreenResizer() {
        if (fullScreen) {
            var $appRightHeight = $('.app-right').height(),
                $djButtonHeight = $('#dj-button').height(),
                $voteHeight = $('#vote').height(),
                $docWidth = $(document).width(),
                $chatWidth = $('#chat').width();

            Styles.set('Fullscreen',
                       '.app-right { height: ' + ($appRightHeight - $voteHeight - $djButtonHeight) + 'px!important; } ' +
                       '#chat-messages { height: ' + ($('#chat-messages').height() - $voteHeight - $djButtonHeight) + 'px!important; } ' +
                       '#dj-button { right: 0px!important; top: ' + ($appRightHeight - $voteHeight - 7) + 'px!important; width: 345px!important; left: initial!important; } ' +
                       '#vote { right: 0px!important; top: ' + ($appRightHeight - 7) + 'px!important; width: 345px!important; left: initial!important; } ' +
                       '#vote .crowd-response { width: 33.33%!important; margin-right: 0px!important; }' +
                       '#woot, #woot .bottom, #meh, #meh .bottom, #dj-button, #dj-button .left { border-radius: 0px 0px 0px 0px } ' +
                       '#playback-container { height: ' + ($(document).height() - $('.app-header').height() - $('#footer').height()) + 'px!important; width: ' + ($docWidth - $chatWidth) + 'px!important; left: -9px!important; } ' +
                       '#playback-controls { left: ' + ($docWidth - $chatWidth - $('#playback-controls').width()) / 2 + 'px!important; } ' +
                       '#playback { left: 9px!important; z-index: 6; } ');
        }
    }

    var handler = Class.extend({
        create: function() {
            fullScreenButton = $('<div>').addClass('button p3-fullscreen').append($('<div>').addClass('box').text('Enlarge')).css('background-color','rgba(28,31,37,.7)');

            $('#playback-controls').append(fullScreenButton)
                .find('.button').width('25%')
                .parent().find('.button .box .icon').remove();

            fullScreenButton.click($.proxy(this.onClick, this));
        },
        onClick: function() {
            this.toggleFullScreen();
        },
        toggleFullScreen: function() {
            fullScreen = !fullScreen;
            if (fullScreen) {
                fullScreenButton.find('.box').text('Shrink');
                fullScreenResizer();
            } else {
                fullScreenButton.find('.box').text('Enlarge');
                Styles.unset('Fullscreen');
            }
        },
        register: function() {
            $(window).resize(fullScreenResizer);
        },
        close: function() {
            fullScreenButton.remove();
            $(window).off('resize', fullScreenResizer);
            Styles.unset('Fullscreen');
        }
    });
    return new handler();
});