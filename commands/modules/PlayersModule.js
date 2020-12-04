"use strict";

const Discord = require("discord.js");

//FUNCTIONS

function getFirstMsg(map) {
  let element;
  for (let [key, value] of map) {
    element = value;
  }
  return element;
}

function getNamesList(array, initText, player, abstain, selfChoose) {
  let embed = new Discord.MessageEmbed()
    .setTitle("Night action")
    .setDescription(initText ? initText : "");
  let text = "";
  if (abstain) text += "0. Abstain\n";
  let notUsed = [];
  for (let i = 0; i < array.length; i++) {
    if ((array[i].Name == player && !selfChoose) || !array[i].Alive) {
      notUsed.push(i);
    } else text += `${i + 1 - notUsed.length}. ${array[i].Name}\n`;
  }
  embed.addField("\u200b", text, false);
  return {
    string: embed,
    unused: notUsed
  };
}

async function awaitMsg(pList, DM, set) {
  let playersList = pList;
  let list = getNamesList(
    playersList,
    set.text,
    set.name,
    set.abstain,
    set.self
  );
  let ranTimes = 0;
  for (let num of list.unused) {
    playersList.splice(num - ranTimes, 1);
    ranTimes++;
  }
  DM.send(list.string);
  function filter(msg) {
    let min = set.abstain ? 0 : 1;
    return (
      !msg.author.bot &&
      !isNaN(msg.content) &&
      Number(msg.content) % 1 == 0 &&
      (min <= Number(msg.content) && Number(msg.content) <= playersList.length)
    );
  }
  let selection = await DM.awaitMessages(filter, { max: 1, time: 45000 });
  return { messg: getFirstMsg(selection), newList: playersList };
}

//CLASS START UP

let Classes = {
  Player: class {
    constructor(id, role, channel, name) {
      this.Coins = 0;
      this.XP = 0;
      this.Alive = true;
      this.Name = name;
      this.Role = role;
      this.Id = id;
      this.Channel = channel;
      this.Blocked = false;
      this.Lynched = false;
      this.Traps = [];
      this.Bites = 0;
      this.Bleeding = 0;
      this.Poison = 0;
      this.StabWound = 0;
    }
    Kill(client, msg, reveal, game) {
      let roleReveal = "Their role ";
      roleReveal += reveal
        ? "was " + this.Role.replace("_", " ")
        : "couldn't be determined.";
      this.Alive = false;
      client.users.cache
        .get(this.Id)
        .send("You died! You were " + msg)
        .catch(() => {});
      client.channels.cache
        .get(this.Channel)
        .send(`${this.Name} died! They were ${msg}. ${roleReveal}`);
    }
  },
  ActionInfo: class {
    constructor(type, from) {
      this.Type = type;
      this.From = from;
      this.Available = false;
    }
  }
};

//RESEARCHER -------------------

