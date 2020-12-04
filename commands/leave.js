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
  name: "leave",
  execute(Discord, client, message, args) {
    if (!(message.channel.id in GM.Games)) {
      message.channel.send("There is currently no game being hosted in here!");
      return;
    } else if (!GM.Games[message.channel.id].Endable) {
      message.channel.send("This game already started!");
      return;
    } else if (!CheckGames(message.author.id)) {
      message.channel.send("You haven't joined!");
      return;
    } else if (message.author.id == GM.Games[message.channel.id].Host) {
      message.channel.send("You are the Host!");
      return;
    }
    delete GM.Games[message.channel.id].Players[message.author.id]
    message.channel.send("Left the game!");
  }
};
