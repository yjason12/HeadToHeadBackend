class Room {
    constructor(roomID){
        this.roomID = roomID;
        this.players = [];
    }

    addPlayer(player){
        this.players.push(player);
    }
    
    removePlayer(player){
        this.players.splice(this.players.map(x => x.playerID).indexOf(player.playerID), 1);
    }
    
    getRoomSize(){
        return this.players.length;
    }

}