Classes.Researcher = class extends Classes.Player {
  constructor(id, channel, name) {
    super(id, "Researcher", channel, name);
    this.Choosed = false;
    this.Researches = 0;
    this.Accomplice;
    this.Cures;
  }
  async Action(client, game) {
    let user = client.users.cache.get(this.Id);
    let DM = await user.createDM();
    DM.startTyping();
    let accDied = false;
    if (this.Accomplice)
      if (!game.Players[this.Accomplice].Alive) {
        accDied = true;
        this.Choosed = false;
      }
    if (!this.Choosed || accDied) {
      DM.send(
        "You haven't choosen an acquaintance or your previous acquaintance died, do you want to spend this night looking for one? `yes/no`"
      );
      let response = await DM.awaitMessages(
        msg =>
          !msg.author.bot &&
          (msg.content.toLowerCase() == "yes" ||
            msg.content.toLowerCase() == "no"),
        { max: 1, time: 45000 }
      );
      response = getFirstMsg(response);
      if (response) {
        let playersList = Object.values(game.Players);
        if (response.content.toLowerCase() == "yes") {
          let awaiting = await awaitMsg(playersList, DM, {
            text: "Choose someone to make your acquaintance:",
            name: this.Name,
            abstain: false,
            self: false
          });
          playersList = awaiting.newList;
          let selection = awaiting.messg;
          if (selection) {
            DM.send(
              "You decided to try to make " +
                playersList[Number(selection.content) - 1].Name +
                " your acquaintance."
            );
            DM.stopTyping();
            let Info = new Classes.ActionInfo("ChooseAccomplice", this);
            Info.Available = true;
            Info.Target = playersList[Number(selection.content) - 1];
            return Info;
          } else {
            DM.send(
              "It is nearing dawn... you did not have enough time to perform any action!"
            );
            DM.stopTyping();
            return new Classes.ActionInfo("ChooseAccomplice", this);
          }
        }
      } else {
        DM.send(
          "It is nearing dawn... you did not have enough time to perform any action!"
        );
        DM.stopTyping();
        return new Classes.ActionInfo("ChooseAccomplice", this);
      }
    }
    let playersList = Object.values(game.Players);
    let msgs = [];
    let awaiting = await awaitMsg(playersList, DM, {
      text: "Choose someone to sample from:",
      name: this.Name,
      abstain: true,
      self: false
    });
    playersList = awaiting.newList;
    msgs[0] = awaiting.messg;
    if (msgs[0]) {
      if (msgs[0].content == "0") {
        DM.send("You decided to not sample anyone tonight.");
        DM.stopTyping();
        return new Classes.ActionInfo("Research", this);
      } else {
        //Added
        DM.send(`You chose ${playersList[Number(msgs[0].content) - 1].Name}`);
        DM.stopTyping();
        let Info = new Classes.ActionInfo("Research", this);
        Info.Available = true;
        Info.Target = playersList[Number(msgs[0].content) - 1];
        return Info;
      } //Added
      /*let awaiting = await awaitMsg(playersList, DM, {
        text:
          "Choose who to research again, you can abstain to select a second player",
        name: this.Name,
        abstain: true,
        self: false
      });
      playersList = awaiting.newList;
      msgs[1] = awaiting.messg;*/
    } else {
      DM.send(
        "It is nearing dawn... you did not have enough time to perform any action!"
      );
      DM.stopTyping();
      return new Classes.ActionInfo("Research", this);
    }
    /*if (msgs[1]) {
      if (msgs[1].content != "0") {
        DM.send(
          `You chose ${playersList[Number(msgs[0].content) - 1].Name} and ${playersList[Number(msgs[1].content) - 1].Name}`
        );
        DM.stopTyping();
        let Info = new Classes.ActionInfo("Research", this);
        Info.Target1 = playersList[Number(msgs[0].content) - 1];
        Info.Available = true;
        Info.Target2 = playersList[Number(msgs[1].content) - 1];
        return Info;
      } else {
        DM.send(`You chose ${playersList[Number(msgs[0].content) - 1].Name}`);
        DM.stopTyping();
        let Info = new Classes.ActionInfo("Research", this);
        Info.Available = true;
        Info.Target1 = playersList[Number(msgs[0].content) - 1];
        return Info;
      }
    } else {
      DM.send(`You chose ${playersList[Number(msgs[0].content) - 1].Name}`);
      DM.stopTyping();
      let Info = new Classes.ActionInfo("Research", this);
      Info.Available = true;
      Info.Target1 = playersList[Number(msgs[0].content) - 1];
      return Info;
    }*/
  }
};

//MEDIC -------------------

Classes.Medic = class extends Classes.Player {
  constructor(id, channel, name) {
    super(id, "Medic", channel, name);
    this.SelfHeal = true;
  }
  async Action(client, game) {
    let user = client.users.cache.get(this.Id);
    let DM = await user.createDM();
    DM.startTyping();
    let playersList = Object.values(game.Players);
    let awaiting = await awaitMsg(playersList, DM, {
      text: "Choose who to heal tonight, you may self heal only once:",
      name: this.Name,
      abstain: false,
      self: this.SelfHeal ? true : false
    });
    playersList = awaiting.newList;
    let selection = awaiting.messg;
    if (selection) {
      if (playersList[Number(selection.content) - 1].Name == this.Name) {
        DM.send("You decided to heal yourself!");
        this.SelfHeal = false;
      } else
        DM.send(
          "You are going to heal " +
            playersList[Number(selection.content) - 1].Name +
            " tonight."
        );
      DM.stopTyping();
      let Info = new Classes.ActionInfo("Heal", this);
      Info.Available = true;
      Info.Target = playersList[Number(selection.content) - 1];
      Info.preActivation = function(act) {
        DM.send(
          "Your target was suddenly " +
            act +
            " tonight! You decided to prioritize that."
        );
      };
      return Info;
    } else {
      DM.send(
        "It is nearing dawn... you did not have enough time to perform any action!"
      );
      DM.stopTyping();
      return new Classes.ActionInfo("Heal", this);
    }
    DM.stopTyping();
    return new Classes.ActionInfo("Heal", this);
  }
};

