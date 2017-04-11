import {observable} from 'mobx';

export const floor = 350;
export const alienFloor = 370;

class GameStore {
  @observable characterPosition = {x: 100, y: floor};
  @observable characterDirection = 1;
  @observable characterIsAttacking = false;

  @observable stageX = 0;
  @observable heroLoopCount = 0;

  @observable npcPositions = [
    {x: 500, y: alienFloor},
    {x: 3000, y: alienFloor},
    {x: 5000, y: alienFloor},/*
     {x: -500, y: alienFloor},
    {x: 500, y: alienFloor},
    {x: -500, y: alienFloor},
    {x: 500, y: alienFloor},
    {x: 500, y: alienFloor},
    {x: -500, y: alienFloor},
    {x: 500, y: alienFloor},*/
  ];

  setCharacterPosition(position) {
    this.characterPosition = position;
  }

  setCharacterDirection(direction) {
    this.characterDirection = direction;
  }

  setCharacterIsAttacking(isAttacking) {
    this.characterIsAttacking = isAttacking;
  }

  setNpcPosition(position, index) {
    this.npcPositions[index] = position;
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
