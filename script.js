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

// hp bar for enemy and player
const enemyHP = document.querySelector('.enemy--hp');
const playerHP = document.querySelector('.player--hp');
const enemyHpBar = document.querySelector('.hp--enemyBar');
const playerHpBar = document.querySelector('.hp--playerBar');

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
  debuffs: [],
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
  rage() {
    let buffValue = this.attack * buffSkills.attackUp.effVal;
    return buffValue;
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
    } else if (playerMove === player.fireBolt) {
      player.fireBolt();
      updateEnemyHp();
      attackLog.innerText += `Use fire bolt! ${currentDmg} damage! \n`;
    } else if (playerMove === player.swipe) {
      player.swipe();
      updateEnemyHp();
      attackLog.innerText += `Use swipe! ${currentDmg} damage! \n`;
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

const enemyAttack = function () {
  updatePlayerHp(enemy.normalAttack());
  attackLog.innerText += `${enemy.name} attack, dealing ${currentEnemyDmg} damage! \n`;
};

// Checking and updating
const checkEnemyTrigger = function () {
  // Casts Phosporus
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
  }
};

const updateStatus = function () {
  // Reduce duration of buffs and debuffs

  // Increase turn count
  playing ? (turnCounter += 1) : pass;
  checkEnemyTrigger() || enemyAttack();
  turnCount.textContent = `Turn Count: ${turnCounter}`;
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

const updatePlayerHp = function (enemyDmg) {
  player.curHp -= enemyDmg;
  playerHpWidth = (player.curHp * 100) / player.maxHP;
  if (player.curHp <= 0) playerHpWidth = 0;
  playerHpBar.style.width = `${playerHpWidth}%`;
  playerHP.textContent = player.curHp;
};

// Buttons with events
btnSkl1.addEventListener('click', function () {});

btnSkl2.addEventListener('click', function () {});

btnSkl3.addEventListener('click', function () {});

// Rage skill
btnSkl4.addEventListener('click', function () {});

// Normal attack
btnAttack.addEventListener('click', function () {
  attackFormula(player.normalAtk);
  updateStatus();
});

// Battle start trigger enemey attack
battleStartTrigger();

// To do //
// Add charge diamond for enemy
// Make a cooldown for skills
// Press button push buffs into an array of buffs
// Check current turn
// Check update status if current turn === buffsTurn

// Add trigger Hp [sligh done]
// Fix skills
// Add more skills for enemy [slight done]
// Auto scroll log
// Make new sprite
// Modal for execute skill
// Reove buffs after base on turns

// duration while flag is true there is buff? if not remove that value?
