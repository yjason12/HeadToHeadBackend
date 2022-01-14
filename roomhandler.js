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

    getNicknameList(roomID){
        return this.rooms[roomID].players.map(p => p.nickname);
    }
    checkPlayerExists(playerID) {
        return playerID in this.idToPlayer;
    }

    checkPlayerHasRoom(playerID) {
        return this.getPlayer(playerID)["room"] != null;
    }

    getRoomIDOfPlayer(playerID) {
        if(!this.checkPlayerExists(playerID))
            throw new Error("Player was not found in ID list")
        
        if(!this.checkPlayerHasRoom(playerID))
            throw new Error("Player did not have associated room")

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
        this.createRoomIfNotExist(roomID)
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