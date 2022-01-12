const Room = require('./room')
const Player = require('./player')
const logger = require('./logger.js')

const app = require('express')();
const http = require('http').Server(app);
const io = require("socket.io")(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const cors = require('cors');

var rooms = {};
var idToPlayer = {};

app.use(cors())
app.get('/', function (req, res) {
    res.send("pong");
});

io.on('connection', function (socket) {
    logger.info(`A user (${socket.id}) connected`);

    socket.on('disconnect', function () {
        logger.info(`A user (${socket.id}) has disconnected`);

        if (!(socket.id in idToPlayer)) {
            logger.error(`An unrecognized player (${socket.id}) has disconnected (somehow)`);
            return;
        }

        const disconnectedPlayer = idToPlayer[socket.id];
        if (disconnectedPlayer["room"] == null) {
            logger.error(`A player (${socket.id}) without a room has disconnected (somehow)`);
            return;
        }
        const disconnectedRoom = disconnectedPlayer["room"];
        disconnectedPlayer.disconnect();

        if (rooms[disconnectedRoom].length == 0) {
            delete rooms[disconnectedRoom];
            logger.info(`${disconnectedRoom} has been deleted due to lack of players.`);
        }
        delete idToPlayer[socket.id]
        logger.info(`Player (${socket.id}) has been erased`)
    });

    socket.on('roomRequest', (roomInfo) => {
        if (!("roomID" in roomInfo)) return;
        if (!("nickname" in roomInfo)) return;
        // TODO: validate roomID and nickanmes -- don't let them be empty or non-alphanum chars

        const roomID = roomInfo['roomID'];
        const nickname = roomInfo['nickname'];

        if (socket.id in idToPlayer) {
            io.emit('roomRequestResult', {
                "result": "failure",
                "message": "already in a room"
            })
            return;
        }

        if (!(roomID in rooms)) {
            logger.info(`A new room ${roomID} has been created`)
            rooms[roomID] = new Room(roomID);
        }

        const player = new Player(socket.id, nickname, rooms[roomID]);
        logger.info(`A new player ${player["id"]} has been created`)

        rooms[roomID].addPlayer(player);
        idToPlayer[socket.id] = player;

        io.emit('roomRequestResult', {
            "result": "success",
            "message": "player joined a room"
        })
        logger.info(`A player (${player["id"]}) has successfully joined room ${roomID}`);
    });
});

http.listen(3001, function () {
    logger.info("Server started listening on *:3001")
});


const roomRouter = require("./routes/room");

app.use("/room", roomRouter);

