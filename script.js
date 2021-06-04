'user strict';

// Damage tracker for player and enemy
let currentDmg = 0;
let currentEnemyDmg = 0;

// Turn count for trigger end
let turnCounter = 1;

// Still playing?
let playing = true;

// HP bars
let playerHpWidth = 100;
let enemyHpWidth = 100;

// hp bar for enemy and player
const enemyHP = document.querySelector('.enemy--hp');
const playerHP = document.querySelector('.player--hp');
const enemyHpBar = document.querySelector('.hp--enemyBar');
const playerHpBar = document.querySelector('.hp--playerBar');

// Execute skill containers and buttons
const exeContainer = document.getElementById('execute--container');
const closeModal = document.querySelector('.btn--closeModal');
const useModal = document.querySelector('.btn--useItem');
const twilBtn = document.querySelector('.btn--executeItem1');
const bandageBtn = document.querySelector('.btn--executeItem2');
const motBtn = document.querySelector('.btn--executeItem3');

// btn variables
const btnAttack = document.querySelector('.btn--attack');
const btnSkl1 = document.querySelector('.btn--skill1');
const btnSkl2 = document.querySelector('.btn--skill2');
const btnSkl3 = document.querySelector('.btn--skill3');
const btnSkl4 = document.querySelector('.btn--skill4');

// log variables
const attackLog = document.querySelector('.attack--log');
const turnCount = document.querySelector('.turn--count');

const player = {
  maxHP: 1000,
  curHp: 1000,
  attack: 20,
  buffs: [],
  debuffs: ['Poison', 'Petrify', 'Def down'],
  execute: {
    name: 'Execute',
    desc: 'Choose an item to help you aid in battle',
    cd: 1,
    cdTime: 1,
    skillFlag: false,
    currentItem,
    twilCoat: {
      name: 'Twil Coat',
      desc: 'Mitigate 75% damage',
      skillFlag: false,
      numUse: 6,
      numRem: 6,
      effVal: 0.75,
    },
    bandage: {
      name: 'Bandage',
      desc: 'Heals moderate amount of HP',
      skillFlag: false,
      numUse: 10,
      numRem: 10,
      effVal: 200,
    },
    motDraft: {
      name: 'Motivating Draft',
      desc: 'Increase attack',
      effval: 0.1,
    },
  },
  clarity: {
    name: 'Clarity',
    desc: 'Removes 1 debuff',
    skillFlag: false,
    cd: 5,
    cdTime: 5,
  },
  normalAtk() {
    return (currentDmg = this.attack + Math.round(Math.random() * 10));
  },
  dispel() {},
};

const buffSkills = {
  attackUp: {
    name: 'Rage',
    desc: 'Increase attack by 25%',
    effVal: 0.25,
    turnDur: 3,
  },
  evangelistBlade: {
    name: 'Evangelist Blade',
    desc: 'Increase attack by 35% indefinitely (Can be dispelled)',
    effVal: 0.35,
    turnDur: 99,
  },
};

const debuffSkills = {
  attackDown: {
    name: 'Defense Break',
    desc: 'Reduce attack by 25%',
    effVal: 0.25,
    turnDur: 3,
  },
  poison: {
    name: 'Poison',
    desc: 'Reduce hp overtime',
    effVal: 3,
    turnDur: 5,
  },
};

const enemy = {
  name: 'Lucilius',
  maxHp: 500,
  curHp: 500,
  attack: 20,
  buffs: [],
  debuffs: [],
  normalAttack() {
    return (currentEnemyDmg = Math.trunc(
      Math.random() * (50 - this.attack) + this.attack
    ));
  },
  paradiseLost: {
    name: 'Paradise Lost',
    skillFlag: false,
    paradise() {
      return (currentEnemyDmg = (10000 / player.maxHP) * enemy.attack);
    },
  },
  phosporus: {
    name: 'Phosporus',
    skillFlag: false,
    phosp() {
      return (currentEnemyDmg = Math.trunc(
        Math.random() * (600 - enemy.attack) + enemy.attack
      ));
    },
  },
  axionApocalypse: {
    name: 'Axion Apocalypse',
    skillFlag: false,
    axion() {
      return (currentEnemyDmg = Math.trunc(
        (Math.random() * (200 - enemy.attack) + enemy.attack) * 3
      ));
    },
  },
  theEnd() {
    return (currentEnemyDmg = 999999);
  },
};

