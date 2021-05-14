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
  inventory: {
    twilCoat: {
      name: 'Twil Coat',
      desc: 'Mitigate 75% damage',
      effVal: 75,
    },
    bandage: {
      name: 'Bandage',
      desc: 'Heals moderate amount of HP',
      effVal: 200,
    },
    motDraft: {
      name: 'Motivating Draft',
      desc: 'Increase attack',
      effval: 10,
    },
  },
  normalAtk: function () {
    currentDmg = this.attack + Math.round(Math.random() * 50);
  },
  execute: function () {},
  dispel: function () {},
  gravity: function () {},
  fireBolt: function () {
    currentDmg = this.attack + Math.round(Math.random() * 80);
  },
  swipe: function () {
    currentDmg = this.attack + 25 * (Math.trunc(Math.random() * 4) + 1);
  },
};

const enemy = {
  name: 'Lucilius',
  maxHp: 500,
  curHp: 500,
  attack: function () {
    return (currentEnemyDmg = Math.round(Math.random() * 20));
  },
  paradiseLost: function () {
    return (currentEnemyDmg = (10000 / player.maxHP) * 50);
  },
  phosporus: function () {
    return (currentEnemyDmg = (5000 / player.maxHP) * 20);
  },
  axionApocalypse: function () {
    return (currentEnemyDmg = (7000 / player.maxHP) * 30);
  },
  orbitalDarkness: function () {},
  iblis: function () {},
  theEnd: function () {
    return (currentEnemyDmg = 999999);
  },
};

const updatePlayerHp = function (enemyDmg) {
  player.curHp -= enemyDmg;
  playerHpWidth = (player.curHp * 100) / player.maxHP;
  if (player.curHp <= 0) playerHpWidth = 0;
  playerHpBar.style.width = `${playerHpWidth}%`;
  playerHP.textContent = player.curHp;
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

const battleStartTrigger = function () {
  updatePlayerHp(enemy.paradiseLost());
  attackLog.innerText = `${
    enemy.name
  } used Paradise Lost, dealing ${enemy.paradiseLost()} damage! \n`;
};

const checkEnemyTrigger = function () {
  if (enemyHpWidth <= 95 && enemyHpWidth >= 86 && phospTrig === true) {
    updatePlayerHp(enemy.phosporus());
    attackLog.innerText += `${
      enemy.name
    } used Phosporus, dealing ${enemy.phosporus()} damage! \n`;
    phospTrig = false;
    return true;
  }
  if (enemyHpWidth <= 85 && enemyHpWidth >= 75 && axionTrig === true) {
    updatePlayerHp(enemy.axionApocalypse());
    attackLog.innerText += `${
      enemy.name
    } used Axion Apocalypse, dealing ${enemy.axionApocalypse()} damage! \n`;
    axionTrig = false;
    return true;
  }

  if (turnCounter === 40) {
    updatePlayerHp(enemy.theEnd());
    attackLog.innerText += `${enemy.name} used The End, Game Over! \n`;
    return true;
  }
};

const enemyAttack = function () {
  updatePlayerHp(enemy.attack());
  attackLog.innerText += `${enemy.name} attack, dealing ${currentEnemyDmg} \n`;
};

const updateTurnCount = function () {
  playing ? (turnCounter += 1) : pass;
  checkEnemyTrigger() || enemyAttack();
  turnCount.textContent = `Turn Count: ${turnCounter}`;
};

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

battleStartTrigger();

btnSkl1.addEventListener('click', function () {
  updateTurnCount();
  attackFormula(player.fireBolt);
});

btnSkl2.addEventListener('click', function () {
  updateTurnCount();
  attackFormula(player.swipe);
});

btnSkl3.addEventListener('click', function () {});

btnAttack.addEventListener('click', function () {
  attackFormula(player.normalAtk);
  updateTurnCount();
});

// To do //
// Add charge diamond for enemy
// Make a cooldown for skills
// Add trigger Hp [sligh done]
// Fix skills
// Add more skills for enemy [slight done]
// Auto scroll log
// Make new sprite
// Modal for execute skill
