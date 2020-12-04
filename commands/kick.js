"use strict"

const GM = require("./modules/GameModule.js");

module.exports = {
  name: "kick",
  execute(Discord, client, message, args) {
    let victim;
    if (message.mentions.users.first()) {
      victim = message.mentions.users.first().id;
    } else {
      victim = args[0] || "Invalid id";
    }
    if (victim.length != 18 || isNaN(victim)) {
      message.channel.send("Invalid mention or id");
      return;
    } else if (!(message.channel.id in GM.Games)) {
      message.channel.send("No game is being played here!");
      return;
    } else if (GM.Games[message.channel.id].Host != message.author.id) {
      message.channel.send("You are not the host!");
      return;
    } else if (!GM.Games[message.channel.id].Endable) {
      message.channel.send("Game already started");
      return;
    } else if (!(victim in GM.Games[message.channel.id].Players)) {
      message.channel.send("User is not playing here");
      return;
    }
    delete GM.Games[message.channel.id].Players[victim];
    message.channel.send("Kicked!");
  }
};
