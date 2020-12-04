"use strict";

const Discord = require("discord.js");

const client = new Discord.Client();

const activities_list = [
  "[1.3.0] Prefix is ac",
  "[1.3.0] Probably being coded",
  "[1.3.0] Waiting to host a game...",
  "[1.3.0] Eating some tasty brains",
  "[1.3.0] Collecting supplies...",
  "[1.3.0] Surviving the Apocalypse",
  "[1.3.0] Researching to find a cure...",
  "[1.3.0] Purifying samples",
  "[1.3.0] Stabbing someone in their sleep :)))"
];

const prefix = "ac ";

const fs = require("fs");

client.commands = new Discord.Collection();

const commandFiles = fs
  .readdirSync("./commands/")
  .filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.on("ready", () => {
  client.user.setActivity(
    activities_list[Math.floor(Math.random() * activities_list.length)]
  );
  console.log("Bot online!");
});

client.login("");

client.commands.get("trashcollector").execute(client);

async function gameStart(message, client) {
  try {
    await require("./commands/modules/GameModule.js").GameDevelopment(message.channel.id, client);
  } catch (err) {
    delete require("./commands/modules/GameModule.js").Games[message.channel.id];
    message.channel.send(
      "A critical error ocurred and the game was aborted! It may happen due to many reasons\n\nThe error was:\n```" +
        err +
        "```Here are some known issues:\n\n- Bot tried to DM a player that blocked it or is not sharing a server where allows DMs. Also happens if the bot lost readabilty of a channel where tried to send a message. These issues pop up the error:\n```TypeError: Cannot read property 'send' of undefined```\n" +
        "- Bot is missing an important permission, something like read a channel or send a message somewhere, maybe delete messages or collect reactions, check it has all the required permissions\n```DiscordAPIError: Missing Permissions```\n***Try to contact a developer and give as much info as you can!***"
    );
  }
}

const Aliases = {
  n: "new",
  s: "start",
  e: "end",
  j: "join",
  l: "leave",
  k: "kick",
  b: "ban",
  h: "help",
  gi: "gameinfo",
  rl: "rolelist"
};

client.on("message", async message => {
  if (
    !message.author.bot &&
    !message.content.toLowerCase().startsWith(prefix) &&
    message.mentions.users.first()
  )
    if (message.mentions.users.first().id == client.user.id) {
      message.channel.send(
        "My prefix is `ac`! Type help command to get more info!"
      );
    }
  if (
    !message.content.toLowerCase().startsWith(prefix) ||
    message.author.bot ||
    !message.guild
  )
    return;
  const args = message.content.slice(prefix.length).split(/ +/);
  const command = args.shift().toLowerCase();

  let LogsChannel = client.channels.cache.get("765971832258953226");
  let ExecCommand;

  try {
    ExecCommand =
      command in Aliases
        ? client.commands.get(Aliases[command])
        : client.commands.get(command);
    let result = await ExecCommand.execute(Discord, client, message, args);
    if (ExecCommand.name == "start" && result) {
      await gameStart(message, client);
    }
} catch (err) {
    if (!ExecCommand) return;
    console.warn(`${err.name} in ${ExecCommand.name} command: ${err.message}`);
    console.trace();
    LogsChannel.send(
      `${err.name} in ${ExecCommand.name} command: ${err.message}\n --- Debugging Info --- \nCommand executed by: ${message.member.displayName}\nIn the channel: ${message.channel}\nIn the server: ${message.guild.name}`
    );
  }
}); //Commands handler stops here ---------------------------------------
