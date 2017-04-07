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
      npcState: 4,
      loop: true,
      spritePlaying: true,
      ticksPerFrame: 5,
      direction: -1,
      hasStopped:Math.random()<.5?0:1
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

  npcAction = (body) => {
    const {store, npcIndex} = this.props;
    let npcState = this.state.npcState;
    if (this.isBehind()) {
      this.turn(1);
    }
    else {
      this.turn(-1);
    }

    if (this.isFar()) {
      if(this.state.hasStopped%2>0) {
        npcState = store.npcPositions[npcIndex].x < store.characterPosition.x ? 0 : 1;
      }
      else {
        npcState = store.npcPositions[npcIndex].x < store.characterPosition.x ? 2 : 3;
      }
      const distance = store.npcPositions[npcIndex].x < store.characterPosition.x ? 3 : -3;
      this.move(body, distance, npcState);
    }
    else if(this.state.npcState !== 4){
      this.stop();
    }
    else if(this.state.npcState === 4) {
      // console.log(`attack`);
    }
  };

  isBehind() {
    const {store, npcIndex} = this.props;
    const turnOffset = store.npcPositions[npcIndex].x < store.characterPosition.x ? -1000 : 1000;
    return store.npcPositions[npcIndex].x < store.characterPosition.x - turnOffset;
  }

  turn(direction) {
    const {store, npcIndex} = this.props;
    this.lastDirection = direction;
    this.setState(Object.assign({}, ...this.state, {
      direction: direction
    }));
  }

  isFar = () => {
    const {store, npcIndex} = this.props;
    const directionOffset = this.state.direction < 0?-40:0;
    const distance = Math.abs(store.npcPositions[npcIndex].x - store.characterPosition.x);
    return distance > 110+directionOffset;
  };

  move = (body, distance, npcState) => {
    const {store, npcIndex} = this.props;
    store.setNpcPosition({x: store.npcPositions[npcIndex].x + distance, y: store.npcPositions[npcIndex].y}, npcIndex);
    this.setState(Object.assign({},...this.state,{
      npcState,
      direction: store.npcPositions[npcIndex].x < store.characterPosition.x ? 1 : -1,
      repeat: true,
      loop: true,
    }));
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
    this.setState({
      npcState: 4,
      repeat: false,
      hasStopped:this.state.hasStopped + 1
    });
  };

  render() {
    return (
     <div style={this.getWrapperStyles()} className={`npc`} id={`npc_${this.props.npcIndex}`}>
       <Sprite
        ref={(sprite)=> {
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
        steps={[7, 7, 7, 7,0]}
        offset={[0, 0]}
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
        offset={[0, 0]}
        tileWidth={200}
        tileHeight={100}
        ticksPerFrame={3}
        top={-120}
        display={this.state.npcState !== 99 ? "none" : "block"}
       />
     </div>
    );
  }

}
