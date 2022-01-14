const Player = require('./player')
const Room = require('./room')
const RoomHandler = require('./roomhandler');
const Util = require("./util")
const logger = require('./logger')
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

    socket.on('updatePlayerNickname', (roomInfo) => {

    });
});

http.listen(3001, function () {
    logger.info("Server started listening on *:3001")
});


const roomRouter = require("./routes/room");
app.use("/room", roomRouter);