//SURVIVOR -------------------

Classes.Survivor = class extends Classes.Player {
  constructor(id, channel, name) {
    super(id, "Survivor", channel, name);
  }
  async Action(client, game) {
    let user = client.users.cache.get(this.Id);
    let DM = await user.createDM();
    DM.send("Zzzzz...");
    return new Classes.ActionInfo("Sleep", this);
  }
};

//ZOMBIE -------------------

Classes.Zombie = class extends Classes.Player {
  constructor(id, channel, name) {
    super(id, "Zombie", channel, name);
  }
  async Action(client, game) {
    let user = client.users.cache.get(this.Id);
    let DM = await user.createDM();
    DM.startTyping();
    let playersList = Object.values(game.Players);
    let awaiting = await awaitMsg(playersList, DM, {
      text: "Choose who to bite tonight:",
      name: this.Name,
      abstain: true,
      self: false
    });
    playersList = awaiting.newList;
    let selection = awaiting.messg;
    if (selection) {
      if (selection.content == "0") {
        DM.send("You held your hunger tonight");
        DM.stopTyping();
        return new Classes.ActionInfo("Bite", this);
      } else {
        DM.send(
          "You decided to bite " +
            playersList[Number(selection.content) - 1].Name +
            " this night."
        );
        DM.stopTyping();
        let Info = new Classes.ActionInfo("Bite", this);
        Info.Available = true;
        Info.Target = playersList[Number(selection.content) - 1];
        return Info;
      }
    } else {
      DM.send(
        "It is nearing dawn... you did not have enough time to perform any action!"
      );
      DM.stopTyping();
      return new Classes.ActionInfo("Bite", this);
    }
    DM.stopTyping();
    return new Classes.ActionInfo("Bite", this);
  }
};

//SERIAL_KILLER -------------------

Classes.Serial_Killer = class extends Classes.Player {
  constructor(id, channel, name) {
    super(id, "Serial_Killer", channel, name);
  }
  async Action(client, game) {
    let user = client.users.cache.get(this.Id);
    let DM = await user.createDM();
    DM.startTyping();
    let playersList = Object.values(game.Players);
    let awaiting = await awaitMsg(playersList, DM, {
      text: "Choose who to stab tonight:",
      name: this.Name,
      abstain: false,
      self: false
    });
    playersList = awaiting.newList;
    let selection = awaiting.messg;
    if (selection) {
      DM.send(
        "You decided to stab " +
          playersList[Number(selection.content) - 1].Name +
          " tonight."
      );
      DM.stopTyping();
      let Info = new Classes.ActionInfo("Stab", this);
      Info.Available = true;
      Info.Target = playersList[Number(selection.content) - 1];
      return Info;
    } else {
      DM.send(
        "It is nearing dawn... you did not have enough time to perform any action!"
      );
      DM.stopTyping();
      return new Classes.ActionInfo("Stab", this);
    }
    DM.stopTyping();
    return new Classes.ActionInfo("Stab", this);
  }
};

//MARSHALL -------------------

