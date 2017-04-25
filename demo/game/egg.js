import React, {Component, PropTypes} from 'react';
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
      if (store.characterIsCrouching && store.eggPositions[npcIndex].y > 390) {
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

    if (!this.isFar() && !this.state.dead) {
      this.hatch();
    }
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
    const {store, npcIndex} = this.props;
    let npcState = 1;
    this.setState(Object.assign({}, this.state, {
      npcState,
      dead:true,
      hasHit: this.state.hasHit + 1,
      repeat: true,
      ticksPerFrame: 60
    }));
  };

  respawn = () => {
    const {store, npcIndex} = this.props;
    const direction = store.eggPositions[npcIndex].x < store.characterPosition.x ? 1 : -1;
    let distance = 0;
    let npcState = 2;
    if(Math.random()<.5) {
      distance = direction < 0 ? Math.ceil(Math.random() * 1000) + 1000 : -1000 - Math.ceil(Math.random() * 1000);
      store.setNpcPosition({x: store.characterPosition.x + distance, y: store.eggPositions[npcIndex].y}, npcIndex);
    }
    else {
      if(store.characterDirection < 0) {
        distance = Math.ceil(Math.random() * 200+100);
      }
      else {
        distance = 0-Math.ceil(Math.random() * 200+100);
      }

      store.setNpcPosition({x: store.characterPosition.x + distance, y: store.eggPositions[npcIndex].y}, npcIndex);
    }
    this.setState(Object.assign({}, this.state, {
      npcState,
      hasHit: 0,
      direction,
      repeat: false,
      decapitated: false,
      ticksPerFrame: 500
    }));
  };

  isFar = () => {
    const {store, npcIndex} = this.props;
    const directionOffset = this.state.direction < 0 ? -40 : 0;
    const distance = Math.abs(store.eggPositions[npcIndex].x - store.characterPosition.x);
    return distance > 300 + directionOffset;
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
          scale={this.context.scale * 1.2}
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
        />
        {this.isHit &&
        <Sprite
          repeat={this.state.repeat}
          src={store.characterDirection>0?"assets/egg_burst.png":"assets/egg_r_burst.png"}
          scale={this.context.scale * 1}
          direction={store.characterDirection}
          steps={[6]}
          offset={[0, 0]}
          tileWidth={56}
          tileHeight={56}
          ticksPerFrame={3}
          top={-50}
          left={store.characterDirection>0?30:-60}
        />}
      </div>
    );
  }

}
