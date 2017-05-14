import React, {Component, PropTypes} from 'react';
import {FACEHUGGER_FLOOR, EGG_FLOOR, RESPAWN_DISTANCE} from './constants';
import {observer} from 'mobx-react';

import {
  AudioPlayer,
  Body,
  Sprite,
} from '../../src';


@observer
export default class Egg extends Component {
  static propTypes = {
    npcIndex: PropTypes.number,
    keys: PropTypes.object,
    onCharacterHit: PropTypes.func,
    onCharacterHitDone: PropTypes.func,
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
    this.isHatching = false;
    this.isDown = false;
    this.isAmbush = false;
    this.isLanding = false;
    this.hasLatched = false;
    this.lastX = 0;
    this.lastDirection = -1;


    this.state = {
      npcState: 2,
      loop: false,
      spritePlaying: true,
      ticksPerFrame: 5,
      hatched:false,
      dead:false,
      direction: 1,
      hasStopped: 0,
      hasHit: 0,
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
    const npcPosition = store.eggPositions[npcIndex];
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

    if (!this.isJumping && !this.isHatching) {
      this.eggAction(this.body);
    } else {
      if (this.isHatching && this.state.spritePlaying === false) {
        this.isHatching = false;
        store.setEggPosition({x: store.eggPositions[npcIndex].x, y: store.eggPositions[npcIndex].y, hatched:true}, npcIndex);
        const direction = store.eggPositions[npcIndex].x < store.characterPosition.x ? 1 : -1;
        const distance = direction < 0?-60:-30;
        store.addFaceHugger({x: store.eggPositions[npcIndex].x+distance, y: FACEHUGGER_FLOOR+-30,npcState:2});
      }

      if (this.isHit && this.state.spritePlaying === false) {
        this.isHit = false;
      }

      if (this.isDrop && this.state.spritePlaying === false) {
        this.isDrop = false;
      }

      if (this.isDown && this.state.spritePlaying === false) {
        this.isDown = false;
        return this.respawn();
      }
    }
    this.lastX = store.eggPositions[npcIndex].x;
  };

  eggAction = (body) => {
    const {store, npcIndex} = this.props;
    let npcState = this.state.npcState;
    if(store.characterIsAttacking && !this.state.dead) {
      if (store.characterIsCrouching && store.eggPositions[npcIndex].y === EGG_FLOOR) {
        if (Math.abs(store.eggPositions[npcIndex].x - store.characterPosition.x) < Math.random() * 100 + 400) {
          if (store.eggPositions[npcIndex].x < store.characterPosition.x && store.characterDirection === -1) {
            return this.hit();
          }
          else if (store.eggPositions[npcIndex].x > store.characterPosition.x && store.characterDirection === 1) {
            return this.hit();
          }
        }
      }
    }

    if (!this.isFar(300) && !this.state.dead && !store.eggPositions[npcIndex].hatched) {
      this.hatch();
    }
    if (this.isOver() && !this.state.dead && !this.hasLatched && this.state.hatched) {
      // this.latch();
    }
  };

  latch = () => {
    const {store} = this.props;
    this.hasLatched = true;
    store.setCharacterLatched(true);
  };

  hit = () => {
    const {store, npcIndex} = this.props;
    if (this.state.hasHit < 30) {
      this.isHit = true;
      this.setState(Object.assign({}, this.state, {
        hasHit: this.state.hasHit + 1,
        repeat: false,
        ticksPerFrame: 10
      }));
    }
    else {
      return this.dead();
    }
  };

  dead = () => {
    this.isDrop = true;
    let npcState = 1;
    this.setState(Object.assign({}, this.state, {
      npcState,
      dead:true,
      hasHit: this.state.hasHit + 1,
      repeat: true,
      ticksPerFrame: 30
    }));
  };

  respawn = () => {
    const {store, npcIndex} = this.props;
    const direction = store.eggPositions[npcIndex].x < store.characterPosition.x ? 1 : -1;
    let npcState = 2;
    let distance = direction < 0 ? Math.ceil(Math.random() * RESPAWN_DISTANCE) + RESPAWN_DISTANCE : 0 - Math.ceil(Math.random() * RESPAWN_DISTANCE) - RESPAWN_DISTANCE;
    store.setEggPosition({x: store.characterPosition.x + distance, y: store.eggPositions[npcIndex].y}, npcIndex);
    this.setState(Object.assign({}, this.state, {
      npcState,
      hasHit: 0,
      direction,
      repeat: false,
      decapitated: false,
      ticksPerFrame: 500
    }));
  };

  isFar = (dist) => {
    const {store, npcIndex} = this.props;
    const directionOffset = this.state.direction < 0 ? -40 : 0;
    const distance = Math.abs(store.eggPositions[npcIndex].x - store.characterPosition.x);
    return distance > dist + directionOffset;
  };

  isOver = () => {
    const {store, npcIndex} = this.props;
    const distance = store.eggPositions[npcIndex].x - store.characterPosition.x;
    return distance < 55 && distance > 45;
  };


  hatch = () => {
    this.isHatching = true;
    this.setState(Object.assign({}, this.state, {
      npcState: 0,
      hatched:true,
      ticksPerFrame: 5,
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
    const {store} = this.props;
    return (
      <div style={this.getWrapperStyles()} className={'npc'} id={`npc_${this.props.npcIndex}`}>
        <Sprite
          ref={(sprite)=> {
          this.body = sprite
            }
          }
          repeat={this.state.repeat}
          onPlayStateChanged={this.handlePlayStateChanged}
          onGetContextLoop={this.getContextLoop}
          src="assets/egg.png"
          scale={this.context.scale * 1.3}
          direction={this.state.direction}
          state={this.state.npcState}
          steps={[
            4, //0 open
            4, //1 die
            0, //2 idle
            ]}
          offset={[0, 0]}
          tileWidth={32}
          tileHeight={32}
          ticksPerFrame={this.state.ticksPerFrame}
          transformOrigin="center top"
        />
        {this.isHit &&
        <Sprite
          repeat={false}
          src={store.characterDirection>0?"assets/egg_burst.png":"assets/egg_r_burst.png"}
          scale={this.context.scale * 1}
          direction={store.characterDirection}
          steps={[6]}
          offset={[0, 0]}
          tileWidth={56}
          tileHeight={56}
          ticksPerFrame={3}
          top={-40}
          transformOrigin="left top"
          left={store.characterDirection>0?56*this.context.scale/2:0-(56*this.context.scale)}
        />}
      </div>
    );
  }

}