Classes.Marshall = class extends Classes.Player {
  constructor(id, channel, name) {
    super(id, "Marshall", channel, name);
  }
  async Action(client, game) {
    let user = client.users.cache.get(this.Id);
    let DM = await user.createDM();
    DM.startTyping();
    let playersList = Object.values(game.Players);
    let awaiting = await awaitMsg(playersList, DM, {
      text: "Choose who to protect tonight:",
      name: this.Name,
      abstain: false,
      self: false
    });
    playersList = awaiting.newList;
    let selection = awaiting.messg;
    if (selection) {
      DM.send(
        "You decided to protect " +
          playersList[Number(selection.content) - 1].Name +
          " from their first visitor!"
      );
      DM.stopTyping();
      let Info = new Classes.ActionInfo("Protect", this);
      Info.Available = true;
      Info.Target = playersList[Number(selection.content) - 1];
      Info.preActivation = function() {
        DM.send("You forced someone to back away from your target!");
      };
      return Info;
    } else {
      DM.send(
        "It is nearing dawn... you did not have enough time to perform any action!"
      );
      DM.stopTyping();
      return new Classes.ActionInfo("Protect", this);
    }
    DM.stopTyping();
    return new Classes.ActionInfo("Protect", this);
  }
};

//HORDE_LEADER -------------------

Classes.Horde_Leader = class extends Classes.Player {
  constructor(id, channel, name) {
    super(id, "Horde_Leader", channel, name);
  }
  async Action(client, game) {
    let user = client.users.cache.get(this.Id);
    let DM = await user.createDM();
    DM.startTyping();
    let playersList = Object.values(game.Players);
    let awaiting = await awaitMsg(playersList, DM, {
      text: "Choose who to bite tonight:",
      name: this.Name,
      abstain: true,
      self: false
    });
    playersList = awaiting.newList;
    let selection = awaiting.messg;
    if (selection) {
      if (selection.content == "0") {
        DM.send("You held onto your hunger tonight...");
        DM.stopTyping();
        return new Classes.ActionInfo("Bite", this);
      } else {
        DM.send(
          "You decided to bite " +
            playersList[Number(selection.content) - 1].Name +
            " this night."
        );
        DM.stopTyping();
        let Info = new Classes.ActionInfo("Bite", this);
        Info.Available = true;
        Info.Target = playersList[Number(selection.content) - 1];
        return Info;
      }
    } else {
      DM.send(
        "It is nearing dawn... you did not have enough time to perform any action!"
      );
      DM.stopTyping();
      return new Classes.ActionInfo("Bite", this);
    }
    DM.stopTyping();
    return new Classes.ActionInfo("Bite", this);
  }
};

//SCIENTIST -------------------

Classes.Scientist = class extends Classes.Player {
  constructor(id, channel, name) {
    super(id, "Scientist", channel, name);
  }
  async Action(client, game) {
    let user = client.users.cache.get(this.Id);
    let DM = await user.createDM();
    DM.startTyping();
    let playersList = Object.values(game.Players);
    let msgs = [];
    let awaiting = await awaitMsg(playersList, DM, {
      text: "Choose someone to inspect:",
      name: this.Name,
      abstain: true,
      self: false
    });
    playersList = awaiting.newList;
    msgs[0] = awaiting.messg;
    if (msgs[0]) {
      if (msgs[0].content == "0") {
        DM.send("You decided to not inspect anyone tonight!");
        DM.stopTyping();
        return new Classes.ActionInfo("Research", this);
      }
      DM.send(
        "Choose someone else to inspect, you may also abstain from selecting a second player"
      );
      msgs[1] = await DM.awaitMessages(
        msg =>
          !msg.author.bot &&
          msg.content != msgs[0].content &&
          !isNaN(msg.content) &&
          Number(msg.content) % 1 == 0 &&
          (0 <= Number(msg.content) &&
            Number(msg.content) <= playersList.length),
        { max: 1, time: 45000 }
      );
      msgs[1] = getFirstMsg(msgs[1]);
    } else {
      DM.send(
        "It is nearing dawn... you did not have enough time to perform any action!"
      );
      DM.stopTyping();
      return new Classes.ActionInfo("Inspect", this);
    }
    if (msgs[1]) {
      if (msgs[1].content != "0") {
        DM.send(
          `You chose ${playersList[Number(msgs[0].content) - 1].Name} and ${playersList[Number(msgs[1].content) - 1].Name}`
        );
        DM.stopTyping();
        let Info = new Classes.ActionInfo("Inspect", this);
        Info.Target1 = playersList[Number(msgs[0].content) - 1];
        Info.Available = true;
        Info.Target2 = playersList[Number(msgs[1].content) - 1];
        return Info;
      } else {
        DM.send(`You chose ${playersList[Number(msgs[0].content) - 1].Name}`);
        DM.stopTyping();
        let Info = new Classes.ActionInfo("Inspect", this);
        Info.Available = true;
        Info.Target1 = playersList[Number(msgs[0].content) - 1];
        return Info;
      }
    } else {
      DM.send(`You chose ${playersList[Number(msgs[0].content) - 1].Name}`);
      DM.stopTyping();
      let Info = new Classes.ActionInfo("Inspect", this);
      Info.Available = true;
      Info.Target1 = playersList[Number(msgs[0].content) - 1];
      return Info;
    }
  }
};

