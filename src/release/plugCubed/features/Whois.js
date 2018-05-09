define(['jquery', 'plugCubed/Class', 'plugCubed/handlers/TriggerHandler', 'plugCubed/Settings', 'plugCubed/Utils'], function($, Class, TriggerHandler, Settings, p3Utils) {
    var WatcherClass = Class.extend({
        init: function() {
            this.current = {
                waitList: [],
                dj: -1
            };
            this.last = {
                waitList: [],
                dj: -1
            };
            this.state = 0;
        },
        setWaitList: function(waitList) {
            this.current.waitList = [];
            for (var i = 0; i < waitList.length; i++) {
                this.current.waitList.push(waitList[i].id);
            }
            this.incrementState();
        },
        setDJ: function(dj) {
            this.current.dj = dj ? dj.id : -1;
            this.incrementState();
        },
        incrementState: function() {
            this.state++;
            if (this.state > 1) {
                this.last = this.current;
                this.current = {
                    waitList: [],
                    dj: -1
                };
                this.state = 0;
            }
        }
    });

    var watcher = new WatcherClass();

    var Handler = TriggerHandler.extend({
        trigger: {
            userJoin: 'onUserJoin',
            userLeave: 'onUserLeave',
            voteUpdate: 'onVoteUpdate',
            advance: 'onDjAdvance',
            waitListUpdate: 'onWaitListUpdate'
        },
        onUserJoin: function(data) {
            if (p3Utils.getUserData(data.id, 'joinTime', 0) === 0) {
                p3Utils.setUserData(data.id, 'joinTime', Date.now());
            }
        },
        onUserLeave: function(data) {
            var disconnects = p3Utils.getUserData(data.id, 'disconnects', {
                count: 0
            });

            disconnects.count++;
            disconnects.position = watcher.last.dj === data.id ? 0 : (watcher.last.waitList.indexOf(data.id) < 0 ? -1 : watcher.last.waitList.indexOf(data.id) + 1);
            disconnects.time = Date.now();
            p3Utils.setUserData(data.id, 'disconnects', disconnects);
            this.onVoteUpdate({
                user: {
                    id: data.id
                },
                vote: 0
            });
        },
        onVoteUpdate: function(data) {
            if (!data || !data.user) return;
            var curVote, wootCount, mehCount;

            curVote = p3Utils.getUserData(data.user.id, 'curVote', 0);
            wootCount = p3Utils.getUserData(data.user.id, 'wootcount', 0) - (curVote === 1 ? 1 : 0) + (data.vote === 1 ? 1 : 0);
            mehCount = p3Utils.getUserData(data.user.id, 'mehcount', 0) - (curVote === -1 ? 1 : 0) + (data.vote === -1 ? 1 : 0);

            p3Utils.setUserData(data.user.id, 'wootcount', wootCount);
            p3Utils.setUserData(data.user.id, 'mehcount', mehCount);
            p3Utils.setUserData(data.user.id, 'curVote', data.vote);
        },
        onDjAdvance: function(data) {
            if (data.media != null) {
                watcher.setDJ(data.dj);
            }
            var users = API.getUsers();

            for (var i = 0; i < users.length; i++) {
                p3Utils.setUserData(users[i].id, 'curVote', 0);
            }
        },
        onWaitListUpdate: function(data) {
            watcher.setWaitList(data);
        }
    });

    return new Handler();
});
