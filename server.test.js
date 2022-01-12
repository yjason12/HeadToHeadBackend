const { createServer } = require("http");
const { Server } = require("socket.io");
const Client = require("socket.io-client");

describe("socket tests", () => {
    let io, serverSocket, clientSocket1, clientSocket2, clientSocket3;

    beforeEach((done) => {
        console.log("resetting")
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
                    clientSocket3.on("connect", done);
                });
            });
        });
    });

    afterAll(() => {
        io.close();
        clientSocket1.close();
        clientSocket2.close();
        clientSocket3.close();
    });

    test("single join room", (done) => {
        clientSocket1.on("roomRequestResult", (arg) => {
            expect(JSON.stringify(arg)).toBe(JSON.stringify({
                "result": "success",
                "message": "player joined a room"
            }));
            done();
        });

        clientSocket1.emit("roomRequest", {
            "roomID": "testroom",
            "nickname": "testnickname"
        });
    });

    test("double join room", (done) => {
        clientSocket1.on("roomRequestResult", (arg) => {
            try {
                expect(JSON.stringify(arg)).toBe(JSON.stringify({
                    "result": "success",
                    "message": "player joined a room"
                }));
            }
            catch (error) {
                done(error)
            }
        });

        clientSocket1.emit("roomRequest", {
            "roomID": "testroom",
            "nickname": "testnickname"
        });

        clientSocket2.on("roomRequestResult", (arg) => {
            try {
                expect(JSON.stringify(arg)).toBe(JSON.stringify({
                    "result": "success",
                    "message": "player joined a room"
                }));
                done();
            }
            catch (error) {
                done(error)
            }
        });

        clientSocket2.emit("roomRequest", {
            "roomID": "testroom",
            "nickname": "testnickname"
        });
    });

    test("triple join room", (done) => {
        clientSocket1.on("roomRequestResult", (arg) => {
            try {
                expect(JSON.stringify(arg)).toBe(JSON.stringify({
                    "result": "success",
                    "message": "player joined a room"
                }));
                done();
            }
            catch (error) {
                done(error)
            }
        });

        clientSocket1.emit("roomRequest", {
            "roomID": "testroom",
            "nickname": "testnickname"
        });

        clientSocket2.on("roomRequestResult", (arg) => {
            try {
                expect(JSON.stringify(arg)).toBe(JSON.stringify({
                    "result": "success",
                    "message": "player joined a room"
                }));
                done();
            }
            catch (error) {
                done(error)
            }
        });

        clientSocket2.emit("roomRequest", {
            "roomID": "testroom",
            "nickname": "testnickname"
        });

        clientSocket3.on("roomRequestResult", (arg) => {
            try {
                expect(JSON.stringify(arg)).toBe(JSON.stringify({
                    "result": "success",
                    "message": "player joined a room"
                }));
                done();
            }
            catch (error) {
                done(error)
            }
        });

        clientSocket3.emit("roomRequest", {
            "roomID": "testroom",
            "nickname": "testnickname"
        });
    });

    test("failed rejoin room", (done) => {
        let counter = 0;
        clientSocket1.on("roomRequestResult", (arg) => {
            console.log(`counter: ${counter}`)
            console.log(arg)
            if (counter == 0) {
                try {
                counter += 1
                expect(JSON.stringify(arg)).toBe(JSON.stringify({
                    "result": "success",
                    "message": "player joined a room"
                }));
                }
                catch(error) {
                    done(error);
                }
            }
            else if (counter == 1) {
                try {
                    expect(JSON.stringify(arg)).toBe(JSON.stringify({
                        "result": "failure",
                        "message": "Already in a room"
                    }));
                    done();
                }
                catch (error) {
                    done(error)
                }
            }
        });

        clientSocket1.emit("roomRequest", {
            "roomID": "testroom",
            "nickname": "testnickname"
        });

        clientSocket1.emit("roomRequest", {
            "roomID": "testroom",
            "nickname": "testnickname"
        });

    });
});