// Battle start trigger function
const battleStartTrigger = function () {
  updatePlayerHp(enemy.paradiseLost.paradise());
  attackLog.innerText = `${enemy.name} used ${
    enemy.paradiseLost.name
  }, dealing ${enemy.paradiseLost.paradise()} damage! \n`;
};

// Checking and updating enemy triggers
const checkEnemyTrigger = function () {
  if (playing) {
    // Enemy battle triggers
    if (
      enemyHpWidth <= 95 &&
      enemyHpWidth >= 86 &&
      enemy.phosporus.skillFlag === false
    ) {
      // Casts Phosporus
      updatePlayerHp(enemy.phosporus.phosp());
      attackLog.innerText += `${enemy.name} used ${enemy.phosporus.name}, dealing ${currentEnemyDmg} damage! \n`;
      enemy.phosporus.skillFlag = true;
    } else if (
      enemyHpWidth <= 85 &&
      enemyHpWidth >= 75 &&
      enemy.axionApocalypse.skillFlag === false
    ) {
      // Casts Axion Apocalypse
      updatePlayerHp(enemy.axionApocalypse.axion());
      attackLog.innerText += `${enemy.name} used ${enemy.axionApocalypse.name} dealing ${currentEnemyDmg} damage! \n`;
      enemy.axionApocalypse.skillFlag = true;
    } else if (enemyHpWidth <= 10 && enemy.paradiseLost.skillFlag === false) {
      // Casts paradise lost
      updatePlayerHp(enemy.theEnd());
      attackLog.innerText += `${enemy.name} used ${
        enemy.paradiseLost.name
      }, dealing ${enemy.theEnd()} damage! \n`;
      enemy.paradiseLost.skillFlag = true;
    } else if (turnCounter === 40) {
      // Casts the end
      updatePlayerHp(enemy.theEnd());
      attackLog.innerText += `${enemy.name} used The End, Game Over! \n`;
    } else {
      // Enemy normal attack
      updatePlayerHp(enemy.normalAttack());
      attackLog.innerText += `${enemy.name} attack, dealing ${currentEnemyDmg} damage! \n`;
    }
  }
};

const updateEnemyHp = function () {
  // width = (enemy.hp*100)/(enemy.maxHP)
  // Damage to current hp
  enemy.curHp -= currentDmg;
  // Get width with this formula
  enemyHpWidth = (enemy.curHp * 100) / enemy.maxHp;
  // Update UI with the new width
  if (enemy.curHp <= 0) enemyHpWidth = 0;
  enemyHpBar.style.width = `${enemyHpWidth}%`;
  // Update HP text
  enemyHP.textContent = enemy.curHp;
};

const updatePlayerHp = function (value) {
  // Enemy attacks every turn
  player.curHp -= value;
  // Formula to calculate width for CSS width percentage
  playerHpWidth = (player.curHp * 100) / player.maxHP;
  // Set hp to 0 if current hp is less than 0
  if (player.curHp <= 0) playerHpWidth = 0;
  // Update HP bar
  playerHpBar.style.width = `${playerHpWidth}%`;
  playerHP.textContent = player.curHp;
};

const updateBattleStatus = function () {
  if (playing) {
    // Check skill cooldowns
    updateSkillCooldowns();
    // Check enemy triggers
    checkEnemyTrigger();
    // Update enemy hp
    updateEnemyHp();
    // Event check when player wins
    if (enemy.curHp <= 0) {
      playing = false;
      attackLog.innerText += `Player wins!`;
      enemyHP.textContent = 0;
    }
    // Event check when player loses
    if (player.curHp <= 0) {
      // Set to false so you can't click
      playing = false;
      // Update text content
      attackLog.innerText += `You lose! \n`;
      playerHP.textContent = 0;
    }
    // Increase turn count
    turnCounter += 1;
    turnCount.textContent = `Turn Count: ${turnCounter}`;
  }
};

