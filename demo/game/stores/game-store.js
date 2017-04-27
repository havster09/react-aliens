import {computed, observable} from 'mobx';
import {floor,alienFloor,faceHuggerFloor,eggFloor} from '../constants';
import * as mobx from "mobx";

class GameStore {
  @observable characterPosition = {x: 300, y: floor};
  @observable characterDirection = 1;
  @observable characterIsAttacking = false;
  @observable characterIsCrouching = false;
  @observable characterIsLatched = false;
  @observable stageX = 0;
  @observable heroLoopCount = 0;

  @observable npcPositions = [
   /* {x: 500, y: alienFloor},
    {x: 500, y: alienFloor},*/
  ];

  // todo add new item to arrays

  @observable faceHuggerPositions = [
    /*{x: 600, y: faceHuggerFloor},
    {x: 550, y: faceHuggerFloor}*/
  ];

  @observable eggPositions = [
    {x: 800, y: eggFloor, hatched:false},
    {x: 150, y: eggFloor, hatched:false},
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
}

export default new GameStore();
