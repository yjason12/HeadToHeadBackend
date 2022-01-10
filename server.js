const app = require('express')();
const http = require('http').Server(app);
const io = require("socket.io")(http, {
   cors: {
     origin: "*",
     methods: ["GET", "POST"]
   }
 });

var cors = require('cors')

app.use(cors())
app.get('/', function(req, res) {
   res.send("pong");
});

//Whenever someone connects this gets executed
io.on('connection', function(socket) {
   console.log('A user connected');

   //Whenever someone disconnects this piece of code executed
   socket.on('disconnect', function () {
      console.log('A user disconnected');
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

    socket.on('test', (roomInfo) => {
      console.log('michael connect to yongjae');
      io.emit('test', "!we did it!");
    });

});

http.listen(3001, function() {
   console.log('listening on *:3001');
});


const roomRouter = require("./routes/room");

app.use("/room", roomRouter);