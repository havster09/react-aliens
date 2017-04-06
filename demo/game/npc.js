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
    this.setState({
      contextLoop: contextLoop
    });
  };

  move = (body, x) => {
    const {store,npcIndex} = this.props;
    this.lastDirection = (x < 0 && Math.abs(x) > 2) ? 1 : 0;
    store.setNpcPosition({x:store.npcPositions[npcIndex].x + x,y:store.npcPositions[npcIndex].y},npcIndex);
  };

  jump = (body) => {
    this.jumpNoise.play();
    this.isJumping = true;
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

  npcAction = (body) => {
    const {keys, store} = this.props;

    let npcState = 2;
    let direction = this.lastDirection > 0 ? -1 : 1;

    direction = -1;
    // this.move(body, -3);
    npcState = 1;

    this.setState({
      npcState,
      direction,
      repeat: npcState < 2,
    });
  };

  loop = () => {
    const {store, npcIndex} = this.props;

    const midPoint = Math.abs(store.stageX) + 360;

    if (!this.isJumping && !this.isPunching && !this.isLeaving) {
      this.npcAction(this.body);
    } else {
      if (this.isPunching && this.state.spritePlaying === false) {
        this.isPunching = false;
      }

      if (this.isShooting && this.state.spritePlaying === false) {
        this.isShooting = false;
      }
    }
    this.lastX = store.npcPositions[npcIndex].x;
  };

  constructor(props) {
    super(props);
    this.loopID = null;
    this.isJumping = false;
    this.isPunching = false;
    this.isShooting = false;
    this.isLeaving = false;
    this.lastX = 0;
    this.lastDirection = -1;

    this.state = {
      npcState: 2,
      loop: false,
      spritePlaying: true,
      ticksPerFrame: 5,
      direction: -1
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
    return (
      <div style={this.getWrapperStyles()} className={`npc`} id={`npc_${this.props.npcIndex}`}>
        <Sprite
          ref={(sprite)=>{
              this.body=sprite
            }
          }
          repeat={this.state.repeat}
          onPlayStateChanged={this.handlePlayStateChanged}
          onGetContextLoop={this.getContextLoop}
          src="assets/alien_0.png"
          scale={this.context.scale * 1}
          direction={-1}
          state={this.state.npcState}
          steps={[7,7,0]}
          offset={[0,0]}
          tileWidth={200}
          tileHeight={100}
          ticksPerFrame={this.state.ticksPerFrame}
        />
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
