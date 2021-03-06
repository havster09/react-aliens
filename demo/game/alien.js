import React, {PropTypes} from 'react';
import Npc from "./npc"
import {observer} from 'mobx-react';
import {ALIEN_FLOOR, KILL_THRESHOLD, RESPAWN_DISTANCE} from './constants';
import {getAmbushHeight} from './helpers/ambushHeight';
import Explosion from './explosion';

import {
  AudioPlayer,
  Body,
  Sprite,
} from '../../src';


@observer
export default class Alien extends Npc {
  static propTypes = {
    npcIndex: PropTypes.number,
    keys: PropTypes.object,
    onCharacterHit: PropTypes.func,
    onCharacterHitDone: PropTypes.func,
    store: PropTypes.object
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
    this.contextLoop = contextLoop;
  };

  constructor(props) {
    super(props);
    this.loopID = null;
    this.isJumping = false;
    this.isPunching = false;
    this.isBiting = false;
    this.isCrouchIdle = false;
    this.isLookBack = false;
    this.isSnarling = false;
    this.isWhiping = false;
    this.isHit = false;
    this.isDecapitated = false;
    this.isDrop = false;
    this.isDown = false;
    this.isDownGrenade = false;
    this.isAmbush = false;
    this.isLanding = false;
    this.isLeaving = false;
    this.lastX = 0;
    this.lastDirection = -1;
    this.contextLoop = null;
    this.npcPosition = this.props.store.npcPositions[this.props.npcIndex];


    this.state = {
      npcState: 4,
      loop: true,
      spritePlaying: true,
      decapitated: false,
      ticksPerFrame: 5,
      direction: -1,
      hasStopped: Math.random() < .5 ? 0 : 1,
      hasHit: Math.random() < .5 ? 0 : 1,
      grenadeImage: Math.floor(Math.random() * 9)
    };
  }


  componentDidMount() {
    this.alienDieSound = new AudioPlayer('assets/se/role3_die1.wav');
    this.alienPunchSound = new AudioPlayer('assets/se/swipehit1.wav');
    this.alienWhipSound = new AudioPlayer('assets/se/swipehit2.wav');
    this.alienBiteSound = new AudioPlayer('assets/se/bite2.wav');

    this.motionTrackerSound = new AudioPlayer('assets/se/motion_tracker.wav', () => {
      this.stopMotionTrackerSound = this.motionTrackerSound.play({loop: true});
    });

    this.loopID = this.context.loop.subscribe(this.loop);
  }

  componentWillUnmount() {
    this.context.loop.unsubscribe(this.loopID);
    if (this.stopMotionTrackerSound && this.context.loop.loopID > 1000) {
      this.stopMotionTrackerSound();
    }
    this.respawn();
  }

  getWrapperStyles() {
    const {store} = this.props;
    const npcPosition = this.npcPosition;
    const {stageX} = store;
    const {scale} = this.context;
    const {x, y} = npcPosition;
    const targetX = x + stageX;

    return {
      position: 'absolute',
      transform: `translate(${targetX * scale}px, ${y * scale}px)`,
      transformOrigin: 'left top',
    };
  }

  loop = () => {
    const {store, npcIndex} = this.props;

    if (!this.isJumping && !this.isPunching && !this.isBiting && !this.isWhiping && !this.isLeaving && !this.isHit && !this.isDrop && !this.isDown && !this.isDownGrenade && !this.isLanding && !this.isCrouchIdle && !this.isLookBack && !this.isSnarling && !this.isDecapitated) {
      this.npcAction(this.body);
      if (this.isAmbush && this.state.spritePlaying === false) {
        this.isAmbush = false;
      }
    } else {
      if (this.isPunching && this.state.spritePlaying === false) {
        this.isPunching = false;
        this.props.onCharacterHitDone();
      }

      if (this.isBiting && this.state.spritePlaying === false) {
        this.isBiting = false;
        this.props.onCharacterHitDone();
      }

      if (this.isWhiping && this.state.spritePlaying === false) {
        this.isWhiping = false;
        this.props.onCharacterHitDone();
      }

      if (this.isLookBack && this.state.spritePlaying === false) {
        this.isLookBack = false;
      }

      if (this.isSnarling && this.state.spritePlaying === false) {
        this.isSnarling = false;
      }

      if (this.isCrouchIdle && this.state.spritePlaying === false) {
        this.isCrouchIdle = false;
        return this.ambush();
      }

      if (this.isHit && this.state.spritePlaying === false) {
        this.isHit = false;
      }

      if (this.isDecapitated && this.state.spritePlaying === false) {
        this.isDecapitated = false;
        return this.drop();
      }

      if (this.isLanding && this.state.spritePlaying === false) {
        this.isLanding = false;
      }

      if (this.isDrop && this.state.spritePlaying === false) {
        this.isDrop = false;
        store.setKillCount(store.killCount + 1);
        return this.down();
      }

      if (this.isDown && this.state.spritePlaying === false) {
        this.isDown = false;
        if (store.killCount < KILL_THRESHOLD) {
          return this.respawn();
        }
        else {
          return this.down();
        }
      }

      if (this.isDownGrenade && this.state.spritePlaying === false) {
        this.isDownGrenade = false;
        if (store.killCount < KILL_THRESHOLD) {
          return this.respawn();
        }
        else {
          return this.down();
        }
      }
    }
    this.lastX = this.npcPosition.x;
  };

