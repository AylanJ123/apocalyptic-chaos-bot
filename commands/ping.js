"use strict"

module.exports = {
  name: "ping",
  execute(Discord, client, message, args) {
    let ping = Math.round(client.ws.ping);
    let pingMs = ping.toString() + "ms`";
    message.channel.send("Pong! `" + pingMs);
  } 
};
