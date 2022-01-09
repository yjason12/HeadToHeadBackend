const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

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
});

http.listen(3001, function() {
   console.log('listening on *:3001');
});


const roomRouter = require("./routes/room");

app.use("/room", roomRouter);