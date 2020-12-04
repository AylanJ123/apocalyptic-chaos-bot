"use strict"

const GM = require("./modules/GameModule.js");

module.exports = {
  name: "end",
  execute(Discord, client, message, args) {
    if (!(message.channel.id in GM.Games)) {
      message.channel.send("No game is being played here");
      return;
    } else if (
      message.member.roles.highest.position > message.member.guild.me.roles.highest.position &&
      args[0] == "forced"
    ) {
      message.channel.send("Game is being ended by someone with a higher role than the bot! This was forced so expect an error soon!");
      delete GM.Games[message.channel.id]
      return;
    } else if (GM.Games[message.channel.id].Host != message.author.id) {
      message.channel.send("You are not the host!");
      return;
    } else if (!GM.Games[message.channel.id].Endable) {
      message.channel.send("Game already started, can't end it now");
      return;
    }
    delete GM.Games[message.channel.id]
    message.channel.send("Game succesfully ended!");
  }
};
