import { observable } from 'mobx';

const floor = 350;

class GameStore {
  @observable characterPosition = { x: 100, y: floor };
  @observable stageX = 0;
  @observable heroLoopCount = 0;

  @observable npcPositions = [
      { x: 510 , y: floor+20 },
      { x: 620 , y: floor+20 },
      { x: 730 , y: floor+20 },
      { x: 840 , y: floor+20 },
      { x: 950 , y: floor+20 },
      { x: 1060 , y: floor+20 }
  ];

  setCharacterPosition(position) {
    this.characterPosition = position;
  }
  setNpcPosition(position,index) {
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
