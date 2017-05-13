import {computed, observable} from 'mobx';
import {FLOOR,ALIEN_FLOOR,FACEHUGGER_FLOOR,EGG_FLOOR} from '../constants';
import * as mobx from "mobx";

class GameStore {
  @observable characterPosition = {x: 300, y: FLOOR};
  @observable characterDirection = 1;
  @observable characterIsAttacking = false;
  @observable characterIsCrouching = false;
  @observable characterIsLatched = false;
  @observable stageX = 0;
  @observable heroLoopCount = 0;

  @observable levelCount = 0;
  @observable killCount = 0;

  @observable npcPositions = [
    {x: 900, y: ALIEN_FLOOR}
  ];

  @observable faceHuggerPositions = [];

  @observable eggPositions = [
    {x: 800, y: EGG_FLOOR, hatched:false}
  ];

  constructor() {
    mobx.autorun(()=> this.reactToCrouch);
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



