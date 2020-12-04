"use strict";

const IM = require("./modules/InformationModule.js") 

module.exports = {
  name: "help",
  execute(Discord, client, message, args) {
    let argC = args
      .slice(1, 3)
      .join("_")
      .toLowerCase();
    if (args[0]) {
      if (IM.helpTexts[args[0].toLowerCase()] || args[0] == "htp") {
        let command = IM.helpTexts[args[0].toLowerCase()];
        if (args[0].toLowerCase() == "howtoplay" || args[0].toLowerCase() == "htp") {
          message.channel.send(IM.helpTexts.howtoplay);
        } else {
          message.channel.send(IM.embedHelp(command));
        }
      } else if (args[0].toLowerCase() == "role" || args[0].toLowerCase() == "r") {
        if (IM.roleInfo[argC]) {
          message.channel.send(IM.embedRole(IM.roleInfo[argC]));
        } else if (args[1]) {
          message.channel.send(
            "That role isn't available! Did your write it correctly?"
          );
        } else {
          let roles = {
            reformation: [],
            apocalypse: [],
            corruption: [],
            committed: [],
            suggestions: []
          };
          for (let key of Object.keys(IM.roleInfo)) {
            console.log(key);
            IM.roleInfo[key].suggestion
              ? roles["suggestions"].push(IM.roleInfo[key].name)
              : IM.roleInfo[key].team == "Reformation (Survivors)"
              ? roles["reformation"].push(IM.roleInfo[key].name)
              : IM.roleInfo[key].team == "Apocalypse (Zombies)"
              ? roles["apocalypse"].push(IM.roleInfo[key].name)
              : IM.roleInfo[key].team == "Corruption (Traitors)"
              ? roles["corruption"].push(IM.roleInfo[key].name)
              : roles["committed"].push(IM.roleInfo[key].name)
          }
          for (let team of Object.keys(roles)) {
            roles[team].length == 0 ? (roles[team] = ["None"]) : "";
          }
          message.channel.send(
            IM.sortTeams("Roles", "These are the available roles:", roles)
          );
        }
      } else if (args[0].toLowerCase() == "effects" || args[0].toLowerCase() == "effect" || args[0].toLowerCase() == "e") {
        if (IM.effects[argC]) {
          message.channel.send(IM.embedEffect(IM.effects[argC]))
        } else {
          message.channel.send(IM.embedList("Effects", "These are the available effects (to view them, use `ac help effect [effect]`):", Object.keys(IM.effects), false))
        }
      } else {
        message.channel.send(
          "That command isn't available! Did your write it correctly?"
        );
      }
    } else {
      let arrayList = Object.keys(IM.helpTexts);
      arrayList.splice(arrayList.indexOf("howtoplay"), 1);
      message.channel.send(
        IM.embedList(
          "Commands",
          'List of commands use, use `ac help <command>` to show information on each command! Also you can use `ac help howtoplay` for an overall guide in how to play the game and `ac help role` to see the list of all roles available.',
          arrayList
        )
      );
    }
  }
};
