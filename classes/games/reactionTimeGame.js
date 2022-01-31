const Util = require("../../utilities/util");

class ReactionTimeGame {
    
    constructor(room, io) {
        this.room = room;
        this.scores = {};
        this.totalScores = {}
        this.io = io;
        this.falseStartPenalty = 50;
        this.room.players.forEach(p => {
            this.totalScores[p.id] = 0;
            this.scores[p.id] = 0;
        });
        this.count = 2;

        this.minDelay = 2000;
        this.maxDelay = 3000;
        
        this.endGameTimeout
    }

    start() {
        this.io.emit('renderReactionTime');

        this.run(this.minDelay, this.maxDelay);
    }

    run(minDelay, maxDelay) {
        setTimeout(() => {
            this.io.emit('reactionTimeStart');
        }, Math.floor(Math.random() * (maxDelay - minDelay) + minDelay));

        console.log('starting timeout')
        this.endGameTimeout = setTimeout(() => {
            this.timeout();
        }, 15000);


        this.room.players.forEach(p => {
            p.socket.on('reactionTimeResult', this.processPlayerResult(p));
            p.socket.on('processFalseStart', this.processFalseStart(p));
        })

    }

    processPlayerResult = (p) => {
        return (msg) => {
            let finished = true;

            if(this.validateScore(msg)){
                this.scores[p.id] += msg['score']
            }

            this.room.players.forEach(p => {
                if (this.scores[p.id] == 0) {
                    finished = false;
                }
            })

            if (finished) {
                console.log('clearing timeout');
                clearTimeout(this.endGameTimeout)
                setTimeout(() => {
                    this.finish();
                }, 1500);
            }
        }
    }

    processFalseStart(p){
        return () => {

            this.scores[p.id] += this.falseStartPenalty;
            
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
            if (this.scores[p.id] == 0) finished = false;
        })
        if(finished) {
            //console.log(this.totalScores);
            //console.log(this.scores);
            console.log('finish from timeout');
            this.finish();
        }
    }

    determineAndReturnRanking(){
        //console.log(Object.keys(this.totalScores))
        let keyValuesArray = Object.keys(this.totalScores).map((key) => { return  [key, this.totalScores[key]] });
        //console.log(keyValuesArray);
        keyValuesArray.sort( (first, second) => {return first[1] - second[1]});
        //console.log(keyValuesArray);
        var rankingList = keyValuesArray.map((e) => { return [this.room.getPlayerNickname(e[0]),e[1]] });
        //console.log(rankingList);
        return rankingList;
    }

    finish() {
        this.room.players.forEach(p => {
            if(this.scores[p.id] != 'no score') this.totalScores[p.id] += this.scores[p.id];
            p.socket.removeAllListeners('reactionTimeResult');
            p.socket.removeAllListeners('processFalseStart');
        })

        if(this.count == 0) {
            console.log('game finished');
            //console.log(this.determineAndReturnRanking());
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
        if(this.count != 0) {
            this.io.emit('resetReactionTime');
            //console.log(this.scores)
            this.count--;
            console.log(this.count);
            this.run(this.minDelay, this.maxDelay);
        }
        
    }
}

module.exports = ReactionTimeGame