"use strict";

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

function actionOn(Holder, target, type, single) {
  for (let info of Holder) {
    if (info.Type == type) {
      if (single) {
        if (info.Target.Name == target)
          return {
            value: true,
            objInd: Holder.indexOf(info)
          };
      } else {
        if (info.Target1.Name == target)
          return {
            value: true,
            objInd: Holder.indexOf(info)
          };
        if (info.Target2.Name == target)
          return {
            value: true,
            objInd: Holder.indexOf(info)
          };
      }
    }
  }
  return {
    value: false
  };
}

function checkTraps(player, target, Holder) {
  let action = actionOn(Holder, target, "Trap", true);
  if (target.Traps[0]) {
    target.Traps[0].Activate(player);
    target.Traps.shift();
  } else if (action.value) {
    Holder[action.objInd].preActivation(player);
    Holder.splice(action.objInd, 1);
  }
}

function applyEffect(player, effect, client, game) {
  let effects = {
    Bites: { limit: 3, death: "bitten to death" },
    Bleeding: { limit: 2, death: "bled to death" },
    Poison: { limit: 3, death: "poisoned" },
    StabWound: { limit: 2, death: "stabbed" }
  };
  player[effect]++;
  if (player[effect] >= effects[effect].limit)
    player.Kill(client, effects[effect].death, false, game);
}

const Repertory = {
  ChooseAccomplice(Info, Holder, client, game) {
    checkTraps(Info.From, Info.Target, Holder);
    if (Survivors.includes(Info.Target.Role)) {
      Info.From.Choosed = true;
      Info.From.Accomplice = Info.Target.Id;
      client.users.cache
        .get(Info.From.Id)
        .send(
          "Successful choosing! " +
            Info.Target.Name +
            " is now your accomplice!"
        );
    } else {
      client.users.cache
        .get(Info.From.Id)
        .send(
          Info.Target.Name +
            " refused to be your successor, they do not belong to the Reformation!"
        );
    }
  },
  Research(Info, Holder, client, game) {
    checkTraps(Info.From, Info.Target, Holder);
    if (!Info.Target.Researched && Zombies.includes(Info.Target.Role)) {
      Info.From.Researches++;
      Info.Target.Researched = true;
      client.users.cache
        .get(Info.From.Id)
        .send("Your target gave you a sample!");
    } else
      client.users.cache
        .get(Info.From.Id)
        .send("Your target seems to be clean!");
    /*let checks = [];
    if (!Info.Target1.Researched && Zombies.includes(Info.Target1.Role)) {
      Info.From.Researches++;
      checks.push(Info.Target1.Name);
      Info.Target1.Researched = true;
    }
    if (Info.Target2)
      if (!Info.Target2.Researched && Zombies.includes(Info.Target2.Role)) {
        Info.From.Researches++;
        checks.push(Info.Target2.Name);
        Info.Target2.Researched = true;
      }
    function oneOrTwo() {
      if (Info.Target2) return "None of them gave samples!";
      return "that player gave no sample!";
    }
    client.users.cache
      .get(Info.From.Id)
      .send(
        checks.length == 1
          ? `${checks[0]} gave a sample!!`
          : checks.length == 0
          ? oneOrTwo()
          : "Both players gave samples!"
      );*/
    if (Info.From.Researches >= Info.From.Cures && !game.Cure)
      game.CureFound(client, Info.From.Channel);
  },
  Heal(Info, Holder, client, game) {
    checkTraps(Info.From, Info.Target, Holder);
    let user = client.users.cache.get(Info.From.Id);
    let targetUser = client.users.cache.get(Info.Target.Id);
    if (Info.Target.StabWound) {
      Info.Target.StabWound--;
      user.send("You healed some severe bleeding");
      targetUser.send("A medic healed a fatal wound caused by stabbing!");
    } else if (Info.Target.Bleeding) {
      Info.Target.Bleeding--;
      user.send("You healed some severe bleeding!");
      targetUser.send("A medic healed your severe bleeding!");
    } else if (Info.Target.Poison) {
      Info.Target.Poison--;
      user.send("You healed a poisoning!");
      targetUser.send("A medic healed your poisoning!");
    } else if (Info.Target.Bites) {
      Info.Target.Bites--;
      if (Info.Target.Infected && !Info.Target.Bites) Info.Target.Infected = 0;
      user.send("You healed a zombie bite!");
      targetUser.send("A medic healed a bite on you!");
    }
  },
  Bite(Info, Holder, client, game) {
    checkTraps(Info.From, Info.Target, Holder);
    let action = actionOn(Holder, Info.Target.Name, "Protect", true);
    let action2 = actionOn(Holder, Info.Target.Name, "Heal", true);
    let user = client.users.cache.get(Info.From.Id);
    if (action.value) {
      Holder[action.objInd].preActivation();
      Holder.splice(action.objInd, 1);
      user.send("A Marshall made you step back!");
    } else if (action2.value) {
      Holder[action2.objInd].preActivation("bitten");
      Holder.splice(action2.objInd, 1);
      user.send("You bit your target!");
    } else if (Info.Target.Alive) {
      applyEffect(Info.Target, "Bites", client, game);
      if (
        !Info.Target.Infected &&
        !game.Cure &&
        Survivors.includes(Info.Target.Role)
      )
        Info.Target.Infected = 1;
      user.send("You bit your target!");
    } else {
      user.send(
        "You found your target dead on the floor... someone was quicker than you."
      );
    }
  },
  Stab(Info, Holder, client, game) {
    checkTraps(Info.From, Info.Target, Holder);
    let action = actionOn(Holder, Info.Target.Name, "Protect", true);
    let action2 = actionOn(Holder, Info.Target.Name, "Heal", true);
    let user = client.users.cache.get(Info.From.Id);
    if (action.value) {
      Holder[action.objInd].preActivation();
      Holder.splice(action.objInd, 1);
      user.send("A Marshall made you step back!");
    } else if (action2.value) {
      Holder[action2.objInd].preActivation("stabbed");
      Holder.splice(action2.objInd, 1);
      user.send("You stabbed your target!");
    } else if (Info.Target.Alive) {
      user.send("You stabbed your target!");
      if (Zombies.includes(Info.Target.Role)) {
        applyEffect(Info.Target, "StabWound", client, game);
        client.users.cache.get(Info.Target.Id).send("You got stabbed");
      } else Info.Target.Kill(client, "stabbed", false, game);
    } else {
      user.send(
        "You found your target dead on the floor... someone was quicker than you."
      );
    }
  },
  Protect(Info, Holder, client, game) {
    checkTraps(Info.From, Info.Target, Holder);
  },
  Inspect(Info, Holder, client, game) {
    checkTraps(Info.From, Info.Target1, Holder);
    checkTraps(Info.From, Info.Target2, Holder);
    let checks = [];
    if (Info.Target1.Infected || Info.Target1.Converted) {
      checks.push(Info.Target1.Name);
    }
    if (Info.Target2)
      if (Info.Target2.Infected || Info.Target2.Converted) {
        checks.push(Info.Target2.Name);
      }
    function oneOrTwo(positive) {
      if (!positive) {
        if (Info.Target2) return "None of them has developed any infections!";
        return "That player hasn't developed any infection!";
      } else {
        if (Info.Target2)
          return "One or both of them have developed an infection!";
        return "That player has developed an infection!";
      }
    }
    client.users.cache
      .get(Info.From.Id)
      .send(checks.length == 0 ? oneOrTwo(false) : oneOrTwo(true));
  },
  Infect(Info, Holder, client, game) {
    if (Info.Target) {
      checkTraps(Info.From, Info.Target, Holder);
      let action = actionOn(Holder, Info.Target.Name, "Protect", true);
      let action2 = actionOn(Holder, Info.Target.Name, "Heal", true);
      let user = client.users.cache.get(Info.From.Id);
      if (action.value) {
        Holder[action.objInd].preActivation();
        Holder.splice(action.objInd, 1);
        user.send("A Marshall made you step back!");
      } else if (action2.value) {
        Holder[action2.objInd].preActivation("sprayed with a chemical");
        Holder.splice(action2.objInd, 1);
        user.send("You sprayed your target!");
      } else if (Info.Target.Alive) {
        user.send("You sprayed your target!");
        if (
          !Info.Target.Infected &&
          !game.Cure &&
          Survivors.includes(Info.Target.Role)
        )
          Info.Target.Infected = 1;
      } else {
        user.send(
          "You found your target dead on the floor... someone was quicker than you."
        );
      }
    } else {
      checkTraps(Info.From, Info.Target1, Holder);
      let action = actionOn(Holder, Info.Target1.Name, "Protect", true);
      let action2 = actionOn(Holder, Info.Target1.Name, "Heal", true);
      let user = client.users.cache.get(Info.From.Id);
      if (action.value) {
        Holder[action.objInd].preActivation();
        Holder.splice(action.objInd, 1);
        user.send("A Marshall made you step back!");
      } else if (action2.value) {
        Holder[action2.objInd].preActivation("sprayed with a chemical");
        Holder.splice(action2.objInd, 1);
        user.send("You sprayed your target!");
      } else if (Info.Target1.Alive) {
        user.send("You sprayed your target!");
        if (
          !Info.Target1.Infected &&
          !game.Cure &&
          Survivors.includes(Info.Target.Role)
        )
          Info.Target1.Infected = 1;
      }
      if (Info.Target2) {
        checkTraps(Info.From, Info.Target2, Holder);
        let action3 = actionOn(Holder, Info.Target2.Name, "Protect", true);
        let action4 = actionOn(Holder, Info.Target2.Name, "Heal", true);
        if (action3.value) {
          Holder[action3.objInd].preActivation();
          Holder.splice(action3.objInd, 1);
          user.send("A Marshall made you step back!");
        } else if (action4.value) {
          Holder[action4.objInd].preActivation("sprayed with a chemical");
          Holder.splice(action4.objInd, 1);
          user.send("You sprayed your target!");
        } else if (Info.Target2.Alive) {
          user.send("You sprayed your target!");
          if (
            !Info.Target2.Infected &&
            !game.Cure &&
            Survivors.includes(Info.Target.Role)
          )
            Info.Target2.Infected = 1;
        }
      }
    }
  },
  Injure(Info, Holder, client, game) {
    if (Info.Target) {
      checkTraps(Info.From, Info.Target, Holder);
      let action = actionOn(Holder, Info.Target.Name, "Protect", true);
      let action2 = actionOn(Holder, Info.Target.Name, "Heal", true);
      let user = client.users.cache.get(Info.From.Id);
      if (action.value) {
        Holder[action.objInd].preActivation();
        Holder.splice(action.objInd, 1);
        user.send("A Marshall made you step back!");
      } else if (action2.value) {
        Holder[action2.objInd].preActivation("injured");
        Holder.splice(action2.objInd, 1);
        user.send("You injured your target!");
      } else if (Info.Target.Alive) {
        user.send("You injured your target!");
        applyEffect(Info.Target, "Bleeding", client, game);
      } else {
        user.send(
          "You found your target dead on the floor... someone was quicker than you."
        );
      }
    } else {
      checkTraps(Info.From, Info.Target1, Holder);
      let action = actionOn(Holder, Info.Target1.Name, "Protect", true);
      let action2 = actionOn(Holder, Info.Target1.Name, "Heal", true);
      let user = client.users.cache.get(Info.From.Id);
      if (action.value) {
        Holder[action.objInd].preActivation();
        Holder.splice(action.objInd, 1);
        user.send("A Marshall made you step back!");
      } else if (action2.value) {
        Holder[action2.objInd].preActivation("injured");
        Holder.splice(action2.objInd, 1);
        user.send("You injured your target!");
      } else if (Info.Target1.Alive) {
        user.send("You injured your target!");
        applyEffect(Info.Target1, "Bleeding", client, game);
      }
      if (Info.Target2) {
        checkTraps(Info.From, Info.Target2, Holder);
        let action3 = actionOn(Holder, Info.Target2.Name, "Protect", true);
        let action4 = actionOn(Holder, Info.Target2.Name, "Heal", true);
        if (action3.value) {
          Holder[action3.objInd].preActivation();
          Holder.splice(action3.objInd, 1);
          user.send("A Marshall made you step back!");
        } else if (action4.value) {
          Holder[action4.objInd].preActivation("injured");
          Holder.splice(action4.objInd, 1);
          user.send("You injured your target!");
        } else if (Info.Target2.Alive) {
          user.send("You injured your target!");
          applyEffect(Info.Target2, "Bleeding", client, game);
        }
      }
    }
  },
  Hypnosis(Info, Holder, client, game) {
    checkTraps(Info.From, Info.Target, Holder);
    for (let info of Holder) {
      if (info.From.Name == Info.Target.Name) {
        info.Type = Info.Effect;
        break;
      }
    }
  },
  Shoot(Info, Holder, client, game) {
    checkTraps(Info.From, Info.Target, Holder);
    let action = actionOn(Holder, Info.Target.Name, "Protect", true);
    let action2 = actionOn(Holder, Info.Target.Name, "Heal", true);
    let user = client.users.cache.get(Info.From.Id);
    if (action.value) {
      Holder[action.objInd].preActivation();
      Holder.splice(action.objInd, 1);
      user.send("A Marshall made you step back!");
    } else if (action2.value) {
      Holder[action2.objInd].preActivation("shot");
      Holder.splice(action2.objInd, 1);
      Info.From.Bullets--;
      user.send("You shot your target!");
    } else if (Info.Target.Alive) {
      Info.From.Bullets--;
      user.send("You shot your target!");
      Info.Target.Kill(client, "shot", false, game);
    } else {
      user.send(
        "You found your target dead on the floor... someone was quicker than you."
      );
    }
  },
  Invite(Info, Holder, client, game) {
    checkTraps(Info.From, Info.Target, Holder);
    if (!Info.Target2) {
      client.users.cache
        .get(Info.Target1.Id)
        .send(
          "You were invited to a party! Who cares about their duties? :balloon::tada::tada::balloon:"
        );
      applyEffect(Info.Target1, "Poison", client), game;
    } else {
      client.users.cache
        .get(Info.Target1.Id)
        .send(
          "You were invited to a party! Who cares about their duties? :balloon::tada::tada::balloon:"
        );
      client.users.cache
        .get(Info.Target2.Id)
        .send(
          "You were invited to a party! Who cares about their duties? :balloon::tada::tada::balloon:"
        );
      if (Zombies.includes(Info.Target1.Role)) {
        applyEffect(Info.Target2, "Bites", client, game);
      } else if (Traitors.includes(Info.Target1.Role)) {
        applyEffect(Info.Target2, "Bleeding", client, game);
      } else {
        applyEffect(Info.Target2, "Poison", client, game);
      }
      if (Zombies.includes(Info.Target2.Role)) {
        applyEffect(Info.Target1, "Bites", client, game);
      } else if (Traitors.includes(Info.Target2.Role)) {
        applyEffect(Info.Target1, "Bleeding", client, game);
      } else {
        applyEffect(Info.Target1, "Poison", client, game);
      }
    }
  },
  Trap(Info, Holder, client, game) {
    let action = actionOn(Holder, Info.Target.Name, "Protect", true);
    let user = client.users.cache.get(Info.From.Id);
    if (action.value) {
      Holder[action.objInd].preActivation();
      Holder.splice(action.objInd, 1);
      user.send("A Marshall made you step back!");
    } else {
      Info.Target.Traps.push({
        Night: 1,
        Activate(player) {
          user.send("Your trap activated!");
          applyEffect(player, "Bleeding", client, game);
        }
      });
    }
  },
  Dig(Info, Holder, client, game) {
    client.users.cache
      .get(Info.From.Id)
      .send(Info.Target.Name + "'s role was " + Info.Target.Role);
    Info.From.Shovels--;
  }
};

module.exports = Repertory;