  npcAction = (body) => {
    const {store, npcIndex} = this.props;
    let npcState = this.state.npcState;
    if (Math.abs(this.npcPosition.x - store.characterPosition.x) < Math.random() * 100 + 400) {
      if (store.characterIsAttacking && this.npcPosition.y === ALIEN_FLOOR) {
        if (this.npcPosition.x < store.characterPosition.x && store.characterDirection === -1) {
          return this.hit();
        }
        else if (this.npcPosition.x > store.characterPosition.x && store.characterDirection === 1) {
          return this.hit();
        }
      }

      if (store.characterIsAttackingGrenade && this.npcPosition.y === ALIEN_FLOOR) {
        if ((this.npcPosition.x < store.characterPosition.x && store.characterDirection === -1) ||
          (this.npcPosition.x > store.characterPosition.x && store.characterDirection === 1)) {
          if (store.explosionPositions.length > 0) {
            return this.hit();
          }
          else {
            store.addExplosion({
              npcIndex,
              x: this.npcPosition.x,
              y: store.characterPosition.y
            });
            return this.downGrenade();
          }
        }
      }
    }

    if (this.isCloseGrenade() && this.npcPosition.y === ALIEN_FLOOR) {
      return this.hit();
    }

    if (this.npcPosition.y < ALIEN_FLOOR && npcState !== 16 && npcState !== 14) {
      return this.crouchIdle();
    }
    else if (this.npcPosition.y < ALIEN_FLOOR && npcState === 14) {
      return this.ambush();
    }
    else if (this.npcPosition.y === ALIEN_FLOOR && npcState === 14 && npcState !== 15) {
      return this.land();
    }

    if (this.isBehind()) {
      this.turn(1);
    }
    else {
      this.turn(-1);
    }

    if (this.isFar()) {
      if (Math.random() < .8 && this.state.hasStopped % 2 === 0 && npcState < 3) {
        if (Math.random() < .2) {
          return this.lookBack();
        }
        else {
          return this.snarl();
        }
      }
      if (this.state.hasStopped % 2 > 0) {
        npcState = this.npcPosition.x < store.characterPosition.x ? 0 : 1;
      }
      else {
        npcState = this.npcPosition.x < store.characterPosition.x ? 2 : 3;
      }
      const distance = this.npcPosition.x < store.characterPosition.x ? 3 : -3;
      this.move(body, distance, npcState);
    }
    else if (this.state.npcState !== 4) {
      this.stop();
    }
    else if (this.state.npcState === 4 && this.contextLoop % Math.floor(Math.random() * 100) === 1) {
      this.props.onCharacterHit();
      const attackRandom = Math.random();
      if (attackRandom > .6 && this.state.direction === 1) {
        this.whip();
      }
      else if (attackRandom < .6 && attackRandom > .3) {
        this.bite();
      }
      else {
        this.punch();
      }
    }
  };

  hit = () => {
    const {store, npcIndex} = this.props;
    const direction = this.npcPosition.x < store.characterPosition.x ? 1 : -1;
    if (this.state.hasHit < 3) {
      this.isHit = true;
      const distance = direction < 0 ? Math.ceil(Math.random() * 10) : 0 - Math.ceil(Math.random() * 10);
      this.setNpcPosition({x: this.npcPosition.x + distance, y: this.npcPosition.y});
      this.setState(Object.assign({}, this.state, {
        npcState: this.state.hasHit % 2 > 0 ? 8 : 9,
        hasHit: this.state.hasHit + 1,
        direction,
        repeat: false,
        ticksPerFrame: 10
      }));
    }
    else {
      if (Math.random() < .5) {
        return this.decapitated();
      }
      else {
        return this.drop();
      }
    }
  };

