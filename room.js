class Room {
    constructor(roomID){
        this.roomID = roomID;
        this.players = [];
    }

    addPlayer(player){
        this.players.push(player);
    }
    
    removePlayer(player){
        if(this.playerExists(player)){
            this.players.splice(this.players.map(x => x.playerID).indexOf(player.playerID), 1);
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