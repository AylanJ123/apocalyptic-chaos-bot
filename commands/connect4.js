"use strict";

const Playing = [];

const Reference = {
  Empty: "⬛",
  Blue: "🔵",
  Red: "🔴"
};

function TableGiver() {
  let table = [[], [], [], [], [], [], []];
  for (let column of table) {
    for (let i = 0; i < 6; i++) {
      column[i] = "Empty";
    }
  }
  return table;
}

function Drawer(table, blueTurn) {
  let msg = "";
  for (let l = -1; l >= -6; l--) {
    for (let c = 0; c < 7; c++) {
      msg += Reference[table[c][6 + l]];
    }
    msg += "\n";
  }
  msg += ":one::two::three::four::five::six::seven:\n";
  msg += blueTurn ? "🔵" : "🔴";
  msg += "'s Turn";
  return msg;
}

function GravityHandler(table, column, color) {
  for (let i = -1; i >= -6; i--) {
    if (table[column][6 + i - 1] != "Empty" || !table[column][6 + i - 1]) {
      table[column][6 + i] = color;
      return;
    }
  }
}

function WinCheck(table, color, blueTurn) {
  function WhoWon(turn) {
    let msg = turn ? "🔵" : "🔴";
    msg += " Won!";
    return msg;
  }
  for (let row = 0; row < 6; row++) {
    for (let column = 0; column < 7; column++) {
      for (let i = 1; i <= 4; i++) {
        if (!table[column + i]) break;
        if (table[column + i][row] != color) break;
        if (i == 4) return WhoWon(blueTurn);
      }
      for (let i = -1; i >= -4; i--) {
        if (!table[column + i]) break;
        if (table[column + i][row] != color) break;
        if (i == -4) return WhoWon(blueTurn);
      }
      for (let i = 1; i <= 4; i++) {
        if (!table[column]) break;
        if (table[column][row + i] != color) break;
        if (i == 4) return WhoWon(blueTurn);
      }
      for (let i = -1; i >= -4; i--) {
        if (!table[column]) break;
        if (table[column][row + i] != color) break;
        if (i == -4) return WhoWon(blueTurn);
      }
      for (let i = 1; i <= 3; i++) {
        if (!table[column + i]) break;
        if (table[column + i][row + i] != color) break;
        if (i == 4) return WhoWon(blueTurn);
      }
      for (let i = -1; i >= -4; i--) {
        if (!table[column + i]) break;
        if (table[column + i][row + i] != color) break;
        if (i == -4) return WhoWon(blueTurn);
      }
      for (let i = 1; i <= 4; i++) {
        if (!table[column - i]) break;
        if (table[column - i][row + i] != color) break;
        if (i == 4) return WhoWon(blueTurn);
      }
      for (let i = -1; i >= -4; i--) {
        if (!table[column - i]) break;
        if (table[column - i][row + i] != color) break;
        if (i == -4) return WhoWon(blueTurn);
      }
    }
  }
  for (let c of table) {
    if (!c.every(v => v != "Empty")) return null;
  }
  return "It's a tie!";
}

module.exports = {
  name: "CRITICALBUGconnect4",
  async execute(Discord, client, message, args) {
    if (Playing.includes(message.author.id)) {
      message.channel.send("You are already playing somewhere!");
      return;
    }
    let table = TableGiver();
    let Started = false;
    let Ended = false;
    let BlueTurn = true;
    let counter = 0;
    let RedPlayer;
    let GameMsg = await message.channel.send(Drawer(table, BlueTurn));
    Playing.push(message.author.id);
    let Players = {
      [message.author.id]: "Blue"
    };

    message.channel.send("Who else wants to play? Type join! If the game must be stopped, write end twice");

    function filter(msg) {
      if (
        msg.author.id == message.author.id ||
        msg.bot ||
        msg.content.toLowerCase() != "join"
      )
        return false;
      if (Playing.includes(msg.author.id)) {
        msg.channel.send("You are already playing somewhere!");
        return false;
      }
      Playing.push(msg.author.id);
      RedPlayer = msg.author.id;
      return true;
    }

    const WhoJoins = new Discord.MessageCollector(message.channel, filter, {
      max: 1
    });

    WhoJoins.on("collect", msg => {
      Players[msg.author.id] = "Red";
      message.channel.send("Play!");
      Started = true;
    });

    const collector = new Discord.MessageCollector(
      message.channel,
      msg => msg.author.id != client.user.id,
      { time: 1200000 }
    );

    let stop = false;
    collector.on("collect", async msg => {
      if (msg.author.id in Players) {
        let num;
        if (
          !isNaN(msg.content) &&
          (1 <= Number(msg.content) && Number(msg.content) <= 7)
        )
          num = Number(msg.content);
        if (num) {
          if (table[num - 1][5] != "Empty") {
            message.channel
              .send("Full column")
              .then(msg => msg.delete({ timeout: 1000 }));
          } else if (
            !Started ||
            ((Players[msg.author.id] == "Blue" && !BlueTurn) ||
              (Players[msg.author.id] == "Red" && BlueTurn))
          ) {
          } else {
            GravityHandler(table, num - 1, Players[msg.author.id]);
            let WinState = WinCheck(table, Players[msg.author.id], BlueTurn);
            if (WinState) {
              message.channel.send(WinState);
              Ended = true;
              collector.stop();
            }
            BlueTurn = !BlueTurn;
            GameMsg.edit(Drawer(table, BlueTurn));
          }
          if (msg.deletable) {
            msg.delete();
            counter--;
          }
        } else if (!stop && msg.content.toLowerCase() == "end") {
          message.channel
            .send("Write End again to finish this game")
            .then(msg => msg.delete({ timeout: 3000 }));
          stop = true;
        } else if (stop && msg.content.toLowerCase() == "end") {
          message.channel.send("Stopped");
          Ended = true;
          collector.stop();
          return;
        } else {
          stop = false;
        }
      }
      collector.on("end", msg => {
        if (!Ended) {
          message.channel.send(
            "Who spends more than 20 minutes in this? Aborting game due to timeout"
          );
        }
        Playing.splice(Playing.indexOf(message.author.id), 1);
        Playing.splice(Playing.indexOf(RedPlayer), 1);
      });
      counter++;
      if (counter >= 5) {
        GameMsg = await message.channel.send(Drawer(table, BlueTurn));
        counter = 0;
      }
    });
  }
};
