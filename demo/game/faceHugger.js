import React, {PropTypes} from 'react';
import {observer} from 'mobx-react';
import Npc from "./npc";
import {faceHuggerFloor, ambushHeight,faceHuggerThreshold} from './constants';

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
    this.setState({
      contextLoop: contextLoop
    });
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
    this.loopID = this.context.loop.subscribe(this.loop);
  }

  componentWillUnmount() {
    this.context.loop.unsubscribe(this.loopID);
    this.respawn();
  }

  getWrapperStyles() {
    const {store, npcIndex} = this.props;
    if(store.faceHuggerPositions[npcIndex]) {
      const npcPosition = store.faceHuggerPositions[npcIndex];
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
        return this.drop();
      }

      if (this.isLanding && this.state.spritePlaying === false) {
        this.isLanding = false;
      }

      if (this.isDrop && this.state.spritePlaying === false) {
        this.isDrop = false;
        this.down();
      }

      if (this.isDown && this.state.spritePlaying === false) {
        this.isDown = false;
        return this.respawn();
      }
    }
    this.lastX = store.faceHuggerPositions[npcIndex].x;

  };

  npcAction = (body) => {
    const {store, npcIndex} = this.props;
    let npcState = this.state.npcState;
    if (store.characterIsAttacking && store.faceHuggerPositions[npcIndex].y === faceHuggerFloor) {
      if (store.characterIsCrouching || (Math.abs(store.characterPosition.x - store.faceHuggerPositions[npcIndex].x) < 120)) {
        if (store.faceHuggerPositions[npcIndex].x < store.characterPosition.x && store.characterDirection === -1) {
          return this.hit();
        }
        else if (store.faceHuggerPositions[npcIndex].x > store.characterPosition.x && store.characterDirection === 1) {
          return this.hit();
        }

      }
    }

    if (store.faceHuggerPositions[npcIndex].y < faceHuggerFloor && npcState !== 11 && npcState !== 9) {
      return this.crouchIdle();
    }
    else if (store.faceHuggerPositions[npcIndex].y < faceHuggerFloor && npcState === 9) {
      return store.setFaceHuggerPosition(Object.assign({}, ...store.faceHuggerPositions[npcIndex],{
        x: store.faceHuggerPositions[npcIndex].x,
        y: store.faceHuggerPositions[npcIndex].y + 10
      }), npcIndex);
    }
    else if (store.faceHuggerPositions[npcIndex].y === faceHuggerFloor && npcState === 9 && npcState !== 10) {
      store.setFaceHuggerPosition(Object.assign({}, ...store.faceHuggerPositions[npcIndex],{
        x: store.faceHuggerPositions[npcIndex].x, y: faceHuggerFloor}), npcIndex);
      return this.land();
    }


    if (this.isBehind()) {
      this.turn(1);
    }
    else {
      this.turn(-1);
    }

    if (this.isFar()) {
      npcState = store.faceHuggerPositions[npcIndex].x < store.characterPosition.x ? 0 : 1;

      const distance = store.faceHuggerPositions[npcIndex].x < store.characterPosition.x ? 3 : -3;
      this.move(body, distance, npcState);
    }
    else if (this.state.npcState !== 2) {
      this.stop();
    }
    else if (this.state.npcState === 2 && Math.random() && this.state.direction !== store.characterDirection && !store.characterIsLatched) {
      if (!this.state.latch) {
        this.props.onCharacterHit();
        this.attack();
      }
    }
  };

  hatch = () => {
    const {store, npcIndex} = this.props;
    const direction = store.faceHuggerPositions[npcIndex].x < store.characterPosition.x ? 1 : -1;
    const distance = direction < 0 ? -90 : -10;
    this.setState(Object.assign({}, this.state, {
      direction,
      hatched: true
    }));
    store.setFaceHuggerPosition(Object.assign({}, ...store.faceHuggerPositions[npcIndex],{
      x: store.faceHuggerPositions[npcIndex].x + distance,
      y: store.faceHuggerPositions[npcIndex].y + -10
    }), npcIndex);
    return this.ambush();
  };

  hit = () => {
    const {store, npcIndex} = this.props;
    const direction = store.faceHuggerPositions[npcIndex].x < store.characterPosition.x ? 1 : -1;
    if (this.state.hasHit < 3) {
      this.isHit = true;
      store.setFaceHuggerPosition(Object.assign({}, ...store.faceHuggerPositions[npcIndex],{
        x: store.faceHuggerPositions[npcIndex].x,
        y: store.faceHuggerPositions[npcIndex].y
      }), npcIndex);
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
    const direction = store.faceHuggerPositions[npcIndex].x < store.characterPosition.x ? 1 : -1;
    this.isInPieces = true;
    store.setFaceHuggerPosition(Object.assign({}, ...store.faceHuggerPositions[npcIndex],{
      x: store.faceHuggerPositions[npcIndex].x,
      y: store.faceHuggerPositions[npcIndex].y
    }), npcIndex);
    const npcState = 7;
    this.setState(Object.assign({}, this.state, {
      npcState,
      hasHit: this.state.hasHit + 1,
      direction,
      repeat: false,
      inPieces: true,
      ticksPerFrame: 4
    }));
    store.setFaceHuggerPosition(Object.assign({},{x:store.faceHuggerPositions[npcIndex].x,y:store.faceHuggerPositions[npcIndex].y},{npcState}), npcIndex);
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
    store.setFaceHuggerPosition(Object.assign({},{x:store.faceHuggerPositions[npcIndex].x,y:store.faceHuggerPositions[npcIndex].y},{npcState}), npcIndex);
  };

  drop = () => {
    this.isDrop = true;
    const {store, npcIndex} = this.props;
    const direction = store.faceHuggerPositions[npcIndex].x < store.characterPosition.x ? 1 : -1;
    store.setFaceHuggerPosition(Object.assign({}, ...store.faceHuggerPositions[npcIndex],{
      x: store.faceHuggerPositions[npcIndex].x,
      y: store.faceHuggerPositions[npcIndex].y
    }), npcIndex);
    let npcState = 5;
    if (this.state.inPieces) {
      npcState = 8;
    }
    this.setState(Object.assign({}, this.state, {
      npcState,
      hasHit: this.state.hasHit + 1,
      direction,
      repeat: false,
      ticksPerFrame: 1000
    }));
  };

  respawn = () => {
    const {store, npcIndex} = this.props;
    if(store.faceHuggerPositions.length > store.eggPositions.length) {
      store.removeFaceHugger(npcIndex);
    }
    else if(store.faceHuggerPositions[npcIndex]){
      const direction = store.faceHuggerPositions[npcIndex].x < store.characterPosition.x ? 1 : -1;
      let distance = 0;
      let npcState = 2;
      if (Math.random() < .5 || store.levelCount < 1) {
        distance = direction < 0 ? Math.ceil(Math.random() * 1000) + 1000 : -1000 - Math.ceil(Math.random() * 1000);
        store.setFaceHuggerPosition(Object.assign({}, ...store.faceHuggerPositions[npcIndex],{
          x: store.characterPosition.x + distance,
          y: store.faceHuggerPositions[npcIndex].y
        }), npcIndex);
      }
      else {
        let npcState = 14;
        if (store.characterDirection < 0) {
          distance = Math.ceil(Math.random() * 200 + 100);
        }
        else {
          distance = 0 - Math.ceil(Math.random() * 200 + 100);
        }
        store.setFaceHuggerPosition(Object.assign({}, ...store.faceHuggerPositions[npcIndex],{
          x: store.characterPosition.x + distance,
          y: store.faceHuggerPositions[npcIndex].y - ambushHeight
        }), npcIndex);
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


  land = () => {
    this.isLanding = true;
    this.setState(Object.assign({}, this.state, {
      npcState: 10,
      repeat: false,
      ticksPerFrame: 10
    }));
  };

  isBehind() {
    const {store, npcIndex} = this.props;
    const turnOffset = store.faceHuggerPositions[npcIndex].x < store.characterPosition.x ? -1000 : 1000;
    return store.faceHuggerPositions[npcIndex].x < store.characterPosition.x - turnOffset;
  }

  turn(direction) {
    const {store, npcIndex} = this.props;
    this.lastDirection = direction;
    this.setState(Object.assign({}, this.state, {
      direction: direction
    }));
  }

  isFar = () => {
    const {store, npcIndex} = this.props;
    const directionOffset = this.state.direction < 0 ? 0 : -20;
    const distance = Math.abs(store.faceHuggerPositions[npcIndex].x - store.characterPosition.x);
    return distance > 40 + directionOffset;
  };

  move = (body, distance, npcState) => {
    const {store, npcIndex} = this.props;
    store.setFaceHuggerPosition(Object.assign({}, ...store.faceHuggerPositions[npcIndex],{
      x: store.faceHuggerPositions[npcIndex].x + distance,
      y: store.faceHuggerPositions[npcIndex].y
    }), npcIndex);
    this.setState(Object.assign({}, this.state, {
      npcState,
      direction: store.faceHuggerPositions[npcIndex].x < store.characterPosition.x ? 1 : -1,
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
    store.setFaceHuggerPosition(Object.assign({}, ...store.faceHuggerPositions[npcIndex],{x: store.characterPosition.x, y: store.faceHuggerPositions[npcIndex].y}), npcIndex);
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
      direction: store.faceHuggerPositions[npcIndex].x < store.characterPosition.x ? 1 : -1,
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
