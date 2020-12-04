"use strict";

module.exports = {
  name: "links",
  execute(Discord, client, message, args) {
    message.channel.send(
      "Invite the bot to your own server! Don't forget to give us credits for it!\nhttps://discord.com/api/oauth2/authorize?client_id=764834923844206613&permissions=339008&scope=bot\n\n" +
        "Join our server! This bot has special interactions there and you will find lots of people that love this game!\nhttps://discord.com/invite/w5qyUVG\n\n" +
        "Visit our project page! Also the website, where you can find some information!\n<https://glitch.com/~apocalyptic-chaos-bot>\n<https://apocalyptic-chaos-bot.glitch.me/>"
    );
  }
};
