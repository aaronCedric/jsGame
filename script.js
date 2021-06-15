'user strict';

// Damage tracker for player. enemy, and item holding
let currentDmg = 0;
let currentEnemyDmg = 0;
let currentItem = {};

// Turn count for trigger end
let turnCounter = 1;

// Still playing?
let playing = true;

// hp bar for enemy and player
const enemyHP = document.querySelector('.enemy--hp');
const playerHP = document.querySelector('.player--hp');
const enemyHpBar = document.querySelector('.hp--enemyBar');
const playerHpBar = document.querySelector('.hp--playerBar');

// Execute skill containers and buttons
const exeContainer = document.querySelector('.execute--container');
const itemName = document.querySelector('.item--name');
const itemDesc = document.querySelector('.item--description');
const closeModal = document.querySelector('.btn--closeModal');
const useModal = document.querySelector('.btn--useItem');
const executeBtn = document.querySelector('.modal--buttons');
const executeSet = document.querySelectorAll('.modal--btn');
const nameDescription = document.querySelectorAll('.name--description');
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
  playerHpWidth: 100,
  attack: 20,
  buffs: [],
  debuffs: ['Poison', 'Petrify', 'Def down'],
  execute: {
    name: 'Execute',
    desc: 'Choose an item to help you aid in battle',
    cd: 1,
    cdTime: 1,
    skillFlag: false,
    twilCoat: {
      name: 'Twil Coat',
      desc: 'Mitigate 90% damage',
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
      skillFlag: false,
      numUse: 20,
      numRem: 20,
      effval: 0.25,
    },
  },
  clarity: {
    name: 'Clarity',
    desc: 'Removes 1 debuff',
    skillFlag: false,
    cd: 5,
    cdTime: 5,
  },
  rage: {
    name: 'Rage',
    desc: 'Grants 25% attack up for 3 turns',
    skillFlag: false,
    cd: 7,
    cdTime: 7,
    origDur: 3,
    duration: 3,
    effVal: 0.25,
  },
  normalAtk() {
    return (currentDmg = Math.trunc(this.attack + Math.random() * 10));
  },
};

