define(['plugCubed/handlers/TickerHandler'], function(TickerHandler) {
    var handler;

    try {
        handler = TickerHandler.extend({
            tickTime: 3600000, // 1 hour in milliseconds
            init: function() {
                this.count = 0;
                this.users = window.plugCubedUserData;
                this._super();
            },
            tick: function() {
                for (var i in this.users) {
                    if (!this.users.hasOwnProperty(i)) continue;
                    if (i !== -1 && this.users[i].joinTime && this.users[i].joinTime > 0 && !this.users[i].inRoom) {
                        var now = new Date().getTime();
                        var joinTime = new Date(this.users[i].joinTime).getTime();
                        var hourDiff = ~~((now - joinTime) / 3600000); // Divide by an hour in milliseconds and Math.floor it.

                        if (hourDiff > 2) {
                            this.count++;
                            delete this.users[i];
                        }

                    }
                }
                if (this.count > 0) {
                    console.log('[] Deleted ' + this.count + ' users from userdata');
                    this.count = 0;
                }
            },
            close: function() {
                this._super();
            }
        });
    } catch (e) {
        console.error('Error while creating UserData Timer');
        console.error(e);
    }

    return handler;
});
