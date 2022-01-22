const Util = require("../../utilities/util");

class ReactionTimeGame {

    constructor(room, io) {
        this.room = room;
        this.scores = {};
        this.io = io;
        this.room.players.forEach(p => {
            this.scores[p] = 'no score';
        });
    }

    start() {
        const minDelay = 3000;
        const maxDelay = 10000;
        this.io.emit('renderReactionTime');

        setTimeout(() => {
            this.io.emit('reactionTimeStart');
        }, Math.floor(Math.random() * (maxDelay - minDelay) + minDelay));

        const endGameTimeout = setTimeout(() => {
            this.timeout();
        }, 15000);


        this.room.players.forEach(p => {
            p.socket.on('reactionTimeResult', this.processPlayerResult(endGameTimeout, p));
        })

    }

    processPlayerResult = (timeoutFunc, p) => {
        return (msg) => {
            let finished = true;
            this.scores[p] = msg['score']
            this.room.players.forEach(p => {
                if (this.scores[p] == 'no score') {
                    finished = false;
                }
            })

            console.log(finished)
            if (finished) {
                console.log("clearing timeout")
                clearTimeout(timeoutFunc)
                this.finish();
            }
        }
    }

    timeout() {
        this.room.players.forEach(p => {
            if (this.scores[p] == 'no score') return;
        })
        this.finish();
    }

    finish() {
        this.io.emit('reactionTimeEnd');
        this.room.status = 'finished'
        this.room.players.forEach(p => {
            p.socket.removeAllListeners('reactionTimeResult')
            //Util.sendToLobby(this.io.to(p.socket.id));
            Util.changeStatus(this.io.to(p.socket.id), this.room.status)
        })

    }
}

module.exports = ReactionTimeGame