//MASTERMIND -------------------

Classes.Mastermind = class extends Classes.Player {
  constructor(id, channel, name) {
    super(id, "Mastermind", channel, name);
  }
  async Action(client, game) {
    let user = client.users.cache.get(this.Id);
    let DM = await user.createDM();
    DM.startTyping();
    let playersList = Object.values(game.Players);
    let awaiting = await awaitMsg(playersList, DM, {
      text: "Choose someone to hypnotize tonight:",
      name: this.Name,
      abstain: false,
      self: false
    });
    playersList = awaiting.newList;
    let selection = awaiting.messg;
    if (selection) {
      DM.send(
        "You will hypnotize " +
          playersList[Number(selection.content) - 1].Name +
          " tonight."
      );
      DM.send("What is your target going to do?\n1. Injure\n2. Infect");
      let Info = new Classes.ActionInfo("Hypnosis", this);
      Info.Available = true;
      Info.Target = playersList[Number(selection.content) - 1];
      let effect = await DM.awaitMessages(
        msg =>
          !msg.author.bot &&
          !isNaN(msg.content) &&
          Number(msg.content) % 1 == 0 &&
          (1 <= Number(msg.content) && Number(msg.content) <= 2),
        { max: 1, time: 45000 }
      );
      effect = getFirstMsg(effect);
      if (effect) {
        Info.Effect = effect.content == "1" ? "Injure" : "Infect";
        DM.send(
          `Your target will ${
            effect.content == "1" ? "injure" : "infect"
          } whoever they find tonight`
        );
      } else {
        DM.send(
          "It is nearing dawn... you did not have enough time to perform any action!"
        );
        DM.stopTyping();
        return new Classes.ActionInfo("Hypnosis", this);
      }
      DM.stopTyping();
      return Info;
    } else {
      DM.send(
        "It is nearing dawn... you did not have enough time to perform any action!"
      );
      DM.stopTyping();
      return new Classes.ActionInfo("Hypnosis", this);
    }
    DM.stopTyping();
    return new Classes.ActionInfo("Hypnosis", this);
  }
};

//ZOMBIE_HUNTER -------------------

Classes.Zombie_Hunter = class extends Classes.Player {
  constructor(id, channel, name) {
    super(id, "Zombie_Hunter", channel, name);
    this.Bullets = 2;
  }
  async Action(client, game) {
    let user = client.users.cache.get(this.Id);
    let DM = await user.createDM();
    if (this.Bullets) {
      DM.startTyping();
      let playersList = Object.values(game.Players);
      let awaiting = await awaitMsg(playersList, DM, {
        text:
          "Choose who to shoot tonight: (You left " +
          this.Bullets +
          " Bullets)",
        name: this.Name,
        abstain: false,
        self: false
      });
      playersList = awaiting.newList;
      let selection = awaiting.messg;
      if (selection) {
        DM.send(
          "You are going to attempt to shoot " +
            playersList[Number(selection.content) - 1].Name +
            " tonight."
        );
        DM.stopTyping();
        let Info = new Classes.ActionInfo("Shoot", this);
        Info.Available = true;
        Info.Target = playersList[Number(selection.content) - 1];
        return Info;
      } else {
        DM.send(
          "It is nearing dawn... you did not have enough time to perform any action!"
        );
        DM.stopTyping();
        return new Classes.ActionInfo("Shoot", this);
      }
      DM.stopTyping();
      return new Classes.ActionInfo("Shoot", this);
    } else {
      DM.send("You ran out of bullets, better go sleep.\nZzzzz...");
      return new Classes.ActionInfo("Shoot", this);
    }
  }
};

