class Player{

    constructor(playerID, nickname, room){
        this.playerID = playerID;
        this.nickname = nickname;
        this.room = room;
    }

    changeNickname(newNickname){
        this.nickname = newNickname;
    }

    disconnect(){
        this.room.removePlayer(this.playerID);
    }

    


    

}