  decapitated = () => {
    const {store, npcIndex} = this.props;
    const direction = this.npcPosition.x < store.characterPosition.x ? 1 : -1;
    this.isDecapitated = true;
    const distance = direction < 0 ? Math.ceil(Math.random() * 30) : 0 - Math.ceil(Math.random() * 30);
    this.setNpcPosition({x: this.npcPosition.x + distance, y: this.npcPosition.y});
    this.setState(Object.assign({}, this.state, {
      npcState: this.state.hasHit % 2 > 0 ? 19 : 20,
      hasHit: this.state.hasHit + 1,
      direction,
      repeat: false,
      decapitated: true,
      ticksPerFrame: 10
    }));
  };

  drop = () => {
    this.isDrop = true;
    const {store, npcIndex} = this.props;
    const direction = this.npcPosition.x < store.characterPosition.x ? 1 : -1;
    const distance = direction < 0 ? Math.ceil(Math.random() * 28) : 0 - Math.ceil(Math.random() * 28);
    this.setNpcPosition({
      x: this.npcPosition.x + distance * 5,
      y: this.npcPosition.y
    });
    let npcState = Math.random() < .5 ? 10 : 11;
    if (this.state.decapitated) {
      npcState = 21;
    }
    else {
      this.alienDieSound.play();
    }

    this.setState(Object.assign({}, this.state, {
      npcState,
      hasHit: this.state.hasHit + 1,
      direction,
      repeat: false,
      ticksPerFrame: 10
    }));

    if (this.stopMotionTrackerSound) {
      this.stopMotionTrackerSound();
    }
  };

  respawn = () => {
    const {store, npcIndex} = this.props;

    const explosion = store.explosionPositions.find((explosion) => explosion.npcIndex === npcIndex);
    if (explosion) {
      store.removeExplosion(npcIndex);
    }

    const direction = this.npcPosition.x < store.characterPosition.x ? 1 : -1;
    let distance = 0;
    let npcState = 4;
    if (Math.random() < .5 || store.levelCount < 1) {
      distance = direction < 0 ? RESPAWN_DISTANCE : -RESPAWN_DISTANCE;
      this.setNpcPosition({x: store.characterPosition.x + distance, y: this.npcPosition.y});
    }
    else {
      let npcState = 14;
      if (store.characterDirection < 0) {
        distance = Math.ceil(Math.random() * 200 + 100);
      }
      else {
        distance = 0 - Math.ceil(Math.random() * 200 + 100);
      }
      this.setNpcPosition({
        x: store.characterPosition.x + distance,
        y: this.npcPosition.y - getAmbushHeight(store.levelCount)
      });
    }
    this.setState(Object.assign({}, this.state, {
      npcState,
      hasHit: 0,
      direction,
      repeat: false,
      decapitated: false,
      ticksPerFrame: 500,
      grenadeImage: Math.floor(Math.random() * 9)
    }));

  };

  down = () => {
    this.isDown = true;
    let npcState = this.state.npcState === 10 ? 12 : 13;
    if (this.state.decapitated) {
      npcState = 22;
    }
    this.setState(Object.assign({}, this.state, {
      npcState,
      repeat: false,
      ticksPerFrame: 100 // respawn time
    }));
  };

  downGrenade = () => {
    const {store, npcIndex} = this.props;
    if (!this.isDown) {
      this.isDownGrenade = true;
    }
    let npcState = 23;
    this.setState(Object.assign({}, this.state, {
      npcState,
      repeat: false,
      ticksPerFrame: 12 // respawn time
    }));
    if (this.stopMotionTrackerSound && this.context.loop.loopID > 1000) {
      this.stopMotionTrackerSound();
    }
  };

  land = () => {
    this.isLanding = true;
    this.setState(Object.assign({}, this.state, {
      npcState: 15,
      repeat: false,
      ticksPerFrame: 10
    }));
  };

  isFar = () => {
    const {store, npcIndex} = this.props;
    const directionOffset = this.state.direction < 0 ? -40 : 0;
    const distance = Math.abs(this.npcPosition.x - store.characterPosition.x);
    return distance > 110 + directionOffset;
  };

  move = (body, distance, npcState) => {
    const {store} = this.props;
    this.setNpcPosition({x: this.npcPosition.x + distance, y: this.npcPosition.y});
    this.setState(Object.assign({}, this.state, {
      npcState,
      direction: this.npcPosition.x < store.characterPosition.x ? 1 : -1,
      repeat: true,
      loop: true,
      ticksPerFrame: 5
    }));
  };

  jump = (body) => {
    this.jumpNoise.play();
    this.isJumping = true;
  };

