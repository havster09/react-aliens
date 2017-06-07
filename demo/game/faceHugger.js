import React, {PropTypes} from 'react';
import {observer} from 'mobx-react';
import Npc from "./npc";
import {FACEHUGGER_FLOOR, KILL_THRESHOLD, RESPAWN_DISTANCE} from './constants';
import {getAmbushHeight} from './helpers/ambushHeight';

import {
  AudioPlayer,
  Sprite,
} from '../../src';


@observer
export default class FaceHugger extends Npc {
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
    this.isAttacking = false;
    this.isCrouchIdle = false;
    this.isHit = false;
    this.isInPieces = false;
    this.isDrop = false;
    this.isDown = false;
    this.isAmbush = false;
    this.isLanding = false;
    this.hasLatched = false;
    this.isLeaving = false;
    this.isInEgg = false;
    this.lastX = 0;
    this.lastDirection = -1;
    this.contextLoop = null;
    this.npcPosition = this.props.store.faceHuggerPositions[this.props.npcIndex];

    this.state = {
      npcState: 2,
      loop: false,
      spritePlaying: true,
      inPieces: false,
      ticksPerFrame: 5,
      direction: -1,
      hasStopped: Math.random() < .5 ? 0 : 1,
      hasHit: Math.random() < .5 ? 0 : 1,
      latch: false
    };
  }


  componentDidMount() {
    this.motionTrackerSound = new AudioPlayer('assets/se/motion_tracker.wav',()=> {
      this.stopMotionTrackerSound = this.motionTrackerSound.play({loop:true});
    });

    this.loopID = this.context.loop.subscribe(this.loop);
  }

  componentWillUnmount() {
    const {store,npcIndex} = this.props;
    this.context.loop.unsubscribe(this.loopID);
    if(store.faceHuggerPositions.length > store.eggPositions.length) {
      store.removeFaceHugger(npcIndex);
    }
    else {
      return this.respawn();
    }
  }

  getWrapperStyles() {
    const {store, npcIndex} = this.props;
    if(store.faceHuggerPositions[npcIndex]) {
      const npcPosition = this.npcPosition;
      const {stageX} = store;
      const {scale} = this.context;
      const {x, y} = npcPosition;
      const targetX = x + stageX;
      const visibility = this.state.latch ? 'hidden' : 'visible';
      return {
        visibility,
        position: 'absolute',
        transform: `translate(${targetX * scale}px, ${y * scale}px)`,
        transformOrigin: 'left top',
      };
    }
  }

  loop = () => {
    const {store, npcIndex} = this.props;

    if(!store.faceHuggerPositions[npcIndex]) {
      return;
    }

    if (!this.isJumping && !this.isAttacking && !this.isHit && !this.isDrop && !this.isDown && !this.isLanding && !this.isCrouchIdle && !this.isInPieces && !this.hasLatched) {
      this.npcAction(this.body);
      if (this.isAmbush && this.state.spritePlaying === false) {
        this.isAmbush = false;
      }
    } else {
      if (this.isAttacking && this.state.spritePlaying === false) {
        this.isAttacking = false;
        this.props.onCharacterHitDone();
        if (!store.characterIsLatched && !this.hasLatched) {
          if(this.stopMotionTrackerSound && this.context.loop.loopID > 1000) {
            this.stopMotionTrackerSound();
          }
          return this.latch();
        }
      }

      if (this.hasLatched && !store.characterIsLatched) {
        this.hasLatched = false;
        return this.down();
      }

      if (this.isCrouchIdle && this.state.spritePlaying === false) {
        this.isCrouchIdle = false;
        return this.ambush();
      }

      if (this.isHit && this.state.spritePlaying === false) {
        this.isHit = false;
      }

      if (this.isInPieces && this.state.spritePlaying === false) {
        this.isInPieces = false;
        store.setKillCount(store.killCount + 1);
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
        if(store.killCount < KILL_THRESHOLD) {
          if(this.stopMotionTrackerSound && this.context.loop.loopID > 1000) {
            this.stopMotionTrackerSound();
          }
          return this.respawn();
        }
        else {
          return this.down();
        }
      }
    }
    this.lastX = store.faceHuggerPositions[npcIndex].x;
  };

  npcAction = (body) => {
    const {store, npcIndex} = this.props;

    if(!this.npcPosition) {
      return;
    }

    let npcState = this.state.npcState;
    if (store.characterIsAttacking && this.npcPosition.y === FACEHUGGER_FLOOR) {
      if (store.characterIsCrouching || (Math.abs(store.characterPosition.x - this.npcPosition.x) < 120)) {
        if (this.npcPosition.x < store.characterPosition.x && store.characterDirection === -1) {
          return this.hit();
        }
        else if (this.npcPosition.x > store.characterPosition.x && store.characterDirection === 1) {
          return this.hit();
        }

      }
    }

    if(this.isCloseGrenade() && this.npcPosition.y === FACEHUGGER_FLOOR) {
      return this.hit();
    }

    if (this.npcPosition.y < FACEHUGGER_FLOOR && npcState !== 11 && npcState !== 9) {
      return this.crouchIdle();
    }
    else if (this.npcPosition.y < FACEHUGGER_FLOOR && npcState === 9) {
      return this.ambush()
    }
    else if (this.npcPosition.y === FACEHUGGER_FLOOR && npcState === 9 && npcState !== 10) {
      this.setNpcPosition(Object.assign({},{
        x: this.npcPosition.x, y: FACEHUGGER_FLOOR}));
      return this.land();
    }


    if (this.isBehind()) {
      this.turn(1);
    }
    else {
      this.turn(-1);
    }

    if (this.isFar()) {
      npcState = this.npcPosition.x < store.characterPosition.x ? 0 : 1;

      const distance = this.npcPosition.x < store.characterPosition.x ? 3 : -3;
      this.move(body, distance, npcState);
    }
    else if (this.state.npcState !== 2) {
      this.stop();
    }
    else if (this.state.npcState === 2 && Math.random() && this.state.direction !== store.characterDirection && !store.characterIsLatched) {
      if (!this.state.latch && this.contextLoop % 20 === 1) {
        this.props.onCharacterHit();
        this.attack();
      }
    }
  };

  hit = () => {
    const {store, npcIndex} = this.props;
    const direction = this.npcPosition.x < store.characterPosition.x ? 1 : -1;
    if (this.state.hasHit < 3) {
      this.isHit = true;
      this.setNpcPosition(Object.assign({},{
        x: this.npcPosition.x,
        y: this.npcPosition.y
      }));
      this.setState(Object.assign({}, this.state, {
        npcState: 4,
        hasHit: this.state.hasHit + 1,
        direction,
        repeat: false,
        ticksPerFrame: 5
      }));
    }
    else {
      if (Math.random() < .5) {
        return this.inPieces();
      }
      else {
        return this.drop();
      }
    }
  };

  inPieces = () => {
    const {store, npcIndex} = this.props;
    const direction = this.npcPosition.x < store.characterPosition.x ? 1 : -1;
    this.isInPieces = true;
    this.setNpcPosition(Object.assign({},{
      x: this.npcPosition.x,
      y: this.npcPosition.y
    }));
    const npcState = 7;
    this.setState(Object.assign({}, this.state, {
      npcState,
      hasHit: this.state.hasHit + 1,
      direction,
      repeat: false,
      inPieces: true,
      ticksPerFrame: 4
    }));
    this.setNpcPosition(Object.assign({},{x:this.npcPosition.x,y:this.npcPosition.y}));
  };

  down = () => {
    const {store, npcIndex} = this.props;
    this.isDown = true;
    let npcState = 6;
    if (this.state.inPieces) {
      npcState = 8;
    }
    this.setState(Object.assign({}, this.state, {
      npcState,
      repeat: false,
      latch: false,
      ticksPerFrame: 100 // respawn time
    }));
    this.setNpcPosition(Object.assign({},{x:this.npcPosition.x,y:this.npcPosition.y}));
  };

  drop = () => {
    this.isDrop = true;
    const {store, npcIndex} = this.props;
    const direction = this.npcPosition.x < store.characterPosition.x ? 1 : -1;
    this.setNpcPosition(Object.assign({},{
      x: this.npcPosition.x,
      y: this.npcPosition.y
    }));
    let npcState = 5;
    if (this.state.inPieces) {
      npcState = 8;
    }
    this.setState(Object.assign({}, this.state, {
      npcState,
      hasHit: this.state.hasHit + 1,
      direction,
      repeat: false,
      ticksPerFrame: 100
    }));
    if(this.stopMotionTrackerSound && this.context.loop.loopID > 1000) {
      this.stopMotionTrackerSound();
    }
  };

  respawn = () => {
    const {store} = this.props;
    if(this.npcPosition){
      const direction = this.npcPosition.x < store.characterPosition.x ? 1 : -1;
      let distance = 0;
      let npcState = 10;
      if (Math.random() < .5 || store.levelCount < 1) {
        distance = direction < 0 ? RESPAWN_DISTANCE : -RESPAWN_DISTANCE;
        this.setNpcPosition(Object.assign({},{
          x: this.npcPosition.x+distance, y: FACEHUGGER_FLOOR}));
      }
      else {
        npcState = 14;
        if (store.characterDirection < 0) {
          distance = Math.ceil(Math.random() * 200 + 100);
        }
        else {
          distance = 0 - Math.ceil(Math.random() * 200 + 100);
        }
        this.setNpcPosition(Object.assign({},{
          x: store.characterPosition.x + distance,
          y: this.npcPosition.y - getAmbushHeight(store.levelCount)
        }));
      }

      this.setState(Object.assign({}, this.state, {
        npcState,
        hasHit: 0,
        direction,
        repeat: false,
        inPieces: false,
        ticksPerFrame: 500
      }));
    }
  };

  isFar = () => {
    const {store, npcIndex} = this.props;
    const directionOffset = this.state.direction < 0 ? 0 : -20;
    const distance = Math.abs(this.npcPosition.x - store.characterPosition.x);
    return distance > 40 + directionOffset;
  };


  land = () => {
    this.isLanding = true;
    this.setState(Object.assign({}, this.state, {
      npcState: 10,
      repeat: false,
      ticksPerFrame: 10
    }));
  };

  move = (body, distance, npcState) => {
    const {store} = this.props;
    this.setNpcPosition(Object.assign({} ,{
      x: this.npcPosition.x + distance,
      y: this.npcPosition.y
    }));
    this.setState(Object.assign({}, this.state, {
      npcState,
      direction: this.npcPosition.x < store.characterPosition.x ? 1 : -1,
      repeat: true,
      loop: true,
      ticksPerFrame: 2
    }));
  };

  attack = () => {
    this.isAttacking = true;
    this.setState(Object.assign({}, this.state, {
      npcState: 3,
      ticksPerFrame: 5,
      repeat: false
    }));
  };

  latch = () => {
    const {store, npcIndex} = this.props;
    this.setNpcPosition(Object.assign({}, {x: store.characterPosition.x, y: this.npcPosition.y}));
    store.setCharacterLatched(true);
    this.hasLatched = true;
    this.setState(Object.assign({}, this.state, {
      latch: true,
      ticksPerFrame: 5,
      repeat: false
    }));
  };

  ambush = () => {
    this.isAmbush = true;
    this.setNpcPosition({x: this.npcPosition.x, y: this.npcPosition.y+10});
    this.setState(Object.assign({}, this.state, {
      npcState: 9,
      ticksPerFrame: 5,
      repeat: false
    }));
  };

  crouchIdle = () => {
    const {store, npcIndex} = this.props;
    this.isCrouchIdle = true;
    this.setState(Object.assign({}, this.state, {
      npcState: 11,
      direction: this.npcPosition.x < store.characterPosition.x ? 1 : -1,
      ticksPerFrame: 10,
      repeat: false
    }));
  };

  stop = () => {
    this.setState(Object.assign({}, this.state, {
      npcState: 2,
      ticksPerFrame: 5,
      repeat: false,
      hasStopped: this.state.hasStopped + 1
    }));
  };

  render() {
    return (
      <div style={this.getWrapperStyles()} className={`npc`} id={`npc_${this.props.npcIndex}`}>
        {!this.isInEgg &&
        <Sprite
          ref={(sprite) => {
            this.body = sprite
          }
          }
          repeat={this.state.repeat}
          onPlayStateChanged={this.handlePlayStateChanged}
          onGetContextLoop={this.getContextLoop}
          src="assets/face_hugger.png"
          scale={this.context.scale * 1}
          direction={this.state.direction}
          state={this.state.npcState}
          steps={[
            7, //0
            7, //1
            0, //2 stop
            2, //3 attack
            1, //4 hit
            1, //5 drop
            1, //6 down
            1, //7 pieces
            1, //8 pieces down
            2, //9 ambush
            1, //10 land
            2 //11 crouchIdle
          ]}
          offset={[0, 0]}
          tileWidth={140}
          tileHeight={70}
          ticksPerFrame={this.state.ticksPerFrame}
        />
        }
      </div>
    );
  }

}
