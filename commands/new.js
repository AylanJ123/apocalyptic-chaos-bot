"use strict";

const GM = require("./modules/GameModule.js");

function FindKeyLvL2(id) {
  for (let CurrChannel in GM.Games) {
    if (GM.Games[CurrChannel].Host == id) return true;
  }
  return false;
}

function CheckGames(id) {
  for (let CurrChannel in GM.Games) {
    for (let user in GM.Games[CurrChannel].Players) {
      if (user == id) return true;
    }
  }
  return false;
}

module.exports = {
  name: "new",
  execute(Discord, client, message, args) {
    if (message.channel.id in GM.Games) {
      message.channel.send(
        "There is already a game in this channel! Try hosting somewhere else or join this game!"
      );
      return;
    } else if (FindKeyLvL2(message.author.id)) {
      message.channel.send("You are already hosting somewhere!");
      return;
    } else if (CheckGames(message.author.id)) {
      message.channel.send("You are already playing in someone else's game!");
      return;
    }
    GM.Games[message.channel.id] = {
      Host: message.author.id,
      Timestamp: Date.now(),
      Endable: true,
      Cure: false,
      Forced: false,
      Players: {
        [message.author.id]: {}
      },
      Banned: [],
      CureFound(Client, Id) {
        Client.channels.cache
          .get(Id)
          .send(
            "The cure was found! Zombies can no longer infect new players and infected players got healed!"
          );
        this.Cure = true;
        for (let player in this.Players) {
          if (player.Infected) player.Infected = 0;
        }
      },
      Won(Winners, Client, Id) {
        Client.channels.cache
          .get(Id)
          .send(
            `${Winners.team} won the game!${
          Winners.committeds.length ? " Also the following committeds: " + Winners.committeds.join(", ") : " No committed accomplished the winning condition"
          }`
          );
        this.Forced = true
      }
    };
    message.channel.send("Created a game in this channel!");
  }
};
