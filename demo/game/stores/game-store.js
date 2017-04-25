import {computed, observable} from 'mobx';
import {floor,alienFloor,faceHuggerFloor,eggFloor} from '../constants';
import * as mobx from "mobx";

class GameStore {
  @observable characterPosition = {x: 100, y: floor};
  @observable characterDirection = 1;
  @observable characterIsAttacking = false;
  @observable characterIsCrouching = false;
  @observable characterIsLatched = false;
  @observable stageX = 0;
  @observable heroLoopCount = 0;

  @observable npcPositions = [
    {x: 500, y: alienFloor},
    {x: 500, y: alienFloor},
  ];

  @observable faceHuggerPositions = [
    {x: 500, y: faceHuggerFloor},
    {x: 500, y: faceHuggerFloor},
  ];

  @observable eggPositions = [
    {x: 500, y: eggFloor},
    {x: 100, y: eggFloor},
    {x: 150, y: eggFloor},
    {x: 650, y: eggFloor},
    {x: 700, y: eggFloor},
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
