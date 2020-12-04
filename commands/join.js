"use strict"

const GM = require("./modules/GameModule.js");

function CheckGames(id) {
  for (let CurrChannel in GM.Games) {
    for (let user in GM.Games[CurrChannel].Players) {
      if (user == id) return true;
    }
  }
  return false;
}

module.exports = {
  name: "join",
  execute(Discord, client, message, args) {
    if (!(message.channel.id in GM.Games)) {
      message.channel.send("There is currently no game being hosted in here!");
      return;
    } else if (message.author.id in GM.Games[message.channel.id].Players) {
      message.channel.send("You already joined!");
      return;
    } else if (CheckGames(message.author.id)) {
      message.channel.send("You are currently in another game!");
      return;
    } else if (
      GM.Games[message.channel.id].Banned.includes(message.author.id)
    ) {
      message.channel.send("You were banned by the host!");
      return;
    } else if (Object.keys(GM.Games[message.channel.id].Players).length == 16) {
      message.channel.send("Max players reached! Max: 16");
      return;
    } else if (!GM.Games[message.channel.id].Endable) {
      message.channel.send("This game already started!");
      return;
    }
    GM.Games[message.channel.id].Players[message.author.id] = {};
    message.channel.send("Joined the game!");
  }
};
