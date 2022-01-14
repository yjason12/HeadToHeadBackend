const Room = require("./room");
const Player = require("./player");
const logger = require("./logger");

class RoomHandler {
    constructor() {
        this.rooms = {};
        this.idToPlayer = {};
    }

    checkPlayerExists(playerID) {
        return playerID in this.idToPlayer;
    }

    checkPlayerHasRoom(playerID) {
        return this.idToPlayer[playerID]["room"] != null;
    }

    getRoomIDOfPlayer(playerID) {
        if(!this.checkPlayerExists(playerID))
            throw new Error("Player was not found in ID list")
        
        if(!this.checkPlayerHasRoom(playerID))
            throw new Error("Player did not have associated room")

        return this.idToPlayer[playerID]["room"]["id"]
    }

    disconnectPlayer(playerID) {
        this.idToPlayer[playerID].disconnect();
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
        this.addPlayerToRoom(id, roomID)
    }

    removePlayer(id) {
        delete this.idToPlayer[id]
    }

    addPlayerToRoom(playerID, roomID) {
        this.rooms[roomID].addPlayer(this.idToPlayer[playerID]);
    }
}

module.exports = RoomHandler