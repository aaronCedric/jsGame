'user strict';

let currentDmg = 0;
let currentEnemyDmg = 0;
let turnCounter = 1;
let playing = true;
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
  maxHp: 500,
  curHp: 500,
  attack: 50,
  paradiseLost: function () {
    return (10000 / player.maxHP) * 50;
  },
  phosporus: function () {},
  axionApocalypse: function () {},
  orbitalDarkness: function () {},
  iblis: function () {},
};

const updatePlayerHp = function (enemyDmg) {
  let playerHpWidth = 100;
  player.curHp -= enemyDmg;
  playerHpWidth = (player.curHp * 100) / player.maxHP;
  if (player.curHp <= 0) playerHpWidth = 0;
  playerHpBar.style.width = `${playerHpWidth}%`;
  playerHP.textContent = player.curHp;
};

const updateEnemyHp = function () {
  let enemyHpWidth = 100;
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
  attackLog.innerText = `Enemy used Paradise Lost, dealing ${enemy.paradiseLost()} damage! \n`;
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
  }
};

battleStartTrigger();

btnSkl1.addEventListener('click', function () {
  attackFormula(player.fireBolt);
});

btnSkl2.addEventListener('click', function () {
  attackFormula(player.swipe);
});

btnSkl3.addEventListener('click', function () {});

btnAttack.addEventListener('click', function () {
  turnCounter += 1;
  turnCount.textContent = `Turn Count: ${turnCounter}`;
  attackFormula(player.normalAtk);
});

// To do
// Add charge diamond for enemy
// Make a cooldown for skills
// Add trigger Hp
// Fix skills
// Add more skills for enemy
