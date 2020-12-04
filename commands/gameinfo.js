const GM = require("./modules/GameModule.js");

module.exports = {
  name: "gameinfo",
  execute(Discord, client, message, args) {
    if (!GM.Games[message.channel.id]) {
      message.channel.send("No game is being played here");
      return;
    } else {
      let text = "These are the joined players and their state\n\n";
      let counter = 0;
      for (let player in GM.Games[message.channel.id].Players) {
        counter++;
        if (!GM.Games[message.channel.id].Players[player].Role) {
          text += `${counter.toString()}. ${
            client.users.cache.get(player).username
          } (No state)\n`;
        } else {
          text += GM.Games[message.channel.id].Players[player].Alive
            ? `${counter.toString()}. ${
                GM.Games[message.channel.id].Players[player].Name
              } (Alive)\n`
            : `${counter.toString()}. ${
                GM.Games[message.channel.id].Players[player].Name
              } (Dead)\n`;
        }
      }
      message.channel.send(text)
    }
  }
};
