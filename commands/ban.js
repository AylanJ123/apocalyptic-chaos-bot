"use strict"

const GM = require("./modules/GameModule.js");

module.exports = {
  name: "ban",
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
    } else if (
      GM.Games[message.channel.id].Banned.includes(message.author.id)
    ) {
      message.channel.send("User already banned");
      return;
    } else if (!GM.Games[message.channel.id].Endable) {
      message.channel.send("Game already started");
      return;
    }
    console.log(victim in GM.Games[message.channel.id].Players)
    if (victim in GM.Games[message.channel.id].Players) {
      delete GM.Games[message.channel.id].Players[victim];
    }
    GM.Games[message.channel.id].Banned.push(victim);
    message.channel.send("Banned!");
  }
};
