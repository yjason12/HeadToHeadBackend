const Util = require('../utilities/util');
const ReactionTimeGame = require('./games/reactionTimeGame');

class Room {
    constructor(id){
        this.id = id;
        this.players = []; //array of player objects
        this.leader = null;
        this.selectedGame = "";
        this.game = null;
        this.status = "lobby";
        this.idToPlayer = {};
    }

    addPlayer(player){
        this.players.push(player);
        this.idToPlayer[player.id] = player
        if(this.leader == null){
            this.leader = player;
        }
    }
    
    removePlayer(player){
        if(!this.playerExists(player)){
            throw new Error("Tried to remove a player that does not exist in room");
        }
        delete this.idToPlayer[player.id];
        this.players.splice(this.players.map(x => x.id).indexOf(player.id), 1);
        if(player === this.leader){
            if(this.getRoomSize() >= 1){
                this.leader = this.players[0];
            } else {
                this.leader = null;
            }
        }
    }
    
    playerExists(player){
        return this.players.map(x => x.id).indexOf(player.id) != -1;
    }

    getPlayerNickname(playerID){
        if(playerID in this.idToPlayer) return this.idToPlayer[playerID].getNickname();
        console.log('could not find playerid');
        return "";
    }
    getRoomSize(){
        return this.players.length;
    }

    setSelectedGame(selectedGame) {
        this.selectedGame = selectedGame;
    }

    getSelectedGame() {
        return this.selectedGame;
    }

    startGame(io) {
        Util.changeStatus(io, 'in game');
        this.status = "in game"
        if(this.selectedGame === 'ReactionTime'){
            this.game = new ReactionTimeGame(this, io);
            this.game.start();
        }
    }

    getStatus() {
        return this.status;
    }
}

Room.prototype.toString = function roomToString() {
    return `${this.id}: ${this.players}`
}

module.exports = Room