const Player = require("../player.js");
const Room = require("../room.js");

describe("room event tests", () => {
    let room;
    beforeEach(() => {
        room = new Room("id");
    });

    test("no leader empty room", () => {
        bob = new Player("id1", "bob", "roomA");
        room.addPlayer(bob);
        expect(room.leader.id).toBe("id1");
        room.removePlayer(bob);
        expect(room.leader).toBe(null);
    });

    test("leader replaced", () => {
        bob = new Player("id1", "bob", "roomA");
        king  = new Player("id2", "king", "roomA");
        room.addPlayer(bob);
        room.addPlayer(king);
        expect(room.leader.id).toBe("id1");
        room.removePlayer(bob);
        expect(room.leader.id).toBe("id2");
    })

    test("leader stays consistent", () => {
        bob = new Player("id1", "bob", "roomA");
        room.addPlayer(bob);
        room.addPlayer(new Player("id2", "bill", "roomA"));
        room.addPlayer(new Player("id2", "bill", "roomA"));
        expect(room.leader.id).toBe("id1");
    })

});