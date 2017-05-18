import React, {Component, PropTypes} from 'react';
import {observer} from 'mobx-react';
import {KILL_THRESHOLD} from './constants';

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
    onGrenadeLaunch: PropTypes.func,
    onReload: PropTypes.func,
    onReloadGrenade: PropTypes.func,
    store: PropTypes.object,
    hitCount: PropTypes.number,
    mobileControlsShoot: PropTypes.bool,
    mobileControlsDirection: PropTypes.array
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
    if(!store.characterIsAttacking && this.state.characterState!==4 && this.state.characterState!==9) {
      store.setCharacterPosition({x: store.characterPosition.x + x, y: store.characterPosition.y});
    }
    this.setState({
      ticksPerFrame: 5
    });
  };

  jump = (body) => {
    const {store} = this.props;
    this.isJumping = true;
    store.setCharacterPosition({x: store.characterPosition.x, y: store.characterPosition.y + 3});
  };

  crouch = (body) => {
    const {store} = this.props;
    this.isCrouching = true;
    let direction = this.lastDirection > 0 ? -1 : 1;
    this.setState({
      characterState: 9,
      direction,
      repeat: true
    });
    store.setCharacterIsCrouching(true);
  };

  shoot = () => {
    const {store} = this.props;
    this.isShooting = true;
    let direction = store.characterDirection;
    let characterState = this.isCrouching?8:3;
    if (this.props.ammo > 0) {
      if(this.state.contextLoop%4===2) {
        this.pulseRifleSound.play({loop: false, offset: 0, volume: 0.35});
      }
      this.props.onShoot();
      this.setState({
        characterState,
        direction,
        ticksPerFrame: 5,
        repeat: true
      });
      this.props.store.setCharacterIsAttacking(true);
    }
    else {
      this.reload();
    }
  };

  grenadeLaunch = () => {
    const {store} = this.props;
    this.isGrenadeLaunching = true;
    let direction = store.characterDirection;
    let characterState = 11;
    if (this.props.grenadeAmmo > 0) {
      this.props.onGrenadeLaunch();
      this.setState({
        characterState,
        direction,
        ticksPerFrame: 20,
        repeat: false
      });
      this.props.store.setCharacterIsAttacking(true);
    }
    else {
      this.setState({
        grenadeTimeStamp: null
      });
      this.reloadGrenade();
    }
  };

  reload = () => {
    if (!this.state.reloadTimeStamp) {
      this.pulseRifleReloadSound.play();
      this.setState({
        reloadTimeStamp: this.state.contextLoop,
        ticksPerFrame: 10
      });
    }
    let direction = this.lastDirection > 0 ? -1 : 1;
    this.setState({
      characterState: 4,
      direction,
      ticksPerFrame: 5,
      repeat: false
    });
    this.props.store.setCharacterIsAttacking(false);
    if (this.state.reloadTimeStamp) {
      if (this.state.contextLoop > this.state.reloadTimeStamp + 50) {
        this.props.onReload();
        this.setState({
          reloadTimeStamp: null
        });
      }
    }
  };

  reloadGrenade = () => {
    if (!this.state.reloadTimeStamp) {
      this.pulseRifleReloadSound.play();
      this.setState({
        reloadTimeStamp: this.state.contextLoop,
        ticksPerFrame: 10
      });
    }
    let direction = this.lastDirection > 0 ? -1 : 1;
    this.setState({
      characterState: 4,
      direction,
      ticksPerFrame: 5,
      repeat: false
    });
    this.props.store.setCharacterIsAttacking(false);
    if (this.state.reloadTimeStamp) {
      if (this.state.contextLoop > this.state.reloadTimeStamp + 10) {
        this.props.onReloadGrenade();
        this.setState({
          reloadTimeStamp: null
        });
      }
    }
  };

  latch = () => {
    if (!this.state.latchTimeStamp) {
      this.setState({
        latchTimeStamp: this.state.contextLoop,
        ticksPerFrame: 10
      });
    }
    this.setState({
      characterState: 10,
      ticksPerFrame: 5,
      repeat: true
    });
    this.props.store.setCharacterIsAttacking(false);
    if (this.state.latchTimeStamp) {
      if (this.state.contextLoop > this.state.latchTimeStamp + 100) {
        this.props.store.setCharacterLatched(false);
        // kill faceHugger
        this.setState({
          latchTimeStamp: null
        });
        return this.stop();
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


  hit = () => {
    const {store} = this.props;

    let characterState = this.props.hitCount % 2 > 0 ? 5 : 6;
    let direction = this.lastDirection > 0 ? -1 : 1;

    store.npcPositions.forEach((alien)=> {
      if(store.characterPosition.x < alien.x && direction < 0 || store.characterPosition.x > alien.x && direction > 0) {
        characterState = 7;
      }
    });


    this.setState({
      characterState,
      ticksPerFrame: 12,
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
  };

  enterBuilding = (body) => {
    const {store} = this.props;
    this.setState({
      direction:store.characterDirection,
      characterState: 2,
    });
    this.isLeaving = true;
   /*
    const doorIndex = this.getDoorIndex(0);
   if (doorIndex !== null) {
      this.props.onEnterBuilding(doorIndex);
    }*/
  };

  roundClear = () => {
    // todo add check for all aliens to be npcState dead
    const {store} = this.props;
    console.log(store.characterPosition.x);
    if(store.levelCount === 4) {
      store.setLevelCount(0);
    }
    else {
      store.setLevelCount(store.levelCount + 1);
    }

    this.enterBuilding(this.body);
    this.props.onEnterBuilding(0);
  };

  checkKeys = (shouldMoveStageLeft, shouldMoveStageRight) => {
    const {keys, store} = this.props;

    let characterState = 2;
    let direction = this.lastDirection > 0 ? -1 : 1;

    if (keys.isDown(65)) {
      return this.reload();
    }

    if (keys.isDown(keys.SPACE)) {
      //  this.jump(this.body);
    }

    if (keys.isDown(keys.UP)) {
      console.log(store.characterPosition.x);
      this.enterBuilding(this.body);
      this.props.onEnterBuilding(0);
      // return this.enterBuilding(this.body);
    }

    if ((keys.isDown(keys.LEFT) || this.props.mobileControlsDirection[0]==='left')&& store.characterPosition.x > -39) {
      if (shouldMoveStageLeft) {
        store.setStageX(store.stageX + 3);
      }
      direction = -1;
      store.setCharacterDirection(direction);
      this.move(this.body, -3);
      characterState = 1;
    } else if ((keys.isDown(keys.RIGHT)  || this.props.mobileControlsDirection[0]==='right') && store.characterPosition.x < 2952) {
      if (shouldMoveStageRight) {
        store.setStageX(store.stageX - 3);
      }
      characterState = 0;
      direction = 1;
      store.setCharacterDirection(direction);
      this.move(this.body, 3);
    }

    if (keys.isDown(keys.D_KEY)) {
      return this.grenadeLaunch();
    }

    if (keys.isDown(keys.S_KEY) || this.props.mobileControlsShoot) {
      if (keys.isUp(keys.DOWN)) {
        this.isCrouching = false;
        store.setCharacterIsCrouching(false);
      }
      if (keys.isDown(keys.DOWN) || this.props.mobileControlsDirection[1]==='down') {
        this.isCrouching = true;
        store.setCharacterIsCrouching(true);
      }
      return this.shoot();
    }
    else {
      const {store} = this.props;
      store.setCharacterIsAttacking(false);
      if(store.killCount >= KILL_THRESHOLD) {
        return this.roundClear();
      }
    }

    if (keys.isDown(keys.DOWN) || this.props.mobileControlsDirection[1]==='down' ) {
      return this.crouch(this.body);
    }
    else {
      if(store.characterIsCrouching) {
        this.isCrouching = false;
        store.setCharacterIsCrouching(false);
      }
    }

    this.setState({
      characterState,
      direction:characterState!==4?direction:this.lastDirection,
      repeat: characterState < 2,
    });
  };

  loop = () => {
    const {store, isHit} = this.props;
    if (store.characterIsLatched) {
      return this.latch();
    }

    if (isHit && !this.isHit) {
      return this.hit();
    }

    const midPoint = Math.abs(store.stageX) + 360;

    const shouldMoveStageLeft = store.characterPosition.x < midPoint && store.stageX < 0;
    const shouldMoveStageRight = store.characterPosition.x > midPoint && store.stageX > -2048;


    if (!this.isJumping && !this.isPunching && !this.isLeaving && !this.isHit) {
      this.checkKeys(shouldMoveStageLeft, shouldMoveStageRight);
      store.setCharacterPosition(store.characterPosition);
    } else {
      if (this.isPunching && this.state.spritePlaying === false) {
        this.isPunching = false;
      }

      if (this.isShooting && this.state.spritePlaying === false) {
        this.isShooting = false;
      }

      if (this.isGrenadeLaunching && this.state.spritePlaying === false) {
        this.isGrenadeLaunching = false;
      }

      if (this.isHit && this.state.spritePlaying === false) {
        this.isHit = false;
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
    this.isCrouch = false;
    this.isPunching = false;
    this.isShooting = false;
    this.isGrenadeLaunching = false;
    this.isHit = false;
    this.isLeaving = false;
    this.lastX = 0;

    this.state = {
      characterState: 2,
      hitCount: 0,
      loop: false,
      spritePlaying: true,
      ticksPerFrame: 5,
      contextLoop: null
    };
  }

  componentDidMount() {
    this.pulseRifleSound = new AudioPlayer('assets/se/m41.wav');
    this.pulseRifleReloadSound = new AudioPlayer('assets/se/mgbolt.ogg');
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
    return (
      <div style={this.getWrapperStyles()}>
        <Sprite
          ref={(sprite)=>{
              this.body=sprite
            }
          }
          repeat={this.state.repeat}
          onPlayStateChanged={this.handlePlayStateChanged}
          onGetContextLoop={this.getContextLoop}
          src="assets/corporal.png"
          scale={this.context.scale * 1}
          direction={this.props.store.characterDirection}
          state={this.state.characterState}
          steps={[
            7, // 0
            7,
            0, // 2 idle
            1, // 3 shoot
            0, // 4 reload
            1, // 5 hit 1
            1, // 6 hit 2
            1, // 7 hit behind
            1, // 8 crouch shoot
            0, // 9 crouch
            7, // 10 latch
            2  // 11 grenade launch
            ]}
          offset={[0,0]}
          tileWidth={160}
          tileHeight={120}
          ticksPerFrame={this.state.ticksPerFrame}
          transformOrigin="left top"
        />
        {this.props.store.characterIsAttacking &&
          <Sprite
            repeat={this.state.repeat}
            src={this.state.characterState === 8 ? "assets/pulse_rifle_crouch_shoot.png" : "assets/pulse_rifle_shoot.png"}
            scale={this.context.scale * 1}
            direction={this.state.direction}
            steps={[3]}
            offset={[0, 0]}
            tileWidth={160}
            tileHeight={120}
            ticksPerFrame={3}
            top={-120}
            left={0}
            display={this.state.characterState !== 3 && this.state.characterState !== 8 ? "none" : "block"}
          />
        }
      </div>
    );
  }
}
