"use strict";

const Devs = ["432509498574503947", "608221758067048468", "426216697574326293"];

module.exports = {
  name: "eval",
  execute(Discord, client, message, args) {
    if (!Devs.includes(message.author.id)) {
      message.channel.send("You are not a mastermind of the apocalypse!");
      return;
    }
    let evaluatable = args.join(" ");
    eval(evaluatable);
  }
};
