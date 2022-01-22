const Util = require("../../utilities/util");

class ReactionTimeGame {

    constructor(room, io) {
        this.room = room;
        this.scores = {};
        this.totalScores = {}
        this.io = io;
        this.room.players.forEach(p => {
            this.totalScores[p] = 0;
            this.scores[p] = 'no score';
        });
        this.count = 5;

        this.minDelay = 3000;
        this.maxDelay = 8000;
    }

    start() {
        this.io.emit('renderReactionTime');

        this.run(this.minDelay, this.maxDelay);
    }

    run(minDelay, maxDelay) {
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
            if(this.validateScore(msg))
                this.scores[p] = msg['score']

            this.room.players.forEach(p => {
                if (this.scores[p] == 'no score') {
                    finished = false;
                }
            })

            if (finished) {
                clearTimeout(timeoutFunc)
                setTimeout(() => {
                    this.finish();
                }, 1500);
            }
        }
    }

    validateScore(scoreMsg) {
        if(!('score' in scoreMsg)) return false;
        if(typeof scoreMsg['score'] != 'number') return false;
        if(scoreMsg['score'] <= 0) return false;
        return true;
    }

    timeout() {
        this.room.players.forEach(p => {
            if (this.scores[p] == 'no score') return;
        })
        this.finish();
    }

    finish() {
        this.room.players.forEach(p => {
            p.socket.removeAllListeners('reactionTimeResult')
            if(this.scores[p] != 'no score') this.totalScores[p] += this.scores[p];
        })

        if(this.count == 0) {
            this.io.emit('reactionTimeEnd');
            this.room.status = 'scoreboard'
            this.room.players.forEach(p => {
                Util.changeStatus(this.io.to(p.socket.id), 'scoreboard')
            })
        } else {
            this.io.emit('resetReactionTime')
            this.count--;
            this.run(this.minDelay, this.maxDelay);
        }
    }
}

module.exports = ReactionTimeGame