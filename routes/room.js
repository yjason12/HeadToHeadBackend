const express = require('express');
const router = express.Router();

router.get("/", (req, res) => {
    res.send("Create a room");
});

router.get("/:roomName", (req, res) => {
    res.send(`Welcome to ${req.params.roomName}`)
})

module.exports = router;