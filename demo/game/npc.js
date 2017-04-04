import React, {Component, PropTypes} from 'react';
import {observer} from 'mobx-react';
import Matter from 'matter-js';

import {
  AudioPlayer,
  Body,
  Sprite,
} from '../../src';

@observer
export default class Npc extends Component {

  static propTypes = {
    npcIndex: PropTypes.number,
    keys: PropTypes.object,
    onShoot: PropTypes.func,
    onReload: PropTypes.func,
    store: PropTypes.object,
  };

  static contextTypes = {
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
    this.setState({
      contextLoop: contextLoop
    });
  };

  move = (body, x) => {
    this.lastDirection = (x < 0 && Math.abs(x) > 2) ? 1 : 0;
    Matter.Body.setVelocity(body, {x, y: 0});
  };

  jump = (body) => {
    this.jumpNoise.play();
    this.isJumping = true;
    Matter.Body.applyForce(
      body,
      {x: 0, y: 0},
      {x: 0, y: -0.3},
    );
    Matter.Body.set(body, 'friction', 0.0001);
  };

  shoot = () => {
    this.isShooting = true;
    let direction = this.lastDirection > 0 ? -1 : 1;
    if (this.props.ammo > 0) {
      this.props.onShoot();
      this.setState({
        npcState: 3,
        direction,
        repeat: true
      });
    }
    else {
      this.reload();
    }
  };

  stop = () => {
    let direction = this.lastDirection > 0 ? -1 : 1;
    this.setState({
      npcState: 2,
      direction,
      repeat: false
    });
  };

  checkKeys = (shouldMoveStageLeft, shouldMoveStageRight) => {
    const {keys, store} = this.props;
    const {body} = this.body;

    let npcState = 2;
    let direction = this.lastDirection > 0 ? -1 : 1;

    /*if (keys.isDown(83)) {
     return this.shoot();
     }

     if (keys.isDown(65)) {
     return this.stop();
     }

     if (keys.isDown(keys.SPACE)) {
     this.jump(body);
     }

     if (keys.isDown(keys.LEFT)) {
     if (shouldMoveStageLeft) {

     }
     direction = -1;
     this.move(body, -4);
     npcState = 1;
     } else if (keys.isDown(keys.RIGHT)) {
     if (shouldMoveStageRight) {

     }
     npcState = 0;
     direction = 1;
     this.move(body, 3);
     }*/

    // console.log(npcState);

    this.setState({
      npcState,
      direction,
      repeat: npcState < 2,
    });
  };

  update = () => {
    const {store, npcIndex} = this.props;
    const {body} = this.body;


    const midPoint = Math.abs(store.stageX) + 360;

    const shouldMoveStageLeft = body.position.x < midPoint && store.stageX < 0;
    const shouldMoveStageRight = body.position.x > midPoint && store.stageX > -2048;

    const velY = parseFloat(body.velocity.y.toFixed(10));

    if (velY === 0) {
      this.isJumping = false;
      Matter.Body.set(body, 'friction', 0.9999);
    }

    if (!this.isJumping && !this.isPunching && !this.isLeaving) {
      this.checkKeys(shouldMoveStageLeft, shouldMoveStageRight);
      store.setNpcPosition(body.position, 0);
    } else {
      if (this.isPunching && this.state.spritePlaying === false) {
        this.isPunching = false;
      }

      if (this.isShooting && this.state.spritePlaying === false) {
        this.isShooting = false;
      }

      const targetX = store.stageX + (this.lastX - body.position.x);
      if (shouldMoveStageLeft || shouldMoveStageRight) {

      }
    }
    this.lastX = body.position.x;
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
      npcState: 2,
      loop: false,
      spritePlaying: true,
      ticksPerFrame: 5,
      lastDirection:1
    };
  }


  componentDidMount() {
    this.jumpNoise = new AudioPlayer('/assets/jump.wav');
    Matter.Events.on(this.context.engine, 'afterUpdate', this.update);
  }

  componentWillUnmount() {
    Matter.Events.off(this.context.engine, 'afterUpdate', this.update);
  }

  getWrapperStyles() {
    const {store, npcIndex} = this.props;
    const npcPosition = store.npcPositions[npcIndex];
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

  render() {
    const {npcIndex} = this.props;
    const x = this.props.store.npcPositions[npcIndex].x;

    return (
      <div style={this.getWrapperStyles()}>
        <Body
          args={[x, 415, 20, 20]}
          inertia={Infinity}
          ref={(b) => { this.body = b; }}
        >
        <Sprite
          repeat={this.state.repeat}
          onPlayStateChanged={this.handlePlayStateChanged}
          onGetContextLoop={this.getContextLoop}
          src="assets/alien_0.png"
          scale={this.context.scale * 1}
          direction={this.state.direction}
          state={this.state.npcState}
          steps={[7,7,0]}
          offset={[0,0]}
          tileWidth={200}
          tileHeight={100}
          ticksPerFrame={this.state.ticksPerFrame}
        />
        </Body>
        <Sprite
          repeat={this.state.repeat}
          src="assets/pulse_rifle_shoot.png"
          scale={this.context.scale * 1}
          direction={this.state.direction}
          steps={[3]}
          offset={[0,0]}
          tileWidth={200}
          tileHeight={100}
          ticksPerFrame={3}
          top={-120}
          display={this.state.npcState!==3?"none":"block"}
        />
      </div>
    );
  }
}
