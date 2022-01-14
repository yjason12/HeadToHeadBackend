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

    test("check player has room", () =>{
        roomHandler.createPlayer("123456", "testnickname", "testroom");
        expect(roomHandler.checkPlayerHasRoom("123456")).toBe(true);
    });

    test("get room ID", () => {
        roomHandler.createRoomIfNotExist("testroom");
        roomHandler.createPlayer("123456", "testnickname", "testroom");
        expect(roomHandler.getRoomIDOfPlayer("123456")).toBe("testroom");
    });

    test("disconnect player", () => {//idk why test is failing
        roomHandler.createPlayer("playerID1", "nickname", "testroom");
        roomHandler.disconnectPlayer("playerID1");
        expect(roomHandler.checkPlayerExists("playerID1")).toBe(false);
    });

    test("no duplicate room created", () =>{
        roomHandler.createRoomIfNotExist("testroom");
        roomHandler.createPlayer("playerID1", "nickname", "testroom");
        roomHandler.createPlayer("playerID2", "nickname2", "testroom");
        expect(Object.keys(roomHandler.rooms).length).toBe(1); //roomHandler.rooms.length not working
    });

    test("delete room if empty", () =>{
        //expect(roomHandler.deleteRoomIfEmpty("room that doesnt exist")).toBe(false);
        roomHandler.createRoomIfNotExist("roomA");
        expect(roomHandler.deleteRoomIfEmpty("roomA")).toBe(true);
        roomHandler.createPlayer("playerID", "nickname", "roomA");
        expect(roomHandler.deleteRoomIfEmpty("roomA")).toBe(false);
        roomHandler.disconnectPlayer("playerID");
        expect(roomHandler.deleteRoomIfEmpty("roomA")).toBe(true);
    });

    test("create room if not exist", () => {
        expect(roomHandler.createRoomIfNotExist("roomA")).toBe(true);
        expect(roomHandler.createRoomIfNotExist("roomA")).toBe(false);
    });

    test("get nickname list", () =>{
        expectedList = [];
        roomHandler.createRoomIfNotExist("roomA");
        roomHandler.createPlayer("ID1", "yongjae", "roomA");
        expectedList.push("yongjae");
        expect(JSON.stringify(roomHandler.getNicknameList("roomA"))).toBe(JSON.stringify(expectedList));
        roomHandler.createPlayer("ID2", "michael", "roomA");
        expectedList.push("michael");
        expect(JSON.stringify(roomHandler.getNicknameList("roomA"))).toBe(JSON.stringify(expectedList));
        roomHandler.createPlayer("ID3", "michael", "roomA");
        expectedList.push("michael");
        expect(JSON.stringify(roomHandler.getNicknameList("roomA"))).toBe(JSON.stringify(expectedList));
    })

});