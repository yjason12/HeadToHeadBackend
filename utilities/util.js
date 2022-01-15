class Util {
    static isValidRoomID(roomID) {
        console.log(roomID);
        if (roomID.length < 2 || roomID.length > 15) return false;
        if (!roomID.match(/^[0-9a-zA-Z]+$/)) return false;
        return true;
    }

    static isValidNickname(nickname) {
        if (nickname.length < 1 || nickname.length > 15) return false;
        if (!nickname.match(/^[0-9a-zA-Z]+$/)) return false;
        return true;
    }

    static isValidRoomTry(roomID, io) {
        if (!("roomID" in roomID)) {
            return "Invalid JSON was sent to tryRoom: Missing roomID"
        }
        if (!this.isValidRoomID(roomID["roomID"])) {
            this.sendFailureRoomResult(io, "Invalid room id")
            return `User attempted to use invalid roomID (${roomID["roomID"]})`
        }
        return "Success";
    }

    static sendFailedJoin(io, message) {
        io.emit('tryRoom', {
            "result": "failure",
            "message": message
        })
    }

    static sendSuccessfulJoin(io) {
        io.emit('tryRoom', {
            "result": "success",
            "message": "player joined a room"
        })
    }

    static isValidRoomInfo(roomInfo, io) {
        if (!("roomID" in roomInfo)) {
            return "Invalid JSON was sent to roomRequest: Missing roomID"
        }
        if (!("nickname" in roomInfo)) {
            return "Invalid JSON was sent to roomRequest: Missing nickname"
        }
        if (!this.isValidRoomID(roomInfo["roomID"])) {
            this.sendFailureRoomResult(io, "Invalid room id")
            return `User attempted to use invalid roomID (${roomInfo["roomID"]})`
        }

        if (!this.isValidNickname(roomInfo["nickname"])) {
            this.sendFailureRoomResult(io, "Invalid nickname");
            return `User attempted to use invalid nickname (${roomInfo["nickname"]})`
        }
        return "Success";
    }

    static sendFailureRoomResult(io, message) {
        io.emit('roomRequestResult', {
            "result": "failure",
            "message": message
        })
    }

    static sendSuccessRoomResult(io) {
        io.emit('roomRequestResult', {
            "result": "success",
            "message": "player joined a room"
        })
    }

    static sendNicknameList(io, list) {
        io.emit('updateNickname', {
            'nicknames': list
        })
    }

    static sendIsLeader(io, ans) {
        io.emit('updateLeader',{
            'isLeader' : ans
        })
    }
}

module.exports = Util
