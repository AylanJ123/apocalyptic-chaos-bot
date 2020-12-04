"use strict";

const Discord = require("discord.js");
const PM = require("./PlayersModule.js");
const Repertory = require("./RepertoryModule.js");

const Zombies = ["Zombie", "Horde_Leader"];
const Traitors = ["Serial_Killer", "Mastermind", "Waiter", "Trapper"];
const Committeds = ["Jester", "Bounty_Hunter"];
const Survivors = [
  "Researcher",
  "Medic",
  "Survivor",
  "Marshall",
  "Scientist",
  "Zombie_Hunter",
  "Gravedigger"
];

function infoEmbed(tit, desc, icon) {
  return new Discord.MessageEmbed()
    .setTitle(tit)
    .setDescription(desc)
    .setThumbnail(icon ? icon : "");
}

function alertHorde(horde, client, game, specific) {
  let user = client.users.cache.get(horde.Id);
  if (specific) user.send(infoEmbed(specific, "Became a Zombie!"));
  else {
    let mates = [];
    for (let player in game.Players) {
      if (
        Zombies.includes(game.Players[player].Role) &&
        game.Players[player].Name != horde.Name
      ) {
        mates.push(game.Players[player].Name);
      }
    }
    user.send(
      infoEmbed(
        "Your fellow Zombies are:",
        mates.length ? mates.join("\n") : "You are alone"
      )
    );
  }
}

function WinCheck(game) {
  //return false;
  let aliveP = [];
  for (let player in game.Players) {
    if (game.Players[player].Alive) aliveP.push(game.Players[player]);
  }
  let Comm = [];
  let RC = {
    S: 0,
    Z: 0,
    T: 0
  };
  for (let player of aliveP) {
    if (Survivors.includes(player.Role) && !player.Infected) {
      RC.S++;
    } else if (Zombies.includes(player.Role) || player.Infected) {
      RC.Z++;
    } else if (Traitors.includes(player.Role)) {
      RC.T++;
    } else if (player.WinningCondition) {
      if (player.WinningCondition(game)) Comm.push(player.Name);
    }
  }
  for (let player in game.Players) {
    if (game.Players[player].Role == "Jester")
      if (game.Players[player].WinningCondition(game))
        Comm.push(game.Players[player].Name);
  }
  if (RC.S && !(RC.Z || RC.T)) {
    return { team: "Survivors", committeds: Comm };
  } else if (RC.Z && !(RC.S || RC.T)) {
    return { team: "Zombies", committeds: Comm };
  } else if (RC.T && !(RC.Z || RC.S)) {
    return { team: "Traitors", committeds: Comm };
  }
  return false;
}