//TRAPPER -------------------

Classes.Trapper = class extends Classes.Player {
  constructor(id, channel, name) {
    super(id, "Trapper", channel, name);
  }
  async Action(client, game) {
    let user = client.users.cache.get(this.Id);
    let DM = await user.createDM();
    DM.startTyping();
    let playersList = Object.values(game.Players);
    let awaiting = await awaitMsg(playersList, DM, {
      text: "Choose who to trap tonight",
      name: this.Name,
      abstain: false,
      self: true
    });
    playersList = awaiting.newList;
    let selection = awaiting.messg;
    if (selection) {
      if (playersList[Number(selection.content) - 1].Name == this.Name) {
        DM.send("You decided to trap yourself!");
      } else
        DM.send(
          "You are going to trap " +
            playersList[Number(selection.content) - 1].Name
        );
      DM.stopTyping();
      let Info = new Classes.ActionInfo("Trap", this);
      Info.Available = true;
      Info.Target = playersList[Number(selection.content) - 1];
      Info.preActivation = function(player) {
        DM.send("Your trap was activated tonight!");
        player.Bleeding++;
        if (player.Bleeding >= 2) player.Kill(client, "bled to death", false);
      };
      return Info;
    } else {
      DM.send(
        "It is nearing dawn... you did not have enough time to perform any action!"
      );
      DM.stopTyping();
      return new Classes.ActionInfo("Trap", this);
    }
    DM.stopTyping();
    return new Classes.ActionInfo("Trap", this);
  }
};

//WAITER -------------------

Classes.Waiter = class extends Classes.Player {
  constructor(id, channel, name) {
    super(id, "Waiter", channel, name);
    this.CanInvite = true;
    this.Guest1 = "";
    this.Guest2 = "";
  }
  async Action(client, game) {
    let user = client.users.cache.get(this.Id);
    let DM = await user.createDM();
    DM.startTyping();
    let playersList = Object.values(game.Players);
    let msgs = [];
    if (this.CanInvite) {
      let awaiting = await awaitMsg(playersList, DM, {
        text: "Choose someone to invite:",
        name: this.Name,
        abstain: true,
        self: false
      });
      playersList = awaiting.newList;
      msgs[0] = awaiting.messg;
      if (msgs[0]) {
        if (msgs[0].content == "0") {
          DM.send("You decided to not invite someone tomorrow");
          DM.stopTyping();
          return new Classes.ActionInfo("Invite", this);
        }
        DM.send(
          "Choose someone else to invite, you may also abstain from selecting a second player"
        );
        msgs[1] = await DM.awaitMessages(
          msg =>
            !msg.author.bot &&
            msg.content != msgs[0].content &&
            !isNaN(msg.content) &&
            Number(msg.content) % 1 == 0 &&
            (0 <= Number(msg.content) &&
              Number(msg.content) <= playersList.length),
          { max: 1, time: 45000 }
        );
        msgs[1] = getFirstMsg(msgs[1]);
      } else {
        DM.send(
          "It is nearing dawn... you did not have enough time to perform any action!"
        );
        DM.stopTyping();
        return new Classes.ActionInfo("Invite", this);
      }
      if (msgs[1]) {
        if (msgs[1].content != "0") {
          DM.send(
            `You chose ${playersList[Number(msgs[0].content) - 1].Name} and ${playersList[Number(msgs[1].content) - 1].Name}`
          );
          DM.stopTyping();
          this.Guest1 = playersList[Number(msgs[0].content) - 1].Id;
          this.Guest2 = playersList[Number(msgs[1].content) - 1].Id;
          this.CanInvite = false;
          return new Classes.ActionInfo("Invite", this);
        } else {
          DM.send(`You chose ${playersList[Number(msgs[0].content) - 1].Name}`);
          DM.stopTyping();
          this.Guest1 = playersList[Number(msgs[0].content) - 1].Id;
          this.CanInvite = false;
          return new Classes.ActionInfo("Invite", this);
        }
      } else {
        DM.send(`You chose ${playersList[Number(msgs[0].content) - 1].Name}`);
        DM.stopTyping();
        this.Guest1 = playersList[Number(msgs[0].content) - 1].Id;
        this.CanInvite = false;
        return new Classes.ActionInfo("Invite", this);
      }
    } else {
      DM.send("You are running a party!.\n:balloon::tada::tada::balloon:");
      let Info = new Classes.ActionInfo("Invite", this);
      Info.Available = true;
      Info.Target1 = game.Players[this.Guest1];
      Info.Target2 = game.Players[this.Guest2];
      this.Guest1 = "";
      this.Guest2 = "";
      this.CanInvite = true;
      return Info;
    }
  }
};

