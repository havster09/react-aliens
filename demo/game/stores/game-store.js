import {observable} from 'mobx';

export const floor = 350;
export const alienFloor = 370;
export const faceHuggerFloor = 394;

class GameStore {
  @observable characterPosition = {x: 100, y: floor};
  @observable characterDirection = 1;
  @observable characterIsAttacking = false;
  @observable characterIsCrouching = false;

  @observable stageX = 0;
  @observable heroLoopCount = 0;

  @observable npcPositions = [
    {x: 500, y: alienFloor},
    {x: 3000, y: alienFloor},
    {x: 5000, y: alienFloor}
  ];
  
  @observable faceHuggerPositions = [
    {x: 1500, y: faceHuggerFloor}
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

  setCharacterIsCrouching(isCrouching) {
    this.characterIsCrouching = isCrouching;
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