  punch = () => {
    this.isPunching = true;
    this.alienPunchSound.play();
    this.setState(Object.assign({}, this.state, {
      npcState: 5,
      ticksPerFrame: 5,
      repeat: false
    }));
  };

  ambush = () => {
    this.isAmbush = true;
    this.setNpcPosition({x: this.npcPosition.x, y: this.npcPosition.y + 10});
    this.setState(Object.assign({}, this.state, {
      npcState: 14,
      ticksPerFrame: 5,
      repeat: false
    }));
  };

  bite = () => {
    this.isBiting = true;
    this.alienBiteSound.play();
    this.setState(Object.assign({}, this.state, {
      npcState: 6,
      ticksPerFrame: 10,
      repeat: false
    }));
  };

  lookBack = () => {
    this.isLookBack = true;
    this.setState(Object.assign({}, this.state, {
      npcState: 17,
      ticksPerFrame: 10,
      hasStopped: this.state.hasStopped + 1,
      repeat: false
    }));
  };

  snarl = () => {
    this.isSnarling = true;
    this.setState(Object.assign({}, this.state, {
      npcState: 18,
      ticksPerFrame: 10,
      hasStopped: this.state.hasStopped + 1,
      repeat: false
    }));
  };

  crouchIdle = () => {
    const {store, npcIndex} = this.props;
    this.isCrouchIdle = true;
    this.setState(Object.assign({}, this.state, {
      npcState: 16,
      direction: this.npcPosition.x < store.characterPosition.x ? 1 : -1,
      ticksPerFrame: 10,
      repeat: false
    }));
  };

  whip = () => {
    this.isWhiping = true;
    this.alienWhipSound.play();
    this.setState(Object.assign({}, this.state, {
      npcState: 7,
      ticksPerFrame: 5,
      repeat: false
    }));
  };


  stop = () => {
    this.setState(Object.assign({}, this.state, {
      npcState: 4,
      ticksPerFrame: 5,
      repeat: false,
      hasStopped: this.state.hasStopped + 1
    }));
  };

  render() {
    const {store, npcState} = this.props;
    return (
      <div style={this.getWrapperStyles()} className={`npc`} id={`npc_${this.props.npcIndex}`}>
        <Sprite
          ref={(sprite) => {
            this.body = sprite
          }
          }
          repeat={this.state.repeat}
          onPlayStateChanged={this.handlePlayStateChanged}
          onGetContextLoop={this.getContextLoop}
          src="assets/alien_0.png"
          scale={this.context.scale * 1}
          direction={this.state.direction}
          state={this.state.npcState}
          steps={[
            7,
            7,
            7,
            7,
            0,
            3,
            3,
            6,
            1,
            1,
            1,
            1,// drop 2
            1,
            1,
            2, // ambush
            1, // land
            2, //16 crouchIdle
            3, // 17 lookBack
            2, // 18 snarl
            1, // 19 decapitation 1
            1, // 20 decapitation 2
            1, // 21 fall decapitation
            1, // 22 down decapitation
            2, // 23 down burn
          ]}
          offset={[0, 0]}
          tileWidth={200}
          tileHeight={100}
          ticksPerFrame={this.state.ticksPerFrame}
        />
        {this.state.npcState === 8 &&
        <Sprite
          repeat={this.state.repeat}
          src="assets/acid_0.png"
          scale={this.context.scale * 1}
          direction={this.state.direction}
          steps={[5]}
          offset={[0, 0]}
          tileWidth={200}
          tileHeight={100}
          ticksPerFrame={3}
          top={Math.ceil(-90 - Math.ceil(Math.random() * 10))}
        />
        }
        {this.state.npcState === 11 &&
        <Sprite
          repeat={this.state.repeat}
          src="assets/armor_hit.png"
          scale={this.context.scale * 1}
          direction={this.state.direction}
          steps={[5]}
          offset={[0, 0]}
          tileWidth={200}
          tileHeight={100}
          ticksPerFrame={1}
          top={-90}
        />}
        {(this.state.npcState === 19 || this.state.npcState === 20) &&
        <Sprite
          repeat={this.state.repeat}
          src="assets/decap_acid.png"
          scale={this.context.scale * 1}
          direction={this.state.direction}
          steps={[5]}
          offset={[0, 0]}
          tileWidth={200}
          tileHeight={100}
          ticksPerFrame={10}
          top={Math.ceil(-90 - Math.ceil(Math.random() * 10))}
        />
        }

        {this.state.npcState === 23 &&
        <Explosion
          grenadeImage={this.state.grenadeImage}
          direction={this.state.direction}
          top={Math.ceil(-90 - Math.ceil(Math.random() * 10))}
        />}
      </div>
    );
  }

}
