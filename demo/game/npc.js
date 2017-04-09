import React, {Component, PropTypes} from 'react';
import {observer} from 'mobx-react';

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
    this.isBiting = false;
    this.isWhiping = false;
    this.isHit = false;
    this.isDrop = false;
    this.isDown = false;
    this.isLeaving = false;
    this.lastX = 0;
    this.lastDirection = -1;


    this.state = {
      npcState: 4,
      loop: true,
      spritePlaying: true,
      ticksPerFrame: 5,
      direction: -1,
      hasStopped: Math.random() < .5 ? 0 : 1,
      hasHit: Math.random() < .5 ? 0 : 1,
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

    if (!this.isJumping && !this.isPunching && !this.isBiting && !this.isWhiping && !this.isLeaving && !this.isHit && !this.isDrop && !this.isDown) {
      this.npcAction(this.body);
    } else {
      if (this.isPunching && this.state.spritePlaying === false) {
        this.isPunching = false;
      }

      if (this.isBiting && this.state.spritePlaying === false) {
        this.isBiting = false;
      }

      if (this.isWhiping && this.state.spritePlaying === false) {
        this.isWhiping = false;
      }

      if (this.isHit && this.state.spritePlaying === false) {
        this.isHit = false;
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
    this.lastX = store.npcPositions[npcIndex].x;
  };

  npcAction = (body) => {
    const {store, npcIndex} = this.props;
    let npcState = this.state.npcState;

    if (store.characterIsAttacking) {
      if (Math.abs(store.npcPositions[npcIndex].x - store.characterPosition.x) < Math.random() * 100 + 400) {
        if (store.npcPositions[npcIndex].x < store.characterPosition.x && store.characterDirection === -1) {
          return this.hit();
        }
        else if (store.npcPositions[npcIndex].x > store.characterPosition.x && store.characterDirection === 1) {
          return this.hit();
        }
      }
    }


    if (this.isBehind()) {
      this.turn(1);
    }
    else {
      this.turn(-1);
    }

    if (this.isFar()) {
      if (this.state.hasStopped % 2 > 0) {
        npcState = store.npcPositions[npcIndex].x < store.characterPosition.x ? 0 : 1;
      }
      else {
        npcState = store.npcPositions[npcIndex].x < store.characterPosition.x ? 2 : 3;
      }
      const distance = store.npcPositions[npcIndex].x < store.characterPosition.x ? 3 : -3;
      this.move(body, distance, npcState);
    }
    else if (this.state.npcState !== 4) {
      this.stop();
    }
    else if (this.state.npcState === 4) {
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
    const direction = store.npcPositions[npcIndex].x < store.characterPosition.x ? 1 : -1;
    if (this.state.hasHit < 3) {
      this.isHit = true;
      const distance = direction < 0 ? Math.ceil(Math.random() * 10) : 0 - Math.ceil(Math.random() * 10);
      store.setNpcPosition({x: store.npcPositions[npcIndex].x + distance, y: store.npcPositions[npcIndex].y}, npcIndex);
      this.setState(Object.assign({}, this.state, {
        npcState: this.state.hasHit % 2 > 0 ? 8 : 9,
        hasHit: this.state.hasHit + 1,
        direction,
        repeat: false,
        ticksPerFrame: 10
      }));
    }
    else {
      return this.drop();
    }
  };

  drop = () => {
    this.isDrop = true;
    const {store, npcIndex} = this.props;
    const direction = store.npcPositions[npcIndex].x < store.characterPosition.x ? 1 : -1;
    const distance = direction < 0 ? Math.ceil(Math.random() * 28) : 0 - Math.ceil(Math.random() * 28);
    store.setNpcPosition({
      x: store.npcPositions[npcIndex].x + distance * 5,
      y: store.npcPositions[npcIndex].y
    }, npcIndex);
    this.setState(Object.assign({}, this.state, {
      npcState:Math.random() < .5 ? 10 : 11,
      hasHit: this.state.hasHit + 1,
      direction,
      repeat: false,
      ticksPerFrame: 6
    }));
  };

  respawn = () => {
    const {store, npcIndex} = this.props;
    const direction = store.npcPositions[npcIndex].x < store.characterPosition.x ? 1 : -1;
    const distance = direction < 0 ? Math.ceil(Math.random() * 1000) + 1000 : -1000 - Math.ceil(Math.random() * 1000);
    store.setNpcPosition({x: store.characterPosition.x + distance, y: store.npcPositions[npcIndex].y}, npcIndex);
    this.setState(Object.assign({}, this.state, {
      npcState: 4,
      hasHit: 0,
      direction,
      repeat: false,
      ticksPerFrame: 500
    }));
  };

  down = () => {
    this.isDown = true;
    this.setState(Object.assign({}, this.state, {
      npcState: this.state.npcState === 10 ? 12 : 13,
      repeat: false,
      ticksPerFrame: 50 // respawn time
    }));
  };

  isBehind() {
    const {store, npcIndex} = this.props;
    const turnOffset = store.npcPositions[npcIndex].x < store.characterPosition.x ? -1000 : 1000;
    return store.npcPositions[npcIndex].x < store.characterPosition.x - turnOffset;
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
    const directionOffset = this.state.direction < 0 ? -40 : 0;
    const distance = Math.abs(store.npcPositions[npcIndex].x - store.characterPosition.x);
    return distance > 110 + directionOffset;
  };

  move = (body, distance, npcState) => {
    const {store, npcIndex} = this.props;
    store.setNpcPosition({x: store.npcPositions[npcIndex].x + distance, y: store.npcPositions[npcIndex].y}, npcIndex);
    this.setState(Object.assign({}, this.state, {
      npcState,
      direction: store.npcPositions[npcIndex].x < store.characterPosition.x ? 1 : -1,
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
    this.setState(Object.assign({}, this.state, {
      npcState: 5,
      ticksPerFrame: 5,
      repeat: false
    }));
  };

  bite = () => {
    this.isBiting = true;
    this.setState(Object.assign({}, this.state, {
      npcState: 6,
      ticksPerFrame: 10,
      repeat: false
    }));
  };

  whip = () => {
    this.isWhiping = true;
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
            1,//drop 2
            1,
            1
            ]}
          offset={[0, 0]}
          tileWidth={200}
          tileHeight={100}
          ticksPerFrame={this.state.ticksPerFrame}
        />
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
          top={Math.ceil(-90-Math.ceil(Math.random()*10))}
          display={this.state.npcState === 9 || this.state.npcState === 10 ? "block" : "none"}
        />
        <Sprite
          repeat={this.state.repeat}
          src="assets/armor_hit.png"
          scale={this.context.scale * 1}
          direction={this.state.direction}
          steps={[5]}
          offset={[0, 0]}
          tileWidth={200}
          tileHeight={100}
          ticksPerFrame={6}
          top={-90}
          display={this.state.npcState === 8? "block" : "none"}
        />
      </div>
    );
  }

}
