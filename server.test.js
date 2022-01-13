const { createServer } = require("http");
const { Server } = require("socket.io");
const Client = require("socket.io-client");

describe("simple socket tests", () => {
    let io, serverSocket, clientSocket1, clientSocket2, clientSocket3;

    beforeEach((done) => {
        const httpServer = createServer();
        io = new Server(httpServer);
        httpServer.listen(() => {
            clientSocket1 = new Client(`http://localhost:3001`);
            clientSocket2 = new Client(`http://localhost:3001`);
            clientSocket3 = new Client(`http://localhost:3001`);
            io.on("connection", (socket) => {
                serverSocket = socket;
            });
            clientSocket1.on("connect", () => {
                clientSocket2.on("connect", () => {
                    clientSocket3.on("connect", () => {
                        done();
                    })
                });
            });
        });
    });

    afterEach((done) => {
        io.close();
        clientSocket1.close();
        clientSocket2.close();
        clientSocket3.close();
        done();
    });

    function checkSuccessRoomRequestResult(done) {
        return (arg) => {
            try {
                expect(JSON.stringify(arg)).toBe(JSON.stringify({
                    "result": "success",
                    "message": "player joined a room"
                }));
                done();
            }
            catch (error) {
                done(error);
            }
        }
    }

    function checkFailureRoomRequestResult(done, failureMessage) {
        return (arg) => {
            try {
                expect(JSON.stringify(arg)).toBe(JSON.stringify({
                    "result": "failure",
                    "message": failureMessage
                }));
                done();
            } catch (error) {
                done(error);
            }
        }
    }

    function makeRoomRequest(socket, roomID, nickname) {
        socket.emit("roomRequest", {
            "roomID": roomID,
            "nickname": nickname
        });
    }

    test("single join room", (done) => {
        clientSocket1.on("roomRequestResult", checkSuccessRoomRequestResult(done));
        makeRoomRequest(clientSocket1, "testroom", "testnickname")
    });

    test("double join room", (done) => {
        clientSocket1.on("roomRequestResult", checkSuccessRoomRequestResult(() => {
        makeRoomRequest(clientSocket2, "testroom", "testnickname");

         }));
        makeRoomRequest(clientSocket1, "testroom", "testnickname")
        clientSocket2.on("roomRequestResult", checkSuccessRoomRequestResult(done));
        

    });

    test("triple join room", (done) => {
        clientSocket1.on("roomRequestResult", checkSuccessRoomRequestResult(() => { }));
        makeRoomRequest(clientSocket1, "testroom", "testnickname")

        clientSocket2.on("roomRequestResult", checkSuccessRoomRequestResult(() => { }));
        makeRoomRequest(clientSocket2, "testroom", "testnickname");

        clientSocket3.on("roomRequestResult", checkSuccessRoomRequestResult(done));
        makeRoomRequest(clientSocket3, "testroom", "testnickname");
    });

    test("failed rejoin same room", (done) => {
        clientSocket1.on("roomRequestResult", checkSuccessRoomRequestResult(() => {
            clientSocket1.on("roomRequestResult", checkFailureRoomRequestResult(done, "Already in a room"));
            makeRoomRequest(clientSocket1, "testroom", "testnickname");
        }));
        makeRoomRequest(clientSocket1, "testroom", "testnickname");
    });

    test("failed rejoin different room", (done) => {
        clientSocket1.on("roomRequestResult", checkSuccessRoomRequestResult(() => {
            clientSocket1.on("roomRequestResult", checkFailureRoomRequestResult(done, "Already in a room"));
            makeRoomRequest(clientSocket1, "testroom2", "testnickname");
        }));
        makeRoomRequest(clientSocket1, "testroom", "testnickname");
    });

    test("disconnect doesn't break joining", (done) => {
        clientSocket1.on("roomRequestResult", checkSuccessRoomRequestResult(() => {
        clientSocket2.on("roomRequestResult", checkSuccessRoomRequestResult(() => {
            done();}));
                clientSocket1.close();
                makeRoomRequest(clientSocket2, "testroom", "testnickname");
        }));
        makeRoomRequest(clientSocket1, "testroom", "testnickname");
    });

    test("reject invalid roomid -- empty", (done) => {
        clientSocket1.on("roomRequestResult", checkFailureRoomRequestResult(done, "Invalid room id"));
        makeRoomRequest(clientSocket1, "", "testnickname");
    });

    test("reject invalid roomid -- too long", (done) => {
        clientSocket1.on("roomRequestResult", checkFailureRoomRequestResult(done, "Invalid room id"));
        makeRoomRequest(clientSocket1, "aaaaaaaaaaaaaaaaaaaaaaa", "testnickname");
    });

    test("reject invalid roomid -- non-alphanumeric characters", (done) => {
        clientSocket1.on("roomRequestResult", checkFailureRoomRequestResult(done, "Invalid room id"));
        makeRoomRequest(clientSocket1, "!*@#&", "testnickname");
    });

    test("reject invalid nickname -- empty", (done) => {
        clientSocket1.on("roomRequestResult", checkFailureRoomRequestResult(done, "Invalid nickname"));
        makeRoomRequest(clientSocket1, "testroom", "");
    });

    test("reject invalid nickname -- too long", (done) => {
        clientSocket1.on("roomRequestResult", checkFailureRoomRequestResult(done, "Invalid nickname"));
        makeRoomRequest(clientSocket1, "testroom", "aaaaaaaaaaaaaaaaaaa");
    });

    test("reject invalid nickname -- non-alphanumeric characters", (done) => {
        clientSocket1.on("roomRequestResult", checkFailureRoomRequestResult(done, "Invalid nickname"));
        makeRoomRequest(clientSocket1, "testroom", "asd@");
    });

});