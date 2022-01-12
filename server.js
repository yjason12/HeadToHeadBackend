const Room = require('./room')
const Player = require('./player')
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

var rooms = {};
var idToPlayer = {};

app.get('/', function (req, res) {
    res.send("pong");
});

io.on('connection', function (socket) {
    logger.info(`User (${socket.id}) has connected`);

    socket.on('disconnect', function () {
        logger.info(`User (${socket.id}) has disconnected`);

        if (!(socket.id in idToPlayer)) {
            logger.warn(`Unrecognized player (${socket.id}) has disconnected (somehow)`);
            return;
        }

        const disconnectedPlayer = idToPlayer[socket.id];
        if (disconnectedPlayer["room"] == null) {
            logger.warn(`Player (${socket.id}) without a room has disconnected (somehow)`);
            return;
        }
        const disconnectedRoom = disconnectedPlayer["room"];
        disconnectedPlayer.disconnect();

        if (disconnectedRoom["players"].length == 0) {
            delete rooms[disconnectedRoom["id"]];
            logger.info(`${disconnectedRoom} has been deleted due to lack of players.`);
        }
        delete idToPlayer[socket.id]
        logger.info(`Player (${socket.id}) has been erased`)
    });

    socket.on('roomRequest', (roomInfo) => {
        if (!("roomID" in roomInfo)) {
            logger.warn("Invalid JSON was sent to roomRequest: Missing roomID")
            return;
        }
        if (!("nickname" in roomInfo)) {
            logger.warn("Invalid JSON was sent to roomRequest: Missing nickname")
            return;
        }

        const roomID = roomInfo['roomID'];
        const nickname = roomInfo['nickname'];

        function isValidRoomID(roomID) {
            if (roomID.length < 2 || roomID.length > 15) return false;
            if (!roomID.match(/^[0-9a-zA-Z]+$/)) return false;
            return true;
        }

        if (!isValidRoomID(roomID)) {
            logger.warn(`User attempted to use invalid roomID (${roomID})`)
            io.emit('roomRequestResult', {
                "result": "failure",
                "message": "Invalid room id"
            });
            return;
        }

        function isValidNickname(nickname) {
            if (nickname.length < 1 || nickname.length > 15) return false;
            if (!nickname.match(/^[0-9a-zA-Z]+$/)) return false;
            return true;
        }

        if (!isValidNickname(nickname)) {
            logger.warn(`User attempted to use invalid nickname (${nickname})`)
            io.emit('roomRequestResult', {
                "result": "failure",
                "message": "Invalid nickname"
            });
            return;
        }

        if (socket.id in idToPlayer) {
            io.emit('roomRequestResult', {
                "result": "failure",
                "message": "Already in a room"
            })
            logger.warn(`User (${socket.id}) attempted to join another room (${roomID})`
                + ` while already being in a room (${idToPlayer[socket.id]["room"]["id"]})`);
            return;
        }

        if (!(roomID in rooms)) {
            logger.info(`New room ${roomID} has been created`)
            rooms[roomID] = new Room(roomID);
        }

        const player = new Player(socket.id, nickname, rooms[roomID]);
        logger.info(`New player ${player["id"]} has been created`)

        rooms[roomID].addPlayer(player);
        idToPlayer[socket.id] = player;

        io.emit('roomRequestResult', {
            "result": "success",
            "message": "player joined a room"
        })
        logger.info(`Player (${player["id"]}) has successfully joined room ${roomID}`);
    });
});

http.listen(3001, function () {
    logger.info("Server started listening on *:3001")
});


const roomRouter = require("./routes/room");

app.use("/room", roomRouter);