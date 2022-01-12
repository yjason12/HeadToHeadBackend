import Room from "./room";
import Player from "./player";
const app = require('express')();
const http = require('http').Server(app);
const io = require("socket.io")(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

var cors = require('cors');
const { SocketAddress } = require('net');


//Room name to ARRAY of playerIDs
var rooms = {};

//socketID to player obj
var idToPlayer = {};

app.use(cors())
app.get('/', function (req, res) {
    res.send("pong");
});

//Whenever someone connects this gets executed
io.on('connection', function (socket) {
    console.log('A user connected');

    //Whenever someone disconnects this piece of code executed
    socket.on('disconnect', function () {
        console.log('A user disconnected');
        let roomOfID = idToRoom[socket.id];
        //console.log('room to modify:' + roomOfID);
        rooms[roomOfID].splice(rooms[roomOfID].indexOf(socket.id), 1);
        //console.log("length is " + rooms[roomOfID].length)
        if (!rooms[roomOfID].length) {
            delete rooms[roomOfID];
        }

        delete idToName[socket.id];
        delete idToRoom[socket.id];
    });

    /**
    socket.on('messagetoserver', (msg) => {
        console.log(socket.id)
        console.log(msg["id"])
        console.log('got the message');
        io.emit('message out', {
            result: "success",

        });
     });*/

    /**
     socket.on('test', (roomInfo) => {
        console.log('michael connect to yongjae');
    	
        if(socket.id in idToName){
            io.emit('test', 'already in a room');
        } else if (roomInfo['room'] in rooms) {
            rooms[roomInfo['room']].push(socket.id);
        } else {
            rooms[roomInfo['room']] = [socket.id];
        }
        idToName[socket.id] = roomInfo['id'];
        idToRoom[socket.id] = roomInfo['room'];


        io.emit('test', "!we did it!");
        //console.log(rooms[roomInfo['room']]);
        io.emit('test', rooms[roomInfo['room']]);
        io.emit('test', idToName[socket.id]);
        io.emit('test', idToRoom[socket.id]);

        console.log(rooms);
     });*/

    socket.on('roomRequest', (roomInfo) => {

        if (!("roomID" in roomInfo)) return;
        if (!("nickname" in roomInfo)) return;

        roomID = roomInfo['roomID'];
        nickname = roomInfo['nickname'];

        if (socket.id in idToPlayer) {
            io.emit('roomRequestResult', {
                "result": "failure",
                "message": "already in a room"
            })
            console.log("there was error");
            return;  
        }

        if(!(roomID in rooms)){
            rooms[roomID] = new Room(roomID);
        }

        player = new Player(socket.id, nickname, rooms[roomID]);
        rooms[roomID].addPlayer(player);
        idToPlayer[socket.id] = player;

        io.emit('roomRequestResult', {
            "result": "success",
            "message": "player joined a room"
        })

        console.log(rooms);
    });



});

http.listen(3001, function () {
    console.log('listening on *:3001');
});


const roomRouter = require("./routes/room");

app.use("/room", roomRouter);