function doRoleAction(WantedRole, Holder, client, game) {
  for (let info of Holder) {
    if (info.From.Role == WantedRole) {
      if (info.From.Alive) Repertory[info.Type](info, Holder, client, game);
      else Holder.splice(Holder.indexOf(info), 1);
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/*
PLAYER INFO WILL BE HANDLED THIS WAY
let Info = {
  Type: "Research",
  From: [object Object] //The researcher
  Target1: [object Object] //A player
  Target2: [object Object] //A player
}
*/

module.exports = {
  async GameDevelopment(gameID, client) {
    const gameChn = client.channels.cache.get(gameID);
    let Win;
    let Cures = Math.max(
      1,
      Math.floor((Object.keys(this.Games[gameID].Players).length - 1) / 3)
    );
    for (let player in this.Games[gameID].Players) {
      if (this.Games[gameID].Players[player].Role == "Researcher") {
        this.Games[gameID].Players[player].Cures = Cures;
      } else if (this.Games[gameID].Players[player].Role == "Bounty_Hunter") {
        let List = [];
        for (let plr in this.Games[gameID].Players) {
          if (Survivors.includes(this.Games[gameID].Players[plr].Role))
            List.push(this.Games[gameID].Players[plr].Id);
        }
        if (!List.length)
          for (let plr in this.Games[gameID].Players) {
            if (
              this.Games[gameID].Players[plr].Id !=
              this.Games[gameID].Players[player].Id
            )
              List.push(this.Games[gameID].Players[plr].Id);
          }
        let Bounty = this.Games[gameID].Players[
          List[Math.floor(Math.random() * List.length)]
        ];
        this.Games[gameID].Players[player].Bounty = Bounty.Id;
        client.users.cache
          .get(this.Games[gameID].Players[player].Id)
          .send(
            "Your bounty is " +
              Bounty.Name +
              ", get em' lynched in order to win!"
          );
      }
    }
    for (let player in this.Games[gameID].Players) {
      if (this.Games[gameID].Players[player].Role == "Horde_Leader") {
        alertHorde(
          this.Games[gameID].Players[player],
          client,
          this.Games[gameID]
        );
      }
    }
    gameChn.send(Cures + " samples are needed to get the cure!");
    while (!Win) {
      if (!this.Games[gameID]) break;
      gameChn.send(
        infoEmbed(
          "It's nightime! Check your DMs!",
          "Everyone has 45s per action, if you run out of time, no action will be executed",
          "https://media.discordapp.net/attachments/745345000186839150/745347792729538681/Night_Icon.png"
        )
      );
      Win = await this.NightStart(this.Games[gameID], client);
      if (Win) {
        this.Games[gameID].Won(Win, client, gameID);
        delete this.Games[gameID];
        break;
      }
      if (!this.Games[gameID]) break;
      gameChn.send(
        infoEmbed(
          "Good morning! Time to discuss!",
          "You've got 2 mins to do so, reveal important information and claim your nightime actions, you can skip the discussion typing `skip`",
          "https://cdn.discordapp.com/attachments/745345000186839150/745345056143048794/Dawn_Icon.png"
        )
      );
      await this.DayStart(this.Games[gameID], gameChn);
      if (!this.Games[gameID]) break;
      gameChn.send(
        infoEmbed(
          "Sky is darkening! Time to lynch someone!",
          "You left 90s, no one will be lynched if voting ties or most players decide to skip",
          "https://cdn.discordapp.com/attachments/745345000186839150/745345122597863434/Dusk_Icon.png"
        )
      );
      Win = await this.LynchStart(this.Games[gameID], gameChn, client);
      if (Win) {
        this.Games[gameID].Won(Win, client, gameID);
        delete this.Games[gameID];
        break;
      }
    }
    if (!Win) gameChn.send("Game was aborted");
  },
  async NightStart(game, client) {
    for (let player in game.Players) {
      let plr = game.Players[player];
      if (plr.Role == "Waiter" && plr.Alive) {
        if (plr.Guest1) game.Players[plr.Guest1].Blocked = true;
        if (plr.Guest2) game.Players[plr.Guest2].Blocked = true;
      }
      if (plr.Infected && plr.Alive) {
        plr.Infected++;
        if (plr.Infected >= 3) {
          let p = plr;
          client.users.cache.get(p.Id).send("You became a Zombie!");
          let wins = [p.XP, p.Coins];
          game.Players[player] = new PM.Zombie(p.Id, p.Channel, p.Name);
          game.Players[player].XP = wins[0];
          game.Players[player].Coins = wins[1];
          game.Players[player].Converted = true;
          for (let play in game.Players) {
            if (game.Players[play].Role == "Horde_Leader") {
              alertHorde(
                game.Players[play],
                client,
                game,
                game.Players[player].Name
              );
            }
          }
        }
      }
      if (plr.Role == "Researcher" && !plr.Alive && plr.Accomplice) {
        plr = game.Players[player];
        let acc = game.Players[plr.Accomplice];
        if (acc.Role != "Zombie") {
          let user = client.users.cache.get(acc.Id);
          user.send(
            "The previous Researcher was killed, you as their acquaintance have taken their job!"
          );
          let wins = [acc.XP, acc.Coins];
          game.Players[plr.Accomplice] = new PM.Researcher(
            acc.Id,
            acc.Channel,
            acc.Name
          );
          game.Players[plr.Accomplice].Cures = plr.Cures;
          game.Players[plr.Accomplice].Researches = plr.Researches;
          game.Players[plr.Accomplice].XP = wins[0];
          game.Players[plr.Accomplice].Coins = wins[1];
        }
      }
    }
    let Holder = [];
    for (let player in game.Players) {
      if (game.Players[player].Alive && !game.Players[player].Blocked) {
        let info = await game.Players[player].Action(client, game);
        if (info.Available) Holder.push(info);
      }
    }
    //Here starts game role actions
    doRoleAction("Mad_Scientist", Holder, client, game);
    doRoleAction("Waiter", Holder, client, game);
    doRoleAction("Mastermind", Holder, client, game);
    doRoleAction("Marshall", Holder, client, game);
    doRoleAction("Zombie_Hunter", Holder, client, game);
    doRoleAction("Serial_Killer", Holder, client, game);
    doRoleAction("Zombie", Holder, client, game);
    doRoleAction("Horde_Leader", Holder, client, game);
    doRoleAction("Trapper", Holder, client, game);
    doRoleAction("Medic", Holder, client, game);
    doRoleAction("Scientist", Holder, client, game);
    doRoleAction("Researcher", Holder, client, game);
    doRoleAction("Gravedigger", Holder, client, game);
    for (let player in game.Players) {
      if (game.Players[player].Bleeding >= 2 && game.Players[player].Alive) {
        game.Players[player].Kill(client, "bled to death", false, game);
      } else if (
        game.Players[player].Bleeding == 1 &&
        game.Players[player].Alive
      ) {
        game.Players[player].Bleeding++;
        client.users.cache
          .get(game.Players[player].Id)
          .send("You are bleeding!");
      }
      if (game.Players[player].Poison >= 3 && game.Players[player].Alive) {
        game.Players[player].Kill(client, "poisoned", false, game);
      } else if (
        game.Players[player].Poison == 1 &&
        game.Players[player].Alive
      ) {
        game.Players[player].Poison++;
      }
      if (game.Players[player].Blocked) {
        game.Players[player].Blocked = false;
      }
      for (let trap of game.Players[player].Traps) {
        if (trap.Night == 1) trap.Night++;
        else {
          trap.Activate(game.Players[player]);
          game.Players[player].Traps.splice(
            game.Players[player].Traps.indexOf(trap),
            1
          );
        }
      }
    }
    //Here game role actions stop
    return WinCheck(game);
  },
  async DayStart(game, gameChn) {
    let playersList = Object.values(game.Players);
    let notUsed = [];
    for (let i = 0; i < playersList.length; i++) {
      if (!playersList[i].Alive) notUsed.push(i);
    }
    let ranTimes = 0;
    for (let num of notUsed) {
      playersList.splice(num - ranTimes, 1);
      ranTimes++;
    }
    let voted = [];
    function filter(msg) {
      let alive = true;
      if (!(msg.author.id in game.Players)) alive = false;
      else if (!game.Players[msg.author.id].Alive) alive = false;
      let value =
        msg.content.toLowerCase() == "skip" &&
        !voted.includes(msg.author.id) &&
        alive;
      if (value) {
        voted.push(msg.author.id);
        msg.react("✅");
        if (voted.length < Math.floor(playersList.length / 2) + 1)
          gameChn.send(
            voted.length +
              " votes out of " +
              (Math.floor(playersList.length / 2) + 1)
          );
        return true;
      } else return false;
    }
    let skipping = await gameChn.awaitMessages(filter, {
      max: Math.floor(playersList.length / 2) + 1,
      time: 120000
    });
  },
  async LynchStart(game, gameChn, client) {
    let playersList = Object.values(game.Players);
    let text =
      "Select who to lynch with `vote [number]`! The player with the most votes will be lynched!\n\n0. Skip\n";
    let notUsed = [];
    for (let i = 0; i < playersList.length; i++) {
      if (playersList[i].Alive) {
        text += `${i + 1 - notUsed.length}. ${playersList[i].Name}\n`;
      } else notUsed.push(i);
    }
    let ranTimes = 0;
    for (let num of notUsed) {
      playersList.splice(num - ranTimes, 1);
      ranTimes++;
    }
    gameChn.send(text);

    let voted = [];
    function filter(msg) {
      let m = msg.content.split(" ");
      let num = Number(m[1]);
      let alive = true;
      if (!(msg.author.id in game.Players)) alive = false;
      else if (!game.Players[msg.author.id].Alive) alive = false;
      let value =
        num == NaN
          ? false
          : alive &&
            m[0].toLowerCase() == "vote" &&
            !voted.includes(msg.author.id) &&
            num % 1 == 0 &&
            (0 <= num && num <= playersList.length);
      if (value) {
        voted.push(msg.author.id);
        msg.react("✅");
        return true;
      } else return false;
    }
    let Timer = setTimeout(() => {
      gameChn.send("15s left!!!");
    }, 75000);
    let collection = await gameChn.awaitMessages(filter, {
      max: playersList.length,
      time: 90000
    });
    clearTimeout(Timer);
    let votingCount = [];
    let Counter = {};
    for (let i = 0; i <= playersList.length; i++) {
      Counter[i.toString()] = 0;
    }
    for (let [key, value] of collection) {
      votingCount.push(value.content.split(" ")[1]);
    }
    for (let vote of votingCount) {
      Counter[vote]++;
    }
    let tie = false;
    let biggest = "0";
    for (let vote of Object.keys(Counter)) {
      if (vote != "0")
        if (Counter[vote] > Counter[biggest]) {
          biggest = vote;
          tie = false;
        } else if (Counter[vote] == Counter[biggest]) {
          tie = true;
        }
    }
    if (tie) {
      gameChn.send("The Reformation could not decide who to execute!");
    } else if (biggest == "0") {
      gameChn.send("The Reformation decided to skip today's execution!");
    } else {
      game.Players[playersList[Number(biggest) - 1].Id].Lynched = true;
      game.Players[playersList[Number(biggest) - 1].Id].Kill(
        client,
        "lynched",
        true,
        game
      );
    }
    return WinCheck(game);
  },
  Games: {}
};