//JESTER -------------------

Classes.Jester = class extends Classes.Player {
  constructor(id, channel, name) {
    super(id, "Jester", channel, name);
  }
  async Action(client, game) {
    let user = client.users.cache.get(this.Id);
    let DM = await user.createDM();
    DM.send("Zzzzz...");
    return new Classes.ActionInfo("Sleep", this);
  }
  WinningCondition(game) {
    console.log(game.Players[this.Id].Lynched, "FFS");
    return game.Players[this.Id].Lynched;
  }
};

//BOUNTY_HUNTER -------------------

Classes.Bounty_Hunter = class extends Classes.Player {
  constructor(id, channel, name) {
    super(id, "Bounty_Hunter", channel, name);
    this.Bounty;
  }
  async Action(client, game) {
    let user = client.users.cache.get(this.Id);
    let DM = await user.createDM();
    DM.send("Zzzzz...");
    return new Classes.ActionInfo("Sleep", this);
  }
  WinningCondition(game) {
    return !game.Players[this.Bounty].Alive;
  }
};

//GRAVEDIGGER -------------------

Classes.Gravedigger = class extends Classes.Player {
  constructor(id, channel, name) {
    super(id, "Gravedigger", channel, name);
    this.Shovels = 2;
  }
  async Action(client, game) {
    let user = client.users.cache.get(this.Id);
    let playersList = Object.values(game.Players);
    let DM = await user.createDM();
    if (this.Shovels <= 0) {
      DM.send(
        "All your shovels broke, don't forget to go looking for more next days.\nBetter go sleep, Zzzzz..."
      );
    } else {
      DM.startTyping();
      function makeList(array, initText, player) {
        let embed = new Discord.MessageEmbed()
          .setTitle("Night action")
          .setDescription(initText);
        let text = "0. Abstain\n";
        let notUsed = [];
        for (let i = 0; i < array.length; i++) {
          if (array[i].Name == player || array[i].Alive) {
            notUsed.push(i);
          } else text += `${i + 1 - notUsed.length}. ${array[i].Name}\n`;
        }
        embed.addField("\u200b", text, false);
        return {
          string: embed,
          unused: notUsed
        };
      }
      let list = makeList(
        playersList,
        "Select which grave to dig tonight: (You left " +
          this.Shovels +
          " Shovels)",
        this
      );
      let ranTimes = 0;
      for (let num of list.unused) {
        playersList.splice(num - ranTimes, 1);
        ranTimes++;
      }
      DM.send(list.string);
      let selection = await DM.awaitMessages(
        msg =>
          !msg.author.bot &&
          !isNaN(msg.content) &&
          Number(msg.content) % 1 == 0 &&
          (0 <= Number(msg.content) &&
            Number(msg.content) <= playersList.length),
        { max: 1, time: 45000 }
      );
      selection = getFirstMsg(selection);
      if (selection) {
        if (selection.content == "0") {
          DM.send("You put your shovel away tonight...");
          DM.stopTyping();
          return new Classes.ActionInfo("Dig", this);
        } else {
          DM.send(
            "You are going to dig " +
              playersList[Number(selection.content) - 1].Name +
              "'s grave'"
          );
          DM.stopTyping();
          let Info = new Classes.ActionInfo("Dig", this);
          Info.Available = true;
          Info.Target = playersList[Number(selection.content) - 1];
          return Info;
        }
      } else {
        DM.send(
          "It is nearing dawn... you did not have enough time to perform any action!"
        );
        DM.stopTyping();
        return new Classes.ActionInfo("Dig", this);
      }
    }
  }
};

module.exports = Classes;
