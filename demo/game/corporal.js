import React, {Component, PropTypes} from 'react';
import {observer} from 'mobx-react';
import Matter from 'matter-js';

import {
  AudioPlayer,
  Sprite,
} from '../../src';

@observer
export default class Corporal extends Component {

  static propTypes = {
    keys: PropTypes.object,
    onEnterBuilding: PropTypes.func,
    onShoot: PropTypes.func,
    onReload: PropTypes.func,
    store: PropTypes.object,
  };

  static contextTypes = {
    loop: PropTypes.object,
    engine: PropTypes.object,
    scale: PropTypes.number,
  };

  handlePlayStateChanged = (state) => {
    this.setState({
      spritePlaying: state ? true : false
    });
  };

  getContextLoop = (contextLoop) => {
    const {store} = this.props;
    store.setHeroLoopCount(contextLoop);
    this.setState({
      contextLoop: contextLoop
    });
  };

  move = (body, x) => {
    const {store} = this.props;
    this.lastDirection = (x < 0 && Math.abs(x) > 2) ? 1 : 0;
    store.setCharacterPosition({x:store.characterPosition.x + x,y:store.characterPosition.y});
  };

  jump = (body) => {
    const {store} = this.props;
    this.jumpNoise.play();
    this.isJumping = true;
    store.setCharacterPosition({x:store.characterPosition.x,y:store.characterPosition.y+3});
  };

  shoot = () => {
    this.isShooting = true;
    let direction = this.lastDirection > 0 ? -1 : 1;
    if (this.props.ammo > 0) {
      this.props.onShoot();
      this.setState({
        characterState: 3,
        direction,
        repeat: true
      });
    }
    else {
      this.reload();
    }
  };

  reload = () => {
    if (!this.state.reloadTimeStamp) {
      this.setState({
        reloadTimeStamp: this.state.contextLoop
      });
    }
    let direction = this.lastDirection > 0 ? -1 : 1;
    this.setState({
      characterState: 4,
      direction,
      repeat: false
    });

    if (this.state.reloadTimeStamp) {
      if (this.state.contextLoop > this.state.reloadTimeStamp + 50) {
        this.props.onReload();
        this.setState({
          reloadTimeStamp: null
        });
      }
    }
  };

  stop = () => {
    let direction = this.lastDirection > 0 ? -1 : 1;
    this.setState({
      characterState: 2,
      direction,
      repeat: false
    });
  };

  getDoorIndex = (body) => {
    let doorIndex = null;

    const doorPositions = [...Array(6).keys()].map((a) => {
      return [(512 * a) + 208, (512 * a) + 272];
    });

    doorPositions.forEach((dp, di) => {
      if (body.position.x + 64 > dp[0] && body.position.x + 64 < dp[1]) {
        doorIndex = di;
      }
    });

    return doorIndex;
  }

  enterBuilding = (body) => {
    const doorIndex = this.getDoorIndex(body);

    if (doorIndex !== null) {
      this.setState({
        characterState: 3,
      });
      this.isLeaving = true;
      this.props.onEnterBuilding(doorIndex);
    }
  };

  checkKeys = (shouldMoveStageLeft, shouldMoveStageRight) => {
    const {keys, store} = this.props;

    let characterState = 2;
    let direction = this.lastDirection > 0 ? -1 : 1;

    if (keys.isDown(83)) {
      return this.shoot();
    }

    if (keys.isDown(65)) {
      return this.stop();
    }

    if (keys.isDown(keys.SPACE)) {
      // this.jump(this.body);
    }

    if (keys.isDown(keys.UP)) {
      return this.enterBuilding(this.body);
    }

    if (keys.isDown(keys.LEFT)) {
      if (shouldMoveStageLeft) {
        store.setStageX(store.stageX + 4);
      }
      direction = -1;
      this.move(this.body, -3);
      characterState = 1;
    } else if (keys.isDown(keys.RIGHT)) {
      if (shouldMoveStageRight) {
        store.setStageX(store.stageX - 4);
      }
      characterState = 0;
      direction = 1;
      this.move(this.body, 3);
    }

    // console.log(characterState);

    this.setState({
      characterState,
      direction,
      repeat: characterState < 2,
    });
  };

  loop = () => {
    const {store} = this.props;
    const midPoint = Math.abs(store.stageX) + 360;

    const shouldMoveStageLeft = store.characterPosition.x < midPoint && store.stageX < 0;
    const shouldMoveStageRight = store.characterPosition.x > midPoint && store.stageX > -2048;


    if (!this.isJumping && !this.isPunching && !this.isLeaving) {
      this.checkKeys(shouldMoveStageLeft, shouldMoveStageRight);
      store.setCharacterPosition(store.characterPosition);
    } else {
      if (this.isPunching && this.state.spritePlaying === false) {
        this.isPunching = false;
      }

      if (this.isShooting && this.state.spritePlaying === false) {
        this.isShooting = false;
      }

      const targetX = store.stageX + (this.lastX - store.characterPosition.x);
      if (shouldMoveStageLeft || shouldMoveStageRight) {
        store.setStageX(targetX);
      }
    }

    this.lastX = store.characterPosition.x;
  };

  constructor(props) {
    super(props);

    this.loopID = null;
    this.isJumping = false;
    this.isPunching = false;
    this.isShooting = false;
    this.isLeaving = false;
    this.lastX = 0;

    this.state = {
      characterState: 2,
      loop: false,
      spritePlaying: true,
      ticksPerFrame: 5,
      contextLoop: null
    };
  }

  componentDidMount() {
    this.jumpNoise = new AudioPlayer('/assets/jump.wav');
    this.loopID = this.context.loop.subscribe(this.loop);
  }

  componentWillUnmount() {
    this.context.loop.unsubscribe(this.loopID);
  }

  getWrapperStyles() {
    const {characterPosition, stageX} = this.props.store;
    const {scale} = this.context;
    const {x, y} = characterPosition;
    const targetX = x + stageX;

    return {
      position: 'absolute',
      transform: `translate(${targetX * scale}px, ${y * scale}px)`,
      transformOrigin: 'left top',
    };
  }

  render() {
    const x = this.props.store.characterPosition.x;

    return (
      <div style={this.getWrapperStyles()}>
        <Sprite
          ref={(sprite)=>{this.body=sprite}}
          repeat={this.state.repeat}
          onPlayStateChanged={this.handlePlayStateChanged}
          onGetContextLoop={this.getContextLoop}
          src="assets/corporal.png"
          scale={this.context.scale * 1}
          direction={this.state.direction}
          state={this.state.characterState}
          steps={[7,7,0,1,0]}
          offset={[0,0]}
          tileWidth={160}
          tileHeight={120}
          ticksPerFrame={this.state.ticksPerFrame}
        />
        <Sprite
          repeat={this.state.repeat}
          src="assets/pulse_rifle_shoot.png"
          scale={this.context.scale * 1}
          direction={this.state.direction}
          steps={[3]}
          offset={[0,0]}
          tileWidth={160}
          tileHeight={120}
          ticksPerFrame={3}
          top={-120}
          display={this.state.characterState!==3?"none":"block"}
        />
      </div>
    );
  }
}
