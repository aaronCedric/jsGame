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

// Triggers
let phospTrig = true;
let axionTrig = true;
let plTrig = true;

// Buff flag
let rageBuff = false;

// hp bar for enemy and player
const enemyHP = document.querySelector('.enemy--hp');
const playerHP = document.querySelector('.player--hp');
const enemyHpBar = document.querySelector('.hp--enemyBar');
const playerHpBar = document.querySelector('.hp--playerBar');

// Execute skill containers and buttons
const exeContainer = document.getElementById('execute--container');
const closeModal = document.querySelector('.btn--closeModal');
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
  inventory: {
    twilCoat: {
      name: 'Twil Coat',
      desc: 'Mitigate 75% damage',
      effVal: 0.75,
    },
    bandage: {
      name: 'Bandage',
      desc: 'Heals moderate amount of HP',
      effVal: 200,
    },
    motDraft: {
      name: 'Motivating Draft',
      desc: 'Increase attack',
      effval: 0.1,
    },
  },
  normalAtk() {
    currentDmg = this.attack + Math.round(Math.random() * 50);
  },
  execute() {},
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
    paradise() {
      return (currentEnemyDmg = (10000 / player.maxHP) * enemy.attack);
    },
  },
  phosporus: {
    name: 'Phosporus',
    phosp() {
      return (currentEnemyDmg = Math.trunc(
        Math.random() * (50 - enemy.attack) + enemy.attack
      ));
    },
  },
  axionApocalypse: {
    name: 'Axion Apocalypse',
    axion() {
      return (currentEnemyDmg = Math.trunc(
        (Math.random() * (70 - enemy.attack) + enemy.attack) * 3
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

// Attacking player and enemy
const attackFormula = function (playerMove) {
  if (playing) {
    if (playerMove === player.normalAtk) {
      player.normalAtk();
      updateEnemyHp();
      attackLog.innerText += `Use attack! ${currentDmg} damage! \n`;
    }
    if (enemy.curHp <= 0) {
      playing = false;
      attackLog.innerText += `Player wins!`;
      enemyHP.textContent = 0;
    }
    if (player.curHp <= 0) {
      playing = false;
      attackLog.innerText += `You lose!`;
      playerHP.textContent = 0;
    }
  }
};

// Checking and updating
const checkEnemyTrigger = function () {
  // Casts Phosporus
  if (playing) {
    if (enemyHpWidth <= 95 && enemyHpWidth >= 86 && phospTrig === true) {
      updatePlayerHp(enemy.phosporus.phosp());
      attackLog.innerText += `${enemy.name} used ${enemy.phosporus.name}, dealing ${currentEnemyDmg} damage! \n`;
      phospTrig = false;
      return true;
    }
    // Casts Axion Apocalypse
    if (enemyHpWidth <= 85 && enemyHpWidth >= 75 && axionTrig === true) {
      updatePlayerHp(enemy.axionApocalypse.axion());
      attackLog.innerText += `${enemy.name} used ${enemy.axionApocalypse.name} dealing ${currentEnemyDmg} damage! \n`;
      axionTrig = false;
      return true;
    }
    // Casts paradise lost
    if (enemyHpWidth <= 10 && enemyHpWidth && plTrig === true) {
      updatePlayerHp(enemy.theEnd());
      attackLog.innerText += `${enemy.name} used ${enemy.paradiseLost.name}, dealing ${currentEnemyDmg} damage!`;
    }
    // Casts the end
    if (turnCounter === 40) {
      updatePlayerHp(enemy.theEnd());
      attackLog.innerText += `${enemy.name} used The End, Game Over! \n`;
      return true;
    } else {
    }
    updatePlayerHp(enemy.normalAttack());
    attackLog.innerText += `${enemy.name} attack, dealing ${currentEnemyDmg} damage! \n`;
  }
};

const checkBuffTime = function () {};

const updateStatus = function () {
  // Increase turn count
  playing ? (turnCounter += 1) : pass;
  turnCount.textContent = `Turn Count: ${turnCounter}`;
  // Reduce or add duration of buffs and debuffs
  checkBuffTime();
  // Check enemy trigger
  checkEnemyTrigger();
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
  player.curHp -= value;
  playerHpWidth = (player.curHp * 100) / player.maxHP;
  if (player.curHp <= 0) playerHpWidth = 0;
  playerHpBar.style.width = `${playerHpWidth}%`;
  playerHP.textContent = player.curHp;
};

// Buttons with events
// Execute
btnSkl1.addEventListener('click', function () {
  exeContainer.style.opacity = '1';
});

btnSkl2.addEventListener('click', function () {});

// Clarity
btnSkl3.addEventListener('click', function () {
  const debuffRemove = player.debuffs.shift();
  attackLog.innerText += `Use clarity and cured ${
    debuffRemove || 'nothing'
  } \n`;
});

// Rage skill
btnSkl4.addEventListener('click', function () {
  console.log(player.rage.checkBuffs());
});

// Normal attack
btnAttack.addEventListener('click', function () {
  attackFormula(player.normalAtk);
  updateStatus();
});

// Execute Window close and open
closeModal.addEventListener('click', function () {
  exeContainer.style.opacity = '0';
});

// Modal skills
bandageBtn.addEventListener('click', function () {
  if (player.curHp > 0 && player.curHp < player.maxHP) {
    // Heals the player
    player.curHp += player.inventory.bandage.effVal;
    // If heal exceeds maximum hp, current hp will be set to maximum hp
    if (player.curHp > player.maxHP) player.curHp = player.maxHP;
    // Convert to percentage
    playerHpWidth = (player.curHp * 100) / player.maxHP;
    // Update hp bar UI
    playerHpBar.style.width = `${playerHpWidth}%`;
    // Update hp value UI
    playerHP.textContent = player.curHp;
    // Update battle log
    attackLog.innerText += `Use bandage! Heals for ${player.inventory.bandage.effVal} HP \n`;
  }
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
