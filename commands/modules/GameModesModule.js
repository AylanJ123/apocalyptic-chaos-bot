"use strict";

module.exports = {
  Classic: {
    Roles: [
      "Researcher",
      "Medic",
      "Zombie",
      "Survivor",
      "Serial_Killer",
      "Marshall",
      "Horde_Leader",
      "Scientist",
      "Mastermind",
      "Zombie_Hunter",
      ["Infected", "Zombie"],
      ["Waiter", "Trapper"],
      ["Medic", "Scientist"],
      ["Gravedigger", "Zombie_Hunter"],
      ["Jester", "Bounty_Hunter"],
      "Survivor"
    ],
    Shuffle: function(AllPlayersIds) {
      let FixedArray = this.Roles.map(x => x);
      FixedArray = FixedArray.slice(0, AllPlayersIds.length);
      let Matrix = [];
      for (let id of AllPlayersIds) {
        let pickedRole = FixedArray.splice(
          Math.floor(Math.random() * FixedArray.length),
          1
        );
        if (!typeof pickedRole == "string")
          pickedRole = Math.floor(Math.random() * pickedRole.length);
        Matrix.push([id, pickedRole[0]]);
      }
      return Matrix;
    }
  },
  Extreme: {
    Roles: [
      "Researcher",
      "Horde_Leader",
      "Serial_Killer",
      "Medic",
      "Marshall",
      "Mastermind",
      "Scientist",
      "Horde_Leader",
      "Zombie_Hunter",
      "Horde_Leader",
      "Medic",
      "Serial_Killer",
      "Researcher",
      "Marshall",
      "Horde_Leader",
      "Zombie_Hunter"
    ],
    Shuffle: function(AllPlayersIds) {
      let FixedArray = this.Roles.map(x => x);
      FixedArray = FixedArray.slice(0, AllPlayersIds.length);
      let Matrix = [];
      for (let id of AllPlayersIds) {
        let pickedRole = FixedArray.splice(
          Math.floor(Math.random() * FixedArray.length),
          1
        );
        if (!typeof pickedRole == "string")
          pickedRole = Math.floor(Math.random() * pickedRole.length);
        Matrix.push([id, pickedRole[0]]);
      }
      return Matrix;
    }
  }
  /*"Testings (Unplayable)": {
    Roles: [
      "Jester",
      "Bounty_Hunter",
      "Gravedigger",
      "Zombie"
    ],
    Shuffle: function(AllPlayersIds) {
      let FixedArray = this.Roles.map(x => x);
      FixedArray = FixedArray.slice(0, AllPlayersIds.length)
      let Matrix = [];
      for (let id of AllPlayersIds) {
        let pickedRole = FixedArray.splice(
          Math.floor(Math.random() * FixedArray.length),
          1
        );
        if (!typeof pickedRole == "string")
          pickedRole = Math.floor(Math.random() * pickedRole.length);
        Matrix.push([id, pickedRole[0]]);
      }
      return Matrix;
    }
  }*/
};
