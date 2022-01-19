const RoomHandler = require('./utilities/roomhandler');
const Util = require("./utilities/util")
const logger = require('./utilities/logger')
const app = require('express')();
const http = require('http').Server(app);
const io = require("socket.io")(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const cors = require('cors');
app.use(cors())

let roomHandler = new RoomHandler();


app.get('/', function (req, res) {
    res.send("pong");
});

io.on('connection', function (socket) {
    logger.info(`User (${socket.id}) has connected`);

    socket.on('disconnect', function () {
        if (!roomHandler.checkPlayerExists(socket.id)) {
            logger.warn(`Unrecognized player (${socket.id}) has disconnected (somehow)`);
            return;
        }

        if (!roomHandler.checkPlayerHasRoom(socket.id)) {
            logger.warn(`Player (${socket.id}) without a room has disconnected (somehow)`);
            return;
        }

        logger.info(`User (${socket.id}) has disconnected`);

        const formerRoomID = roomHandler.getRoomIDOfPlayer(socket.id);
        socket.leave(formerRoomID);

        roomHandler.disconnectPlayer(socket.id);

        if (roomHandler.deleteRoomIfEmpty(formerRoomID)) {
            logger.info(`${formerRoomID} has been deleted due to lack of players.`);
        } else {
            Util.sendNicknameList(io.to(formerRoomID), roomHandler.getNicknameList(formerRoomID));
            isLeaderFunction(formerRoomID);
        }
        logger.info(`Player (${socket.id}) has been erased`)
    });

    socket.on('roomRequest', (roomInfo) => {
        const roomInfoCheckResult = Util.isValidRoomInfo(io, roomInfo)
        if (roomInfoCheckResult != "Success") {
            logger.warn(roomInfoCheckResult);
            return
        }
        const roomID = roomInfo['roomID'];
        const nickname = roomInfo['nickname'];

        if (roomHandler.checkPlayerExists(socket.id)) {
            Util.sendFailureRoomResult(io.to(socket.id), "Already in a room");
            logger.warn(`User (${socket.id}) attempted to join another room (${roomID})`
                + ` while already being in a room (${roomHandler.getRoomIDOfPlayer(socket.id)})`);
            return;
        }

        if (roomHandler.createRoomIfNotExist(roomID)) {
            logger.info(`New room ${roomID} has been created`)
        }

        roomHandler.createPlayer(socket.id, nickname, roomID, socket);

        Util.sendSuccessRoomResult(io.to(socket.id));
        socket.join(roomID);
        logger.info(`Player (${socket.id}) has successfully joined room ${roomID}`);
    });

    socket.on('requestNicknameList', () => {
        if(!roomHandler.checkPlayerExists(socket.id)) {
            logger.warn(`Unknown player ${socket.id} requested nickname list`)
            return;
        }
        let roomID = roomHandler.getRoomIDOfPlayer(socket.id);
        Util.sendNicknameList(io.to(roomID), roomHandler.getNicknameList(roomID));
    });

    socket.on('setNickname', (nicknameMsg) => {
        if(!roomHandler.checkPlayerExists(socket.id)) {
            logger.warn(`Unknown player ${socket.id} changed nickname somehow`)
            return;
        }

        if (!('newName' in nicknameMsg)) {
            logger.warn("Invalid nickname object recieved at updatePlayerNickname")
            return;
        }

        let newName = nicknameMsg['newName'];
        if (Util.isValidNickname(newName)) {
            roomHandler.getPlayer(socket.id).changeNickname(newName);
        }
    });

    socket.on('requestLeader', () => {
        if(!roomHandler.checkPlayerExists(socket.id)) {
            logger.warn(`Unknown player ${socket.id} requested leader information`);
            return;
        }

        let roomID = roomHandler.getRoomIDOfPlayer(socket.id);
        isLeaderFunction(roomID);
    })

    const isLeaderFunction = (roomID) => {
        const playerIDList = roomHandler.getPlayerIDList(roomID);
        const leaderID = roomHandler.getLeaderID(roomID);
        logger.info(`Sent leader info for room ${roomID}`)
        playerIDList.forEach(playerID => {
            logger.info(`Sent to ${playerID} value ${playerID == leaderID} for leader check`)
            Util.sendIsLeader(io.to(playerID), playerID == leaderID);
        });
    }

    socket.on('setSelectedGame', (gameSelectMsg) => {
        if(!roomHandler.checkPlayerExists(socket.id)) {
            logger.warn(`Unknown player ${socket.id} changed selectedGame`);
            return;
        }

        if (!("game" in gameSelectMsg)) {
            logger.warn("Invalid gameSelect object recieved at gameSelected");
            return;
        }

        const roomID = roomHandler.getRoomIDOfPlayer(socket.id);
        const leaderID = roomHandler.getLeaderID(roomID);
        if (socket.id == leaderID) {
            roomHandler.setGameOfRoomID(roomID, gameSelectMsg["game"])
            Util.updateGameSelect(io.to(roomID), gameSelectMsg);
        }
    })

    socket.on('requestSelectedGame', () => {
        if(!roomHandler.checkPlayerExists(socket.id)) {
            logger.warn(`Unknown player ${socket.id} requested selectedGame`);
            return;
        }
        const roomID = roomHandler.getRoomIDOfPlayer(socket.id)
        Util.updateGameSelect(io.to(roomID), {
            "game": roomHandler.getGameOfRoomID(roomID)
        });
    })

    socket.on('startSelectedGame', () => {
       if(!roomHandler.checkPlayerExists(socket.id)){
         logger.warn(`Unknown player ${socket.id} tried to start game`);
         return;
       }
       if(!roomHandler.checkPlayerHasRoom(socket.id)){
          logger.warn(`Player ${socket.id} with no room tried to start game`);
          return;
       }
       let roomID = roomHandler.getRoomIDOfPlayer(socket.id);
       if(roomHandler.getLeaderID(roomID) != socket.id){
          logger.warn(`Player ${socket.id} tried to start game when they are not leader`);
          return;
       }
       roomHandler.startGameInRoom(roomID, io.to(roomID));
    })
});

http.listen(3001, function () {
    logger.info("Server started listening on *:3001")
});

const { updateGameSelect } = require('./utilities/util');
