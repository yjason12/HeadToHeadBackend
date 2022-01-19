class ReactionTimeGame {

    constructor(room, io){
        this.room = room;
        this.scores = {};
        this.io = io;
        this.room.players.forEach(p => {
            this.scores[p] = 'no score';
        });
    }

    start(){
        this.io.emit('renderReactionTime');
        setTimeout(() => {
            this.io.emit('reactionTimeStart');    
        }, 3000);
        this.room.players.forEach(p => {
            p.socket.on('reactionTimeResult', (msg) => {
                console.log(msg);
            });
        })
    }
    finish(){
        this.io.emit('reactionTimeEnd');
    }
}