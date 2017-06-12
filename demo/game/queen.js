import React, {Component, PropTypes} from 'react';
import {FACEHUGGER_FLOOR, EGG_FLOOR, RESPAWN_DISTANCE, FLOOR} from './constants';
import {observer} from 'mobx-react';

import {
  AudioPlayer,
  Sprite,
} from '../../src';
import Explosion from './explosion';


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

    this.isHit = false;
    this.isHitGrenade = false;
    this.isSnarl = false;
    this.isIdle = false;

    this.state = {
      npcState: 0,
      loop: false,
      spritePlaying: true,
      ticksPerFrame: 10,
      dead: false,
      direction: 1,
      hasStopped: 0,
      hasHit: 0,
      grenadeImage: Math.floor(Math.random()*9),
      explosionOffset:{y:Math.ceil(Math.random()*-50)-200,x:Math.ceil(Math.random()*50)+50}
    };
  }


  componentDidMount() {
    this.loopID = this.context.loop.subscribe(this.loop);
    this.queenScream = new AudioPlayer('assets/se/primalscreaming.wav');
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
      transformOrigin: 'left bottom',
    };
  }

  loop = () => {
    const {store, npcIndex} = this.props;

    if (!this.isJumping && !this.isHit && !this.isSnarl && !this.isIdle && !this.isHitGrenade) {
      this.queenAction(this.body);
    } else {
      if (this.isHit && this.state.spritePlaying === false) {
        this.isHit = false;
      }

      if (this.isHitGrenade && this.state.spritePlaying === false) {
        this.isHitGrenade = false;
        const explosion = store.explosionPositions.find((explosion) => explosion.npcIndex === 9999);
        if(explosion) {
          store.removeExplosion(9999);
        }
      }

      if (this.isSnarl && this.state.spritePlaying === false) {
        this.isSnarl = false;
      }

      if (this.isIdle && this.state.spritePlaying === false) {
        this.isIdle = false;
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

    if (store.characterIsAttackingGrenade && !this.state.dead) {
      if(Math.abs(store.queenPositions[npcIndex].x - store.characterPosition.x) < Math.random() * 100 + 400) {
        if ((store.queenPositions[npcIndex].x < store.characterPosition.x && store.characterDirection === -1)
         || (store.queenPositions[npcIndex].x > store.characterPosition.x && store.characterDirection === 1)) {
          store.addExplosion({
            npcIndex: 9999,
            x:store.queenPositions[npcIndex].x,
            y:store.characterPosition.y
          });
          return this.hitGrenade();
        }
      }
    }

    if (!this.isFar(300) && !this.state.dead) {

    }
    if (this.isOver() && !this.state.dead) {

    }

    if(!this.isFar(500) && Math.random() < .01 && this.state.spritePlaying === false) {
      return this.snarl();
    }
    return this.idle();
  };

  hit = () => {
    if (this.state.hasHit < 10000) {
      this.isHit = true;
      this.setState(Object.assign({}, this.state, {
        npcState:2,
        hasHit: this.state.hasHit + 1,
        repeat: false,
        ticksPerFrame: 10
      }));
    }
    else {
      return this.dead();
    }
  };

  hitGrenade = () => {
    if (this.state.hasHit < 10000) {
      this.isHitGrenade = true;
      this.setState(Object.assign({}, this.state, {
        npcState:2,
        hasHit: this.state.hasHit + 10,
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
      ticksPerFrame: 500,
      grenadeImage: Math.floor(Math.random()*9)
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
    this.isIdle = true;
    this.setState(Object.assign({}, this.state, {
      npcState: 1,
      ticksPerFrame: 10,
      repeat: false
    }));
  };

  snarl = () => {
    this.isSnarl = true;
    this.queenScream.play();
    this.setState(Object.assign({}, this.state, {
      npcState: 2,
      ticksPerFrame: 15,
      repeat: false
    }));
  };

  render() {
    const {store} = this.props;
    return (
      <div style={this.getWrapperStyles()} className={'npc'} id={`npc_${this.props.npcIndex}`}>
        <div style={{position:'absolute'}}>
          <Sprite ref={(sprite) => {this.body = sprite}}
                  repeat={this.state.repeat}
                  onPlayStateChanged={this.handlePlayStateChanged}
                  onGetContextLoop={this.getContextLoop}
                  src="assets/queen_sack.png"
                  scale={this.context.scale * 1}
                  direction={this.state.direction}
                  state={0}
                  steps={[
                    0, //0 idle
                  ]}
                  offset={[0, 0]}
                  tileWidth={396}
                  tileHeight={370}
          />
        </div>

        <div style={{position:'absolute'}}>
          <Sprite ref={(sprite) => {this.body = sprite}}
                  repeat={this.state.repeat}
                  onPlayStateChanged={this.handlePlayStateChanged}
                  onGetContextLoop={this.getContextLoop}
                  src="assets/queen.png"
                  scale={this.context.scale * 1}
                  direction={this.state.direction}
                  state={this.state.npcState}
                  steps={[
                    0,
                    4, //1 idle
                    2, //2 snarl
                  ]}
                  offset={[0, 0]}
                  tileWidth={408}
                  tileHeight={376}
                  ticksPerFrame={this.state.ticksPerFrame}
          />
        </div>

        {this.isHitGrenade &&
        <Explosion
          grenadeImage={this.state.grenadeImage}
          direction={this.state.direction}
          store={store}
          top={280*this.context.scale}
          left={Math.ceil(Math.random()*300)*this.context.scale}
        />}

        {this.isHitGrenade &&
        <Sprite
          repeat={true}
          src={"assets/egg_burst.png"}
          scale={this.context.scale * 1}
          direction={-1}
          steps={[6]}
          offset={[0, 0]}
          tileWidth={56}
          tileHeight={56}
          ticksPerFrame={10}
          top={280*this.context.scale}
          left={Math.ceil(Math.random()*300)*this.context.scale}
        />}

      </div>
    );
  }
}
