const Room = require("./room");
const Player = require("./player");
const logger = require("./logger");

class RoomHandler {
    constructor() {
        this.rooms = {};
        this.idToPlayer = {};
    }

    getPlayer(playerID) {
        return this.idToPlayer[playerID];
    }

    getNicknameList(){
        return Object.keys(this.idToPlayer).map(id => this.getPlayer(id).nickname)
    }
    checkPlayerExists(playerID) {
        return playerID in this.idToPlayer;
    }

    checkPlayerHasRoom(playerID) {
        return this.getPlayer(playerID)["room"] != null;
    }

    getRoomIDOfPlayer(playerID) {
        if(!this.checkPlayerExists(playerID) || !this.checkPlayerHasRoom(playerID))
            return

        return this.getPlayer(playerID)["room"]["id"]
    }

    disconnectPlayer(playerID) {
        this.getPlayer(playerID).disconnect();
    }

    deleteRoomIfEmpty(roomID) {
        if (this.rooms[roomID]["players"].length == 0) {
            delete this.rooms[roomID]
            return true;
        }
        return false;
    }

    createRoomIfNotExist(roomID) {
        if (!(roomID in this.rooms)) {
            this.rooms[roomID] = new Room(roomID);
            return true;
        }
        return false;
    }

    createPlayer(id, nickname, roomID) {
        const player = new Player(id, nickname, this.rooms[roomID]);
        this.idToPlayer[id] = player;
        this.addPlayerToRoom(player, roomID)
    }

    removePlayer(id) {
        delete this.idToPlayer[id]
    }

    addPlayerToRoom(player, roomID) {
        this.rooms[roomID].addPlayer(player);
    }
}

module.exports = RoomHandler