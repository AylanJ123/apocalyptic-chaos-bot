"use strict";

const GM = require("./modules/GameModule.js");
const PM = require("./modules/PlayersModule.js");
const IM = require("./modules/InformationModule.js")
const GameModes = require("./modules/GameModesModule.js")

module.exports = {
  name: "start",
  async execute(Discord, client, message, args) {
    if (!(message.channel.id in GM.Games)) {
      message.channel.send(
        "There is currently no game being hosted in this channel!"
      );
      return;
    } else if (GM.Games[message.channel.id].Host != message.author.id) {
      message.channel.send("You are not the host of the game!");
      return;
    } else if (Object.keys(GM.Games[message.channel.id].Players).length < 3) {
      message.channel.send("Too few players! Min: 3");
      return;
    } else if (!GM.Games[message.channel.id].Endable) {
      message.channel.send("The game has already started!");
      return;
    }
    GM.Games[message.channel.id].Endable = false;
    message.channel.send("Game is starting!");
    let announce = "These players have joined the game: ";
    for (let id in GM.Games[message.channel.id].Players) {
      announce += `<@${id}> `;
    }
    announce += "\n\nPossible game modes are:\n";
    let allGM = Object.keys(GameModes);
    for (let i = 0; i < allGM.length; i++) {
      announce += `${i + 1}. ${allGM[i]}\n`;
    }
    message.channel.send(announce);

    let collected = await message.channel.awaitMessages(
      msg => {
        return (
          !isNaN(msg.content) &&
          (1 <= Number(msg.content) && Number(msg.content) <= allGM.length) &&
          msg.author.id == GM.Games[message.channel.id].Host
        );
      },
      { max: 1, time: 90000 }
    );

    let msg;
    for (let [key, value] of collected) {
      msg = value;
    }
    if (!msg) {
      delete GM.Games[message.channel.id];
      message.channel.send("Game ended by AFK timeout of 90s");
      return false;
    }
    let pickedMode = allGM[Number(msg.content) - 1];
    GM.Games[message.channel.id].Mode = pickedMode
    let Matrix = GameModes[pickedMode].Shuffle(
      Object.keys(GM.Games[message.channel.id].Players)
    );
    for (let pair of Matrix) {
      let user = client.users.cache.get(pair[0]);
      if (pair[1] == "Infected") {
        GM.Games[message.channel.id].Players[pair[0]] = new PM["Survivor"](
          pair[0],
          message.channel.id,
          user.username
        );
        GM.Games[message.channel.id].Players[pair[0]].Infected = 1;
      } else {
        GM.Games[message.channel.id].Players[pair[0]] = new PM[pair[1]](
          pair[0],
          message.channel.id,
          user.username
        );
      }
      user
        .send(
          IM.embedRole(IM.roleInfo[pair[1].toLowerCase()])
        )
        .catch(() => {
          message.channel.send(
            "The user: <@" +
              pair[0] +
              "> Has DMs disabled or blocked the bot! Aborting the game!"
          );
          delete GM.Games[message.channel.id];
          return false;
        });
    }
    return true;
  }
};
