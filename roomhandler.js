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
        if(!this.checkPlayerExists(playerID) || !this.checkPlayerHasRoom(playerID))
            return

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