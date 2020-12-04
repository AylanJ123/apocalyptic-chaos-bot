"use strict"

const IM = require("./modules/InformationModule.js")
const GM = require("./modules/GameModule.js")
const GameModes = require("./modules/GameModesModule.js")

function getRoles(message) {
  let roles = []
  let mode = GM.Games[message.channel.id].Mode
  let players = Object.keys(GM.Games[message.channel.id].Players).length
  for (let i = 0; i < players; i++) {
    roles.push(GameModes[mode].Roles[i])
  }
  return roles
}

function embedRoles(Discord, roles) {
  let roleStr = ""
  let embed = new Discord.MessageEmbed()
  .setAuthor("Rolelist")
  .setColor("#00d6ff")
  .setDescription("These roles are in the game:")
  for (let role of roles) {
    roleStr += `${IM.RoleEmojis[role]} ${role.replace("_", " ")}\n`
  }
  embed.addFields({ name: roleStr, value: "** **" })
  return embed
}

module.exports = {
  name: "rolelist",
  execute(Discord, client, message, args) {
    if (!(GM.Games[message.channel.id])) {
      message.channel.send("There is currently no game being played in here!")
    } else if (!(GM.Games[message.channel.id].Mode)) {
      message.channel.send("Can not display rolelist right now! Game must be started to do so!")
    } else {
      message.channel.send(embedRoles(Discord, getRoles(message)))
    }
  }
};