const RoomHandler = require("../roomhandler");

describe("room event tests", () => {
    let roomHandler;
    beforeEach(() => {
        roomHandler = new RoomHandler();
    });

    test("create player", () => {
        roomHandler.createPlayer("123456", "testnickname", "testroom");
        expect(roomHandler.checkPlayerExists("123456")).toBe(true);
    });

    test("remove player", () => {
        roomHandler.createPlayer("123456", "testnickname", "testroom");
        expect(roomHandler.checkPlayerExists("123456")).toBe(true);
        roomHandler.removePlayer("123456")
        expect(roomHandler.checkPlayerExists("123456")).toBe(false);
    });

    test("get room ID", () => {
        roomHandler.createRoomIfNotExist("testroom");
        roomHandler.createPlayer("123456", "testnickname", "testroom");
        roomHandler.addPlayerToRoom("123456", "testroom")
        expect(roomHandler.getRoomIDOfPlayer("123456")).toBe("testroom")
    });
});