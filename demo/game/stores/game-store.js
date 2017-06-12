import {computed, observable} from 'mobx';
import {FLOOR,ALIEN_FLOOR,FACEHUGGER_FLOOR,EGG_FLOOR, IS_MOBILE} from '../constants';
import * as mobx from "mobx";

class GameStore {
  @observable characterPosition = {x: 300, y: FLOOR};
  @observable characterDirection = 1;
  @observable characterIsAttacking = false;
  @observable characterIsAttackingGrenade = false;
  @observable characterIsCrouching = false;
  @observable characterIsLatched = false;
  @observable stageX = 0;
  @observable heroLoopCount = 0;

  @observable levelCount = 1;
  @observable killCount = 0;

  @observable explosionPositions = [];


  @observable npcPositions = [
     {x: 1300, y: ALIEN_FLOOR},
     {x: 2300, y: ALIEN_FLOOR}
  ];



  @observable faceHuggerPositions = [
    // {x: 1300, y: FACEHUGGER_FLOOR}
  ];

  @observable eggPositions = [
    {x: 2550, y: EGG_FLOOR, hatched:false},
    {x: 2600, y: EGG_FLOOR, hatched:false},
    {x: 2650, y: EGG_FLOOR, hatched:false},
    {x: 2500, y: EGG_FLOOR, hatched:false},
    {x: 2400, y: EGG_FLOOR, hatched:false},
    {x: 2300, y: EGG_FLOOR, hatched:false}
  ];

  @observable queenPositions = [
    {x: 2700, y: 0},
    // {x: 800, y: 0},
  ];

  constructor() {
    mobx.autorun(()=> this.reactToCrouch);

    if(!IS_MOBILE) {
      this.npcPositions = [
        ...this.npcPositions,
        {x: 1000, y: ALIEN_FLOOR}
      ];
    }
  }

  @computed get characterCrouch() {
    return this.characterIsCrouching;
  }

  @computed get reactToCrouch() {
    return console.log('character crouch -> ',this.characterCrouch);
  }

  setCharacterPosition(position) {
    this.characterPosition = position;
  }

  setCharacterDirection(direction) {
    this.characterDirection = direction;
  }

  setCharacterIsAttacking(isAttacking) {
    this.characterIsAttacking = isAttacking;
  }

  setCharacterIsAttackingGrenade(isAttacking) {
    this.characterIsAttackingGrenade = isAttacking;
  }

  setCharacterIsCrouching(isCrouching) {
    this.characterIsCrouching = isCrouching;
  }

  setCharacterLatched(isLatched) {
    this.characterIsLatched = isLatched;
  }

  setNpcPosition(position, index) {
  this.npcPositions[index] = position;
}

  setFaceHuggerPosition(position, index) {
    this.faceHuggerPositions[index] = position;
  }
  setEggPosition(position, index) {
    this.eggPositions[index] = position;
  }

  addFaceHugger(position) {
    this.faceHuggerPositions = [...this.faceHuggerPositions,position];
  }

  removeFaceHugger(npcIndex) {
    const removedFaceHugger = this.faceHuggerPositions.filter((faceHugger,i)=>{
      return i !== npcIndex;
    });
    this.faceHuggerPositions = removedFaceHugger;
  }

  addExplosion(position) {
    this.explosionPositions = [...this.explosionPositions,position];
  }

  removeExplosion(explosionIndex) {
    const removedExplosions = this.explosionPositions.filter((explosion)=>{
      return explosion.npcIndex !== explosionIndex;
    });
    this.explosionPositions = removedExplosions;
  }

  setLevelCount(levelCount) {
    this.levelCount = levelCount;
    this.killCount = 0;
  }

  setStageX(x) {
    if (x > 0) {
      this.stageX = 0;
    } else if (x < -2048) {
      this.stageX = -2048;
    } else {
      this.stageX = x;
    }
  }

  setHeroLoopCount(count) {
    this.heroLoopCount = count;
  }

  setKillCount(count) {
    this.killCount = count;
  }
}

export default new GameStore();




