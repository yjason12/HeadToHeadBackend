class Room {
    constructor(id){
        this.id = id;
        this.players = [];
    }

    addPlayer(player){
        this.players.push(player);
    }
    
    removePlayer(player){
        this.players.splice(this.players.map(x => x.id).indexOf(player.id), 1);
    }
    
    getRoomSize(){
        return this.players.length;
    }
}

Room.prototype.toString = function roomToString() {
    return `${this.id}: ${this.players}`
}

module.exports = Room