const buffSkills = {
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
  enemyHpWidth: 100,
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

const updateSkillCooldowns = function () {
  // Execution Cooldown
  if (player.execute.skillFlag) {
    // If on cooldown reduce time per attack button click cause this is also base on turns
    player.execute.cdTime--;
  }
  // If cdtime reached 0. Set flag to true so it can be used again, then reset cdtime to original cd.
  if (player.execute.cdTime === 0) {
    player.execute.cdTime = player.execute.cd;
    player.execute.skillFlag = false;
  }
  // Bandage num of remaining use
  // If flag is true then if this function is called number of uses will decrease
  if (player.execute.bandage.skillFlag || player.execute.bandage.numRem === 0) {
    player.execute.bandage.numRem--;
    // Set flag to false again so it can be used
    player.execute.bandage.skillFlag = false;
    // Also remove class to turn off current item
    bandageBtn.classList.remove('currentItem');
  }
  // Twil coat same as above
  if (
    player.execute.twilCoat.skillFlag ||
    player.execute.twilCoat.numRem === 0
  ) {
    player.execute.twilCoat.numRem--;
    player.execute.twilCoat.skillFlag = false;
    twilBtn.classList.remove('currentItem');
  }

  // Clarity Cooldown
  if (player.clarity.skillFlag) {
    player.clarity.cdTime--;
  }
  if (player.clarity.cdTime === 0) {
    player.clarity.skillFlag = false;
    player.clarity.cdTime = player.clarity.cd;
  }

  // Rage Cooldown
  if (player.rage.skillFlag) {
    player.rage.cdTime--;
  }
  if (player.rage.cdTime === 0) {
    player.rage.skillFlag = false;
    player.rage.cdTime = player.rage.cd;
  }
  // If duration = 0 buff will end
  if (player.rage.duration === 0) {
    // Remove buff on the array
    player.buffs.shift();
    // Reset attack and duration to original
    player.attack = 20;
    player.rage.duration = player.rage.origDur;
  }
  // Find buffs in the array
  if (player.buffs.some(cur => cur.name === 'Rage')) {
    // If found reduce buff duration
    player.rage.duration--;
    // If found add attack
    player.attack = player.attack * (1 + player.rage.effVal);
  }
};

// Update execution description UI
const updateExecute = function (item) {
  // Condition if item has something inside
  if (Object.keys(item).length !== 0) {
    // Change text content base on the item
    itemName.textContent = item.name;
    itemDesc.textContent = item.desc;
  } else if (Object.keys(item).length === 0) {
    itemName.textContent = 'Execute';
    itemDesc.textContent = 'Use an item to aid you in battle';
  }
};

// Checking and updating enemy triggers
const checkEnemyTrigger = function () {
  if (playing) {
    // Enemy battle triggers
    if (
      enemy.enemyHpWidth <= 95 &&
      enemy.enemyHpWidth >= 86 &&
      enemy.phosporus.skillFlag === false
    ) {
      // Casts Phosporus
      updatePlayerHp(enemy.phosporus.phosp());
      attackLog.innerText += `${enemy.name} used ${enemy.phosporus.name}, dealing ${currentEnemyDmg} damage! \n`;
      enemy.phosporus.skillFlag = true;
    } else if (
      enemy.enemyHpWidth <= 85 &&
      enemy.enemyHpWidth >= 75 &&
      enemy.axionApocalypse.skillFlag === false
    ) {
      // Casts Axion Apocalypse
      updatePlayerHp(enemy.axionApocalypse.axion());
      attackLog.innerText += `${enemy.name} used ${enemy.axionApocalypse.name} dealing ${currentEnemyDmg} damage! \n`;
      enemy.axionApocalypse.skillFlag = true;
    } else if (
      enemy.enemyHpWidth <= 10 &&
      enemy.enemyHpWidth >= 5 &&
      enemy.paradiseLost.skillFlag === false
    ) {
      // Casts paradise lost
      updatePlayerHp(enemy.theEnd());
      attackLog.innerText += `${enemy.name} used ${enemy.paradiseLost.name}, dealing ${currentEnemyDmg} damage! \n`;
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

const useCurrentItem = function (item) {
  // Item here is the current item and it's an object
  if (playing) {
    if (item.name === 'Bandage') {
      // If not in cooldown and have remaining use do the heal
      if (!item.skillFlag && item.numRem > 0) {
        if (player.curHp > 0 && player.curHp < player.maxHP) {
          // Heals the player
          player.curHp += item.effVal;
          // If heal exceeds maximum hp, current hp will be set to maximum hp
          if (player.curHp > player.maxHP) player.curHp = player.maxHP;
          // Convert to percentage
          player.playerHpWidth = (player.curHp * 100) / player.maxHP;
          // Update hp bar UI
          playerHpBar.style.width = `${player.playerHpWidth}%`;
          // Update hp value UI
          playerHP.textContent = player.curHp;
          // Update battle log
          attackLog.innerText += `Use bandage! Heals for ${item.effVal} HP \n`;
        }
      }
    }
    if (item.name === 'Twil Coat') {
      if (!item.skillFlag && item.numRem > 0) {
        console.log('Def');
      }
    }
    // Only 1 item per execute skill, this will turn on cooldown
    item.skillFlag = true;
  }
};

const updatePlayerHp = function (value) {
  // Enemy attacks every turn
  player.curHp -= value;
  // Formula to calculate width for CSS width percentage
  player.playerHpWidth = (player.curHp * 100) / player.maxHP;
  // Set hp to 0 if current hp is less than 0
  if (player.curHp <= 0) player.playerHpWidth = 0;
  // Update HP bar
  playerHpBar.style.width = `${player.playerHpWidth}%`;
  playerHP.textContent = player.curHp;
};

const updateEnemyHp = function () {
  // width = (enemy.hp*100)/(enemy.maxHP)
  // Damage to current hp
  enemy.curHp -= currentDmg;
  // Get width with this formula
  enemy.enemyHpWidth = (enemy.curHp * 100) / enemy.maxHp;
  // Update UI with the new width
  if (enemy.curHp <= 0) enemy.enemyHpWidth = 0;
  enemyHpBar.style.width = `${enemy.enemyHpWidth}%`;
  // Update HP text
  enemyHP.textContent = enemy.curHp;
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
    // Reset current item
    currentItem = {};
  }
};

// Buttons with events
// Execute
btnSkl1.addEventListener('click', function () {
  // If game is still running and execute cooldown if off show the inventory
  if (playing && !player.execute.skillFlag) {
    // Show inventory
    exeContainer.classList.remove('hidden');
  }
  updateExecute(currentItem);
});

// Use button in execute
useModal.addEventListener('click', function () {
  // Use current Item
  useCurrentItem(currentItem);
  // Hide modal
  exeContainer.classList.add('hidden');
  // Turn on CD
  player.execute.skillFlag = true;
});

// Execute Window close and open
closeModal.addEventListener('click', () =>
  // Close inventory
  exeContainer.classList.add('hidden')
);

// Dispel
btnSkl2.addEventListener('click', function () {});

// Clarity
btnSkl3.addEventListener('click', function () {
  if (playing && !player.clarity.skillFlag) {
    // Store debuff that will be remove so it can be log
    const debuffRemove = player.debuffs.shift();
    // Short circuit for output
    attackLog.innerText += `Use clarity and cured ${
      debuffRemove || 'nothing'
    } \n`;
    // Turn on clarity skill cooldown
    player.clarity.skillFlag = true;
  }
});

// Rage skill
btnSkl4.addEventListener('click', function () {
  if (playing && !player.rage.skillFlag) {
    player.buffs.push(player.rage);
    player.rage.skillFlag = true;
  }
});

// Modal skills

executeBtn.addEventListener('click', function (e) {
  const clicked = e.target.closest('.modal--btn');
  if (!clicked) return;
  executeSet.forEach(el => {
    el.classList.remove('currentItem');
  });
  nameDescription.forEach(el => {
    el.classList.remove('name--description--active');
  });

  clicked.classList.add('currentItem');
  document
    .querySelector(`.name--description--${clicked.dataset.num}`)
    .classList.add('name--description--active');

  // console.log(player.execute.clicked.dataset.item);
});

// Bandage
bandageBtn.addEventListener('click', function () {
  currentItem = player.execute.bandage;
});
// Twil Coat
twilBtn.addEventListener('click', function () {
  currentItem = player.execute.twilCoat;
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

// Battle start trigger enemey attack
battleStartTrigger();

// To do //
// Add charge diamond for enemy
// Auto scroll log
// Make new sprite
// Make skill art

// Remove buffs after base on turns [done]
// Check current turn [done]
// Add trigger Hp [done]
// Add more skills for enemy [done]
// Modal for execute skill [done]
// Bandage skill needs number of uses [done]
// Clarity cooldown [done]
// to do bandage number of uses [done]
// Rage skill added [done]

////////////////////// Fix number of use
