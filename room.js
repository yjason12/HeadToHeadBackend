class Room {
    constructor(id){
        this.id = id;
        this.players = [];
        this.leader = null;
    }

    addPlayer(player){
        this.players.push(player);
        if(this.leader == null){
            this.leader = player;
        }
    }
    
    removePlayer(player){
        if(this.playerExists(player)){
            this.players.splice(this.players.map(x => x.playerID).indexOf(player.playerID), 1);
            if(player === this.leader){
                if(this.getRoomSize() >= 1){
                    this.leader = this.players[0];
                } else{
                    this.leader = null;
                }
            }
        } else {
            console.log("tried to remove a player that does not exist in room");
        }
    }
    
    playerExists(player){
        return this.players.map(x => x.playerID).indexOf(player.playerID) != -1;
    }

    getRoomSize(){
        return this.players.length;
    }
}

Room.prototype.toString = function roomToString() {
    return `${this.id}: ${this.players}`
}

module.exports = Room