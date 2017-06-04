import React, {Component, PropTypes} from 'react';
import {FACEHUGGER_FLOOR, EGG_FLOOR, RESPAWN_DISTANCE} from './constants';
import {observer} from 'mobx-react';

import {
  AudioPlayer,
  Sprite,
} from '../../src';


@observer
export default class Queen extends Component {
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
    this.contextLoop = contextLoop
  };

  constructor(props) {
    super(props);
    this.loopID = null;
    this.contextLoop = null;


    this.state = {
      npcState: 0,
      loop: false,
      spritePlaying: true,
      ticksPerFrame: 5,
      dead: false,
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
    const npcPosition = store.queenPositions[npcIndex];
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
      this.queenAction(this.body);
    } else {

      if (this.isHit && this.state.spritePlaying === false) {
        this.isHit = false;
      }

      if (this.isDown && this.state.spritePlaying === false) {
        this.isDown = false;
        return this.respawn();
      }
    }
  };

  queenAction = (body) => {
    const {store, npcIndex} = this.props;
    let npcState = this.state.npcState;
    if (store.characterIsAttacking && !this.state.dead) {
      if (Math.abs(store.queenPositions[npcIndex].x - store.characterPosition.x) < Math.random() * 100 + 400) {
        if (store.queenPositions[npcIndex].x < store.characterPosition.x && store.characterDirection === -1) {
          return this.hit();
        }
        else if (store.queenPositions[npcIndex].x > store.characterPosition.x && store.characterDirection === 1) {
          return this.hit();
        }
      }

    }

    if (!this.isFar(300) && !this.state.dead) {

    }
    if (this.isOver() && !this.state.dead) {

    }
  };

  hit = () => {
    const {store, npcIndex} = this.props;
    if (this.state.hasHit < 10000) {
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
      dead: true,
      hasHit: this.state.hasHit + 1,
      repeat: true,
      ticksPerFrame: 30
    }));
  };

  respawn = () => {
    const {store, npcIndex} = this.props;
    const direction = store.queenPositions[npcIndex].x < store.characterPosition.x ? 1 : -1;
    let npcState = 0;
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
    const distance = Math.abs(store.queenPositions[npcIndex].x - store.characterPosition.x);
    return distance > dist + directionOffset;
  };

  isOver = () => {
    const {store, npcIndex} = this.props;
    const distance = store.queenPositions[npcIndex].x - store.characterPosition.x;
    return distance < 55 && distance > 45;
  };

  stop = () => {
    this.setState(Object.assign({}, this.state, {
      npcState: 0,
      ticksPerFrame: 300,
      repeat: false,
      hasStopped: this.state.hasStopped + 1
    }));
  };

  idle = () => {
    this.setState(Object.assign({}, this.state, {
      npcState: 1,
      ticksPerFrame: 30,
      repeat: false,
      hasStopped: this.state.hasStopped + 1
    }));
  };

  render() {
    const {store} = this.props;
    return (
      <div style={this.getWrapperStyles()} className={'npc'} id={`npc_${this.props.npcIndex}`}>
        <Sprite ref={(sprite) => {this.body = sprite}}
                repeat={this.state.repeat}
                onPlayStateChanged={this.handlePlayStateChanged}
                onGetContextLoop={this.getContextLoop}
                src="assets/queen_sack.png"
                scale={this.context.scale * 1.9}
                direction={this.state.direction}
                state={0}
                steps={[
                  0, //0 idle
                ]}
                offset={[0, 0]}
                tileWidth={204}
                tileHeight={188}
                ticksPerFrame={this.state.ticksPerFrame}
                transformOrigin="center top"
        />
        <Sprite ref={(sprite) => {this.body = sprite}}
                repeat={this.state.repeat}
                onPlayStateChanged={this.handlePlayStateChanged}
                onGetContextLoop={this.getContextLoop}
                src="assets/queen.png"
                scale={this.context.scale * 1.9}
                direction={this.state.direction}
                state={this.state.npcState}
                steps={[
                  4, //0 idle
                ]}
                offset={[0, 0]}
                tileWidth={204}
                tileHeight={188}
                ticksPerFrame={this.state.ticksPerFrame}
                transformOrigin="center top"
                top={-190}
        />
        {this.isHit &&
        <Sprite
          repeat={true}
          src={store.characterDirection > 0 ? "assets/egg_burst.png" : "assets/egg_r_burst.png"}
          scale={this.context.scale * 1}
          direction={-1}
          steps={[6]}
          offset={[0, 0]}
          tileWidth={56}
          tileHeight={56}
          ticksPerFrame={3}
          top={-40}
          transformOrigin="center top"
        />}
      </div>
    );
  }
}
