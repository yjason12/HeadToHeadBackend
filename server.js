const Player = require('./classes/player')
const Room = require('./classes/room')
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

        if(!roomHandler.checkPlayerHasRoom(socket.id)) {
            logger.warn(`Player (${socket.id}) without a room has disconnected (somehow)`);
            return;
        }

        logger.info(`User (${socket.id}) has disconnected`);

        const formerRoomID = roomHandler.getRoomIDOfPlayer(socket.id);
        socket.leave(formerRoomID);

        roomHandler.disconnectPlayer(socket.id);

        if(roomHandler.deleteRoomIfEmpty(formerRoomID)) {
            logger.info(`${formerRoomID} has been deleted due to lack of players.`);
        } else {
            Util.sendNicknameList(io.to(formerRoomID), roomHandler.getNicknameList(formerRoomID));
        }
        logger.info(`Player (${socket.id}) has been erased`)
    });

    socket.on('tryRoom', (roomID) => {
        logger.info(roomID);
        const roomIDCheckResult = Util.isValidRoomTry(roomID, io);
        if (roomIDCheckResult != "Success") {
            logger.warn(roomIDCheckResult);
            Util.sendFailedJoin(io.to(socket.id), "Invalid room ID");
            return;
        }
        Util.sendSuccessfulJoin(io.to(socket.id));
    })

    socket.on('roomRequest', (roomInfo) => {
        const roomInfoCheckResult = Util.isValidRoomInfo(roomInfo, io)
        if(roomInfoCheckResult != "Success") {
            logger.warn(roomInfoCheckResult);
            return
        }
        const roomID = roomInfo['roomID'];
        const nickname = roomInfo['nickname'];

        if(roomHandler.checkPlayerExists(socket.id)) {
            Util.sendFailureRoomResult(io.to(socket.id), "Already in a room");
            logger.warn(`User (${socket.id}) attempted to join another room (${roomID})`
                + ` while already being in a room (${roomHandler.getRoomIDOfPlayer(socket.id)})`);
            return;
        }

        if(roomHandler.createRoomIfNotExist(roomID)) {
            logger.info(`New room ${roomID} has been created`)
        }

        roomHandler.createPlayer(socket.id, nickname, roomID);

        Util.sendSuccessRoomResult(io.to(socket.id));
        socket.join(roomID);
        logger.info(`Player (${socket.id}) has successfully joined room ${roomID}`);
    });

    socket.on('getNicknameList', () => {
        let roomID = roomHandler.getRoomIDOfPlayer(socket.id);
        Util.sendNicknameList(io.to(roomID), roomHandler.getNicknameList(roomID));
        logger.info(`Sent player list of room ${roomID}`)
    });

    socket.on('updatePlayerNickname', (msg) => {
        let newName = msg['newName'];
        if(Util.isValidNickname(newName)){
            roomHandler.getPlayer(socket.id).changeNickname(newName);
        }
    });

    socket.on('isLeader',() => {
        let roomID = roomHandler.getRoomIDOfPlayer(socket.id);
        let playerIDList = roomHandler.getPlayerIDList(roomID);
        let leaderID = roomHandler.getLeaderID(roomID);
        logger.info(`Sent leader info for room ${roomID}`)
        playerIDList.forEach(playerID => {
            logger.info(`Sent to ${playerID} value ${playerID == leaderID}`)
            Util.sendIsLeader(io.to(playerID), playerID == leaderID);
        });
    })
});

http.listen(3001, function () {
    logger.info("Server started listening on *:3001")
});


const roomRouter = require("./routes/room");
const { util } = require('config');
app.use("/room", roomRouter);