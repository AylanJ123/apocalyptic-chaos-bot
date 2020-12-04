"use strict"

const GM = require("./modules/GameModule.js");
let running = false;

module.exports = {
  name: "trashcollector",
  async execute(client) {
    if (running) return;
    running = true;
    setInterval(() => {
      for (let ChnId in GM.Games) {
        if (
          Date.now() - GM.Games[ChnId].Timestamp >= 600000 &&
          GM.Games[ChnId].Endable
        ) {
          delete GM.Games[ChnId];
          client.channels.cache
            .get(ChnId)
            .send(
              ":wastebasket: The game has ended due to timeout. 10 minutes has passed and the game hasn't started."
            );
        }
      }
    }, 60000);
    setInterval(() => console.clear(), 600000);
  }
};
