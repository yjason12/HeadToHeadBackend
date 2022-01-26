const Util = require("../../utilities/util");

class ReactionTimeGame {
    
    constructor(room, io) {
        this.room = room;
        this.scores = {};
        this.totalScores = {}
        this.io = io;
        this.falseStartPenalty = 50;
        this.room.players.forEach(p => {
            this.totalScores[p] = 0;
            this.scores[p] = 0;
        });
        this.count = 2;

        this.minDelay = 2000;
        this.maxDelay = 3000;
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
            p.socket.on('processFalseStart', this.processFalseStart(p));
        })

    }

    processPlayerResult = (timeoutFunc, p) => {
        return (msg) => {
            let finished = true;

            if(this.validateScore(msg))
                this.scores[p] += msg['score']

            this.room.players.forEach(p => {
                if (this.scores[p] == 0) {
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

    processFalseStart(p){
        return () => {

            this.scores[p] += this.falseStartPenalty;
            
        };
    }
    validateScore(scoreMsg) {
        if(!('score' in scoreMsg)) return false;
        if(typeof scoreMsg['score'] != 'number') return false;
        if(scoreMsg['score'] <= 0) return false;
        return true;
    }

    timeout() {
        let finished = true;
        this.room.players.forEach(p => {
            if (this.scores[p] == 0) finished = false;
        })
        if(finished) {
            console.log(this.totalScores);
            console.log(this.scores);
            this.finish();
        }
    }

    determineAndReturnRanking(){
        //console.log(Object.keys(this.totalScores))
        let keyValuesArray = Object.keys(this.totalScores).map((key) => { return  [key, this.totalScores[key]] });
        keyValuesArray.sort( (first, second) => {return first[1] - second[1]});
        var rankingList = keyValuesArray.map((e) => { return e[0].nickname });
        return rankingList;
    }

    finish() {
        this.room.players.forEach(p => {
            if(this.scores[p] != 'no score') this.totalScores[p] += this.scores[p];
            p.socket.removeAllListeners('reactionTimeResult');
            p.socket.removeAllListeners('processFalseStart');
        })
        
        if(this.count != 0) {
            this.io.emit('resetReactionTime');
            console.log(this.scores)
            this.count--;
            this.run(this.minDelay, this.maxDelay);
        }
        if(this.count == 0) {
            console.log('game finished');
            this.io.emit('reactionTimeEnd', {
                "playerScoreMap": this.totalScores,
                "playerRankings": this.determineAndReturnRanking()
            });
            /*
            this.room.status = 'scoreboard';
            this.room.players.forEach(p => {
                Util.changeStatus(this.io.to(p.socket.id), 'scoreboard');
            })
            */
        } 
    }
}

module.exports = ReactionTimeGame