const updateSkillCooldowns = function () {
  // Execution Cooldown
  if (player.execute.skillFlag) {
    // If on cooldown reduce time per attack button click cause this is also base on turns
    player.execute.cdTime--;
  }
  // If cdtime reached 0. Set flag to true again so it can be used again, then reset cdtime to original cd.
  if (player.execute.cdTime === 0) {
    skillFlag = false;
    player.execute.cdTime = player.execute.cd;
  }
  // Bandage num of remaining use
  // If flag is true then if this function is called number of uses will decrease
  if (player.execute.bandage.skillFlag) {
    player.execute.bandage.numRem--;
    // Set flag to false again so it can be used
    player.execute.bandage.skillFlag = false;
  }

  // Clarity Cooldown
  if (player.clarity.skillFlag) {
    player.clarity.cdTime--;
  }
  if (player.clarity.cdTime === 0) {
    player.clarity.skillFlag = false;
    player.clarity.cdTime = player.clarity.cd;
  }
};

// Buttons with events
// Execute
btnSkl1.addEventListener('click', function () {
  exeContainer.style.opacity = 1;
});
// Use button in execute
useModal.addEventListener('click', function () {
  // Turn on CD when this button is click
  if (!player.execute.skillFlag) {
    player.execute.skillFlag = true;
  }
  // Hide modal
  exeContainer.style.opacity = 0;
});

btnSkl2.addEventListener('click', function () {});

// Clarity
btnSkl3.addEventListener('click', function () {
  if (!player.clarity.skillFlag) {
    const debuffRemove = player.debuffs.shift();
    attackLog.innerText += `Use clarity and cured ${
      debuffRemove || 'nothing'
    } \n`;
    player.clarity.skillFlag = true;
  }
});

// Rage skill
btnSkl4.addEventListener('click', function () {
  console.log(player.rage.checkBuffs());
});

// Modal skills
bandageBtn.addEventListener('click', function () {
  if (!player.execute.bandage.skillFlag && player.execute.bandage.numRem > 0) {
    if (player.curHp > 0 && player.curHp < player.maxHP) {
      // Heals the player
      player.curHp += player.execute.bandage.effVal;
      // If heal exceeds maximum hp, current hp will be set to maximum hp
      if (player.curHp > player.maxHP) player.curHp = player.maxHP;
      // Convert to percentage
      playerHpWidth = (player.curHp * 100) / player.maxHP;
      // Update hp bar UI
      playerHpBar.style.width = `${playerHpWidth}%`;
      // Update hp value UI
      playerHP.textContent = player.curHp;
      // Update battle log
      attackLog.innerText += `Use bandage! Heals for ${player.execute.bandage.effVal} HP \n`;
      // Only 1 item per execute skill, this will turn on cooldown
      player.execute.bandage.skillFlag = true;
    }
  }
});

// Normal attack also progress turns and enemy will attack
// This will update battle status such as enemy, player hp, and player skill and item cooldowns
btnAttack.addEventListener('click', function () {
  // Use normal attack
  if (playing) {
    // Players always use normal attack when  this button is pressed
    enemy.curHp -= player.normalAtk();
    attackLog.innerText += `Use attack! ${currentDmg} damage! \n`;
  }
  // Update battle status
  updateBattleStatus();
});

// Execute Window close and open
closeModal.addEventListener('click', function () {
  // Show modal inventory
  exeContainer.style.opacity = 0;
});

// Battle start trigger enemey attack
battleStartTrigger();

// To do //
// Add charge diamond for enemy
// Make a cooldown for skills
// Press button push buffs into an array of buffs
// Check update status if current turn === buffsTurn
// Fix skills
// Auto scroll log
// Make new sprite
// duration while flag is true there is buff? if not remove that value?

// Remove buffs after base on turns [slight done]
// Check current turn [done]
// Add trigger Hp [slight done]
// Add more skills for enemy [slight done]
// Modal for execute skill [done]
// Bandage skill needs number of uses [slight done]
// Clarity coodown [done]
// to do bandage number of uses [done]
