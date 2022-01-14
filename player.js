class Player{

    constructor(id, nickname, room){
        this.id = id;
        this.nickname = nickname;
        this.room = room;
    }

    changeNickname(newNickname){
        this.nickname = newNickname;
    }

    //player does not need disconnect, roomhandler should disconnect the player
    disconnect(){
        this.room.removePlayer(this);
    }
}

Player.prototype.toString = function playerToString() {
    return `${this.nickname} (${this.id})`;
}

module.exports = Player