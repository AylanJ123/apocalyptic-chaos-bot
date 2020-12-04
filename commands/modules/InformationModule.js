"use strict";

const Discord = require("discord.js");

const object = {
  // COLOUR HEXES
  teamColors: {
    "Reformation (Survivors)": "#00d6ff",
    "Apocalypse (Zombies)": "#05ff8a",
    "Corruption (Traitors)": "#ed5c2a",
    "Committed (Soloists)": "#a349a4"
  },
  // COMMAND INFORMATION
  helpTexts: {
    new: {
      name: "New",
      arguments: "None",
      aliases: "n",
      description:
        "Host a new game lobby of Apocalyptic Chaos in the current channel!"
    },
    join: {
      name: "Join",
      arguments: "None",
      aliases: "j",
      description:
        "Join the current game held within the same channel. A game must be hosted before you can join."
    },
    leave: {
      name: "Leave",
      arguments: "None",
      aliases: "l",
      description:
        "Leave the game in the respective channel before it begins. Once it has begun, you may no longer leave the game."
    },
    kick: {
      name: "Kick",
      arguments: "User id to kick / Mention user to kick",
      aliases: "k",
      description:
        "Kick a player from this game. This means they will be removed from the current game, but can rejoin if they wish."
    },
    ban: {
      name: "Ban",
      arguments: "User id to ban / Mention user to ban",
      aliases: "b",
      description:
        "Ban a player from this game. This will mean this player can not rejoin the current game taking place."
    },
    start: {
      name: "Start",
      arguments: "None",
      aliases: "s",
      description:
        "Start the game in this channel! (Once started, can only be ended forcibly and can't kick or ban more players.)"
    },
    end: {
      name: "End",
      arguments: '"forced" to end it once started',
      aliases: "e",
      description: "End the current game, preferably before it starts."
    },
    rolelist: {
      name: "Rolelist",
      arguments: "None",
      aliases: "rl",
      description: "View the roles that are present in the game!"
    },
    connect4: {
      name: "Connect4",
      arguments: "None",
      aliases: "None",
      description:
        "Start a match of Connect 4 with someone! **[Currently down due to a massive bug]**"
    },
    help: {
      name: "Help",
      arguments:
        'Command to show / "role" or "r" for a list of roles / role + <role> for specific information / "howtoplay" or "htp" to show a guide / None for list of commands',
      aliases: "h",
      description:
        "Shows a lot of help and information about roles, teams and commands."
    },
    ping: {
      name: "Ping",
      arguments: "None",
      aliases: "None",
      description:
        "Show the current ping of the bot. The only main use of the command is to check if the bot went offline or whether it is just responding very slow."
    },
    gameinfo: {
      name: "Gameinfo",
      arguments: "None",
      aliases: "gi",
      description:
        'Shows the current players in game. If game hasn\'t started, it will show "(No state)" on each player, but if game has been started, will show their respective state (Alive / Dead)'
    },
    links: {
      name: "Links",
      arguments: "None",
      aliases: "None",
      description:
        "Shows important links of interest. It shows the bot invite, support server invite, project page and project website"
    }
  },
  // ROLE EMOJIS
  RoleEmojis: {
    Survivor: "<:Survivor:779736738569650206>",
    Infected: "<:Infected:779732995799646318>",
    Researcher: "<:Researcher:779736760384094238>",
    Scientist: "<:Scientist:779736816130457630>",
    Medic: "<:Medic:779736777527263232>",
    Marshall: "<:Marshall:779736793716621312>",
    Zombie_Hunter: "<:Zombie_Hunter:779736850319015958>",
    Gravedigger: "<:Gravedigger:779736868538679317>",
    Zombie: "<:Zombie:779730970655719424>",
    Horde_Leader: "<:Horde_Leader:779730989026508800>",
    Zombie_Crier: "<:Zombie_Crier:779740770743091210>",
    Serial_Killer: "<:Serial_Killer:779688589843103754>",
    Mastermind: "<:Mastermind:779688606808801310>",
    Mad_Scientist: "<:Mad_Scientist:779688625662328852>",
    Trapper: "<:Trapper:779688644901994506>",
    Waiter: "<:Waiter:779688662752428032>",
    Jester: "<:Jester:779734135785914368>",
    Bounty_Hunter: "<:Bounty_Hunter:779734160700735490>",
    Duellist: "<:Duellist:779734177393541129>"
  },
  // ROLE INFORMATION
  roleInfo: {
    survivor: {
      name: "Survivor",
      description:
        "One of the remaining humans who have survived the Apocalypse... so far.",
      team: "Reformation (Survivors)",
      thumbnail:
        "https://cdn.discordapp.com/attachments/758414316214157343/782274708291715082/New_Survivor.png",
      abilities: "**None**",
      tips:
        "Even though you have no special abilities, the ability to vote enable you to have power in gaining the majority and lynching evil players. Remember, **every vote counts!**"
    },
    infected: {
      name: "Infected",
      description:
        "Believes to be unaffected... but has already begun to transform...",
      team: "Reformation (Survivors)",
      thumbnail: "",
      abilities: "**None**",
      tips:
        "You will appear to be a regular Survivor... but you start off the game being bitten. You will turn into a Zombie at the end of night 2, hurry and get a Medic to heal you!"
    },
    researcher: {
      name: "Researcher",
      description:
        "The heart of the Research facility within the Reformation base. The sole scientist searching for a cure to the deadly virus.",
      team: "Reformation (Survivors)",
      thumbnail:
        "https://cdn.discordapp.com/attachments/758414316214157343/782290686090280991/779736760384094238.png",
      abilities:
        "**Research**: Sample from one player during the night. If the player is a member of the Apocalypse, you will get a sample and will be a step closer to finding the cure.\n**Choose Accomplice**: Instead of working to find the cure, choose an Accomplice, who will become the new Researcher after your death. Any player that is not part of the Reformation will refuse this position.",
      tips:
        "Choosing an Accomplice can lead to identifying any Traitors hiding amongst the Reformation. Use this to your advantage!"
    },
    scientist: {
      name: "Scientist",
      description:
        "An intellitual who inspects samples to find the infected individuals.",
      team: "Reformation (Survivors)",
      thumbnail:
        "https://cdn.discordapp.com/attachments/758414316214157343/782290686384406558/779736816130457630.png",
      abilities:
        "**Inspect**: Inspect two players to see if there is at least one player with the infection. You can only find players that were not original members of the Apocalypse. You will only get a positive or negative result.",
      tips:
        "You do not have to investigate two players simulataneously! Investigate one player to get a clearer piece of information!"
    },
    sleuth: {
      name: "Sleuth",
      suggestion: true,
      description:
        "A keen eyed detective who can reconstruct scenes from observations of silhouettes.",
      team: "Reformation (Survivors)",
      thumbnail: "",
      abilities:
        "**Observe**: Look at someone's house to note down silhouettes that visit your target. Any silhouette found entering will be noted as numbered silhouettes. If you observe a silhouette exiting your target's house, your information will be updated to show the silhouette's name rather than a numbered silhouette.",
      tips:
        "Use your information to track down zombies and traitors! Only reveal yourself when you have sufficient information to convict an evil player!"
    },
    medic: {
      name: "Medic",
      description:
        "A professional doctor who makes their living by healing the sick and injured.",
      team: "Reformation (Survivors)",
      thumbnail:
        "https://cdn.discordapp.com/attachments/758414316214157343/782290686564630538/779736777527263232.png",
      abilities:
        "**Heal**: Visit a target to take care of any injuries they have suffered. You will prioritize severe injuries over zombie infections.",
      tips:
        "Protecting the Researcher can help them live long enough to find a cure, which aids the Reformation in making them immune to conversions."
    },
    marshall: {
      name: "Marshall",
      description: "A war veteran who now patrols during the night.",
      team: "Reformation (Survivors)",
      thumbnail:
        "https://cdn.discordapp.com/attachments/758414316214157343/782290686829527060/779736793716621312.png",
      abilities:
        "**Protect**: Stand outside of someone's house to prevent their first visitor from acting upon your target! You will allow the Researcher, Scientist and Medic through, however any other roles will be sent away!",
      tips: "Protect the most important roles, such as the Researcher or Medic!"
    },
    zombie_hunter: {
      name: "Zombie Hunter",
      description:
        "A vigilantic marksman who takes justice in their own hands to shoot all suspects.",
      team: "Reformation (Survivors)",
      thumbnail:
        "https://cdn.discordapp.com/attachments/758414316214157343/782290687118540850/779736850319015958.png",
      abilities:
        "**Shoot**: Shoot the suspicious with your shotgun! You can not shoot during the first night as you prepare your shotgun for use.",
      tips:
        "Use information to deduce the players on either the Apocalypse or Corruption before shooting them. If the suspect is being voted off, let them be lynched as your kills will not reveal the player's role."
    },
    gravedigger: {
      name: "Gravedigger",
      description: "A mortician who digs up bodies to analysize them.",
      team: "Reformation (Survivors)",
      thumbnail:
        "https://cdn.discordapp.com/attachments/758414316214157343/782290687290769428/779736868538679317.png",
      abilities:
        "**Uncover**: Uncover someone's grave to discover their last role before death. You may only use this ability once.",
      tips:
        "Roles are hidden on death during the night! Use your ability to uncover mysteries that have been taken to the grave..."
    },
    zombie: {
      name: "Zombie",
      description:
        "A diseased predator of the remaining population hiding among the last of the survivors, waiting for the perfect chance to strike.",
      team: "Apocalypse (Zombies)",
      thumbnail:
        "https://cdn.discordapp.com/attachments/758414316214157343/781880051309477908/New_Zombie.png",
      abilities:
        "**Bite**: Insert your infected teeth in someone's else arm and let the virus coarse through their blood. 3 days after being bitten, if they remain infected, the target player will convert into a Zombie. Members of the Corruption can never convert into a Zombie.",
      tips:
        "You are pretty weak, and members of the Corruption can easily kill you, try to get them first and guess who else is a Zombie, you can accidentally kill a friend!"
    },
    horde_leader: {
      name: "Horde Leader",
      description: "The founder of chaos, with knowledge of all other zombies.",
      team: "Apocalypse (Zombies)",
      thumbnail:
        "https://cdn.discordapp.com/attachments/758414316214157343/781880051548815370/New_Horde_Leader.png",
      abilities:
        "**Leadership**: You know all zombies at all times. You will be alerted when someone converts into a zombie.\n**Bite**: Insert your infected teeth in someone's else arm and let the virus coarse through their blood. 3 days after being bitten, if they remain infected, the target player will convert into a Zombie. Members of the Corruption can never convert into a Zombie.",
      tips:
        "Use your knowledge on all zombies to know when your team have the majority!"
    },
    zombie_crier: {
      name: "Zombie Crier",
      description: "A diseased caller for darkness.",
      suggestion: true,
      team: "Apocalypse (Zombies)",
      thumbnail:
        "https://cdn.discordapp.com/attachments/758414316214157343/781880051989741648/New_Zombie_Crier.png",
      abilities:
        "**Cry of the Blood Moon**: Activate an event the following night, in which all zombies can bite twice within the night.\n**Bite**: Insert your infected teeth in someone's else arm and let the virus coarse through their blood. 3 days after being bitten, if they remain infected, the target player will convert into a Zombie. Members of the Corruption can never convert into a Zombie.",
      tips:
        "Activating the Blood Moon event at the perfect time is key. Activating the event with too few zombies will result in little biting activity, however activating the event with too many zombies can lead to random death."
    },
    berserker: {
      name: "Berserker",
      description:
        "An aggressive follower of the Apocalypse willing to pay blood for slaughter.",
      suggestion: true,
      team: "Apocalypse (Zombies)",
      thumbnail: "",
      abilities:
        "**Blood for blood**: Sacrifice yourself to inflict a fatal unblockable rampage on a specified target. If a member of the Corruption is targetted, they will instead receive two bites.\n**Bite**: Insert your infected teeth in someone's else arm and let the virus coarse through their blood. 3 days after being bitten, if they remain infected, the target player will convert into a Zombie. Members of the Corruption can never convert into a Zombie.",
      tips:
        "Using your ability on a member of the Corruption when you are found suspicious is a great tactic to breach the Corruption's advancement quickly."
    },
    serial_killer: {
      name: "Serial Killer",
      description: "A merciless assassin striking through the night.",
      team: "Corruption (Traitors)",
      thumbnail:
        "https://cdn.discordapp.com/attachments/758414316214157343/781880280176394270/New_Serial_Killer.png",
      abilities:
        "**Stab**: Put your cold knife inside someone guts. Your victim will die if not healed in the following minutes. Zombies coagulate their blood enough to survive one stabbing, but 2 stabs are too much for them to handle by themself.",
      tips:
        "Try not to stab Zombies, you are one of the strongest Traitors, aim to kill the important Survivors first, such as Researcher and Medic."
    },
    mastermind: {
      name: "Mastermind",
      description: "An evil genius with hypnotic powers.",
      team: "Corruption (Traitors)",
      thumbnail:
        "https://cdn.discordapp.com/attachments/758414316214157343/781880280364875786/New_Mastermind.png",
      abilities:
        "**Hypnosis**: Make someone believe they are acting as usual, until it is too late, once they have finished your deed, which could be infecting someone or injuring them, causing severe bleeding.",
      tips:
        "Infecting seems useless, but it can be used to blame players and get the attention away from you. Also, by infecting people you can aid other Corruption members by converting the more important Reformation roles, like a Zombie Hunter or Marshall."
    },
    mad_scientist: {
      name: "Mad Scientist",
      description:
        "Once a worker for the Research facility... now madness eats away at his sanity.",
      team: "Corruption (Traitors)",
      thumbnail:
        "https://cdn.discordapp.com/attachments/758414316214157343/781880280628723712/New_Mad_Scientist-1.png",
      abilities:
        "**Poison**: Poison someone. This will not alert your target and they will die within 2 days unless healed by a Medic.\n**Injure**: Injure someone. This will alert your target and they will die within 1 day unless healed by a Medic.",
      tips:
        "Use your different killing techniques wisely to cause chaos among the Reformation. Use poison to achieve a masked kill while use injuring for a rapid death."
    },
    trapper: {
      name: "Trapper",
      description:
        "A tool crafting master, who crafts and uses deadly traps to fatally wound others...",
      team: "Corruption (Traitors)",
      thumbnail:
        "https://cdn.discordapp.com/attachments/758414316214157343/781880280843550750/New_Trapper.png",
      abilities:
        "**Trap**: Set up a trap at someone's house. Their first visitor will gain severe bleeding after their visit. If the trap remains unactivated after the second night after placement, the target will start to bleed. You may plant the trap at your own house... to your own demise.",
      tips:
        "Setting up a trap at the Researcher's house can severely wound important protecting roles, such as Medic, as well as potentially damaging zombies."
    },
    waiter: {
      name: "Waiter",
      description:
        "An excellent host... with several nasty tricks up their sleeve...",
      team: "Corruption (Traitors)",
      thumbnail:
        "https://cdn.discordapp.com/attachments/758414316214157343/781880281014730782/New_Waiter.png",
      abilities:
        "**Host**: Host a party for up to 2 people. If a zombie is invited, the other guest will be bitten. If no zombies are invited, both guests will be poisoned. All guests can not perform their abilities and are immune to all visits. You may only host a party every two days.",
      tips:
        "If you are aiming to kill, try to not invite a zombie. You can also make other zombies kill each other by inviting two zombies to the same party."
    },
    jester: {
      name: "Jester",
      description: "An entertainer... who will haunt you from the grave.",
      team: "Committed (Soloists)",
      thumbnail:
        "https://cdn.discordapp.com/attachments/758414316214157343/782684281356943370/New_Jester-1.png",
      abilities:
        "**Haunt**: Only activates after you are lynched by the Reformation. Haunt someone to their grave. You may only do this the night after your death. Your attack is piercing and can not be healed or protected.",
      tips: "Claiming other roles makes you look suspicious.",
      winningCondition:
        "Get yourself lynched by the Reformation by any means necessary."
    },
    bounty_hunter: {
      name: "Bounty Hunter",
      description:
        "Assigned a bounty to kill, the hunter watches their every move...",
      team: "Committed (Soloists)",
      thumbnail:
        "https://cdn.discordapp.com/attachments/758414316214157343/782684281516064848/New_Bounty_Hunter-1.png",
      abilities:
        "**Assignment**: At the start of the game, you will be randomly assigned a target player. Get this target killed.",
      tips:
        "Claiming an informative role may help eliminate your bounty at a quicker pace...",
      winningCondition:
        "Get your bounty killed and survive until the end of the game."
    },
    duellist: {
      name: "Duellist",
      suggestion: true,
      description:
        "An ambitious blade artist, wishing to prove his worth by duelling others.",
      team: "Committed (Soloists)",
      thumbnail:
        "https://cdn.discordapp.com/attachments/758414316214157343/782684281720799242/New_Duellist-1.png",
      abilities:
        "**Challenge**: Challenge someone to a duel. This person will be immune to all visits during the night.\n**Stance**: Choose one of the three following stances: Offensive, Defensive, Sneaky. This stance will be used aaginst your opponent in a rock-paper-scissors type game.\n\n**Rules to the Duel**:\n**- The opponent can use the following stances:**\n+ Reformation: Offensive, Defensive\n+ Apocalypse: Offensive, Sneaky\n+ Corruption/Committed: Defensive, Sneaky\n+ Duellist: Offensive, Defensive, Sneaky\n**- Offensive beats Sneaky, Defensive beats Offensive, Sneaky beats Defensive.**\n**- If you win, you will kill your opponent.**\n**- If you lose, the following will happen to you depending on your target's faction:**\n+ Reformation: You start bleeding.\n+ Apocalypse: You get two bites.\n+ Corruption/Committed: You die.\n**- In the case of a draw, there will be no effect.**",
      tips: "Challenging a known role will make your life much easier.",
      winningCondition:
        "Challenge and win the duel against at least 2 opponents."
    }
  },
  // EFFECTS
  effects: {
    cure: {
      name: "Cure",
      color: "#00d6ff",
      role: "**An effect that can only be provided by the Researcher.**",
      description:
        "A cure to the deadly virus, in the form of a vaccine. The vaccine enables Reformation immunity to the virus, and therefore will no longer be able to convert into a Zombie. It will also heal everyone back to 0 bites."
    },
    heal: {
      name: "Heal",
      color: "#00d6ff",
      role: "**An effect that can only be provided by a Medic.**",
      description:
        "A restoration of health that can be supplied to anyone. This effect will heal the most severe type of damage done to a player.\n\nHeals will prioritize in this order:\n1. Death (too many zombie bites counts as death)\n2. Bleeding\n3. Poison\n4. Zombie Bites"
    },
    protect: {
      name: "Protect",
      color: "#00d6ff",
      role: "**An effect that can only be provided by a Marshall.**",
      description:
        "The first role that visits this player will be sent away, ultimately disabling their ability for the night. Researchers, Medics and Scientists will not be affected by this."
    },
    bites: {
      name: "Bites",
      color: "#00ff8a",
      role:
        "**An effect that can be provided by every member of the Apocalypse.**",
      description:
        "A bite that will lead to conversion within three days if the cure has not yet been discovered. Members of the Corruption will not be affected by bites. Three bites on one player means they will die, regardless of their role."
    },
    blood_moon: {
      name: "Blood Moon",
      color: "#00ff8a",
      role: "**An effect that can only be called by the Zombie Crier.**",
      description:
        "A bloody merciless night. All members of the Apocalypse will be able to bite two people during this night. Does not affect human members of the Apocalypse."
    },
    poison: {
      name: "Poison",
      color: "#ff4f00",
      role: "**An effect mostly used by members of the Corruption.**",
      description:
        "A tactic used by members of the Corruption for a silent death. Does not warn the person inflicted with poison and kills within two days. This effect can only be removed by a heal."
    },
    bleeding: {
      name: "Bleeding",
      color: "#ff4f00",
      role: "**An effect mostly used by members of the Corruption.**",
      description:
        "A delayed death that occurs when a victim suffers severe injuries. The victim is warned when they start bleeding and will only have one day to be healed before they die."
    }
    /*rage: {
      name: "Rage",
      color: "#ff9d5c",
      role: "**An effect gained by anyone.**",
      description: "A thirst for vengence is deadly. The person that has gained this effect will kill the first person they see the following night."
    },*/
  },
  // EMBED FUNCTIONS
  embedList(title, initText, array, numbered) {
    function FLUpper(string) {
      let txt = "";
      let splitted = string.split("_");
      for (let element of splitted) {
        txt += element[0].toUpperCase() + element.slice(1) + " ";
      }
      return txt;
    }
    let text = "";
    for (let i = 0; i < array.length; i++) {
      if (numbered) {
        text += `${i + 1}. ${FLUpper(array[i])}\n`;
      } else {
        text += `- ${FLUpper(array[i])}\n`;
      }
    }
    let embed = new Discord.MessageEmbed();
    embed
      .setTitle(title)
      .setDescription(initText)
      .addFields({ name: "\u200b", value: text });
    return embed;
  },
  sortTeams(title, description, roles) {
    let text = "";
    let embed = new Discord.MessageEmbed();
    embed
      .setTitle(title)
      .setDescription(description)
      .addFields(
        {
          name: "Reformation",
          value: roles.reformation.join("\n"),
          inline: true
        },
        {
          name: "Corruption",
          value: roles.corruption.join("\n"),
          inline: true
        },
        { name: "\u200b", value: "** **", inline: true },
        {
          name: "Apocalypse",
          value: roles.apocalypse.join("\n"),
          inline: true
        },
        { name: "Committed", value: roles.committed.join("\n"), inline: true },
        { name: "\u200b", value: "** **", inline: true },
        {
          name: "Suggestions",
          value: roles.suggestions.join("\n"),
          inline: true
        }
      );
    return embed;
  },
  embedHelp(com) {
    return new Discord.MessageEmbed()
      .setTitle(com.name)
      .setDescription("Aliases: " + com.aliases)
      .addField("Arguments: " + com.arguments, com.description, false);
  },
  embedEffect(eff) {
    let color;
    eff.color ? (color = eff.color) : (color = "#ff9d5c");
    return new Discord.MessageEmbed()
      .setTitle(eff.name)
      .setColor(color)
      .setDescription(eff.role)
      .addField("Effect: ", eff.description);
  }
};

object.embedRole = function(role) {
  let embed = new Discord.MessageEmbed()
    .setTitle(role.name)
    .setColor(this.teamColors[role.team])
    .setThumbnail(role.thumbnail)
    .setDescription(role.description)
    .addFields(
      { name: "Team:", value: role.team },
      {
        name: "Winning Condition:",
        value:
          role.team == "Committed (Soloists)"
            ? role.winningCondition
            : "Wins with " + role.team
      },
      { name: "Abilities:", value: role.abilities },
      { name: "Tips:", value: role.tips }
    );
  return embed;
};

// HOW TO PLAY EMBED
object.helpTexts.howtoplay = new Discord.MessageEmbed()
  .setTitle("How to play")
  .setDescription("A little guide to learn how to play depending of your team")
  .addField(
    "\u200b",
    "There are 4 teams, each one of them must try to accomplish their own objectives to win! Game starts at night when actions are done, then will be morning and everyone have to discuss. During afternoon, everyone must vote for who they think must be lynched!",
    false
  )
  .addFields(
    {
      name: "Survivors:",
      value:
        "Eliminate the evil players among the group, killing Traitors and Zombies. Tip: As Traitors are strongers than Zombies, lynch them first.",
      inline: false
    },
    {
      name: "Zombies:",
      value:
        "Spread the virus and destroy all the menaces, can only infect Survivors. Tip: As Traitors are strongers than you, but they start with very few members, convince Survivors to kill them ASAP. Converting the Researcher means that the cure will not be discovered if the Researcher did not have any Acquaintance.",
      inline: false
    },
    {
      name: "Traitors:",
      value:
        "Kill everyone that doesn't follow your mindset, your leader created a vaccine so you can't convert into Zombies. Tip: As you are the strongest players and Zombies can't infect you, make sure to kill the Survivors first to avoid the virus spreading. Also you can try to help find the cure first and then kill them.",
      inline: false
    },
    {
      name: "Committed:",
      value:
        "An special team where each individual has a different winning condition, you can win with any other team and not all Committed may win at the same time. Tip: Try to help the team that will help you the most and won't try to kill you!",
      inline: false
    },
    {
      name: "Tips for a funnier playtime:",
      value:
        "**DO NOT SHOW IRREFUTABLE EVIDENCE OF YOU HAVING CERTAIN ROLE**, this will ruin the game! Also, try not to talk during night, everyone is supposed to be asleep! And, ffs, **DON'T TALK IF YOU DIED**, that's just nonsense!",
      inline: false
    }
  );

module.exports = object;
