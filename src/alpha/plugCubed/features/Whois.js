define(['jquery','plugCubed/handlers/TriggerHandler', 'plugCubed/Settings', 'plugCubed/Utils', 'plugCubed/Lang'], function($, TriggerHandler, Settings, p3Utils, p3Lang) {
    var handler = TriggerHandler.extend({
        trigger: {
            userJoin: 'onUserJoin',
            userLeave: 'onUserLeave',
            voteUpdate: 'onVoteUpdate',
            advance: 'onDjAdvance'
        },
        onUserJoin: function(data) {
            if (p3Utils.getUserData(data.id, 'joinTime', 0) === 0)
                p3Utils.setUserData(data.id, 'joinTime', Date.now());
        },
        onUserLeave: function(data) {
            var disconnects = p3Utils.getUserData(data.id, 'disconnects', {
                count: 0
            });
            disconnects.count++;
            disconnects.position = API.getDJ().id === data.id ? -1 : (API.getWaitListPosition(data.id) < 0 ? -2 : API.getWaitListPosition(data.id));
            disconnects.time = Date.now();
            p3Utils.setUserData(data.id, 'disconnects', disconnects);
        },
        onVoteUpdate: function(data) {
            if (!data || !data.user) return;
            var curVote, wootCount, mehCount;

            curVote = p3Utils.getUserData(data.user.id, 'curVote', 0);
            wootCount = p3Utils.getUserData(data.user.id, 'wootcount', 0) - (curVote === 1 ? 1 : 0) + (data.vote === 1 ? 1 : 0);
            mehCount = p3Utils.getUserData(data.user.id, 'mehcount', 0) - (curVote === -1 ? 1 : 0) + (data.vote === 1 ? 1 : 0);

            p3Utils.setUserData(data.user.id, 'wootcount', wootCount);
            p3Utils.setUserData(data.user.id, 'mehcount', mehCount);
            p3Utils.setUserData(data.user.id, 'curVote', data.vote);
        },
        onDjAdvance: function() {
            var users = API.getUsers();
            for (var i in users) {
                if (users.hasOwnProperty(i))
                    p3Utils.setUserData(users[i].id, 'curVote', 0);
            }
        }
    });

    return new handler();
});