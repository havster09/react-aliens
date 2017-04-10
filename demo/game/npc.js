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
    this.isCrouchIdle = false;
    this.isLookBack = false;
    this.isSnarling = false;
    this.isWhiping = false;
    this.isHit = false;
    this.isDrop = false;
    this.isDown = false;
    this.isAmbush = false;
    this.isLanding = false;
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
    const position = Object.assign({},this.props.position);
    this.state = Object.assign({}, this.state, {position})
  }

  componentWillUnmount() {
    this.context.loop.unsubscribe(this.loopID);
  }

  getWrapperStyles() {
    const {store, npcIndex} = this.props;
    let npcPosition = this.state.position||Object.assign({},this.props.position);
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

    if (!this.isJumping && !this.isPunching && !this.isBiting && !this.isWhiping && !this.isLeaving && !this.isHit && !this.isDrop && !this.isDown && !this.isLanding && !this.isCrouchIdle && !this.isLookBack && !this.isSnarling) {
      this.npcAction(this.body);
      if (this.isAmbush && this.state.spritePlaying === false) {
        this.isAmbush = false;
      }
    } else {
      if (this.isPunching && this.state.spritePlaying === false) {
        this.isPunching = false;
      }

      if (this.isBiting && this.state.spritePlaying === false) {
        this.isBiting = false;
      }

      if (this.isLookBack && this.state.spritePlaying === false) {
        this.isLookBack = false;
      }

      if (this.isSnarling && this.state.spritePlaying === false) {
        this.isSnarling = false;
      }

      if (this.isCrouchIdle && this.state.spritePlaying === false) {
        this.isCrouchIdle = false;
        return this.ambush();
      }

      if (this.isWhiping && this.state.spritePlaying === false) {
        this.isWhiping = false;
      }

      if (this.isHit && this.state.spritePlaying === false) {
        this.isHit = false;
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
    this.lastX = this.state.position.x;
  };

  npcAction = (body) => {
    const {store, npcIndex} = this.props;
    let npcState = this.state.npcState;
    if (store.characterIsAttacking && this.state.position.y > 360) {
      if (Math.abs(this.state.position.x - store.characterPosition.x) < Math.random() * 100 + 400) {
        if (this.state.position.x < store.characterPosition.x && store.characterDirection === -1) {
          return this.hit();
        }
        else if (this.state.position.x > store.characterPosition.x && store.characterDirection === 1) {
          return this.hit();
        }
      }
    }

    if (this.state.position.y  < 370  && npcState !== 16 && npcState !== 14) {
      return this.crouchIdle();
    }
    else if(this.state.position.y  < 370 && npcState === 14) {
      return this.setNpcPosition({x: this.state.position.x, y: this.state.position.y+10}, npcIndex);
    }
    else if(this.state.position.y  === 370 && npcState === 14 && npcState !== 15) {
      return this.land();
    }


    if (this.isBehind()) {
      this.turn(1);
    }
    else {
      this.turn(-1);
    }

    if (this.isFar()) {
      if(Math.random()<.5 && this.state.hasStopped % 2 === 0 && npcState < 3) {
        if(Math.random()<.2) {
          return this.lookBack();
        }
        else {
          return this.snarl();
        }
      }
      if (this.state.hasStopped % 2 > 0) {
        npcState = this.state.position.x < store.characterPosition.x ? 0 : 1;
      }
      else {
        npcState = this.state.position.x < store.characterPosition.x ? 2 : 3;
      }
      const distance = this.state.position.x < store.characterPosition.x ? 3 : -3;
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

  setNpcPosition = (position, npcIndex) => {
    this.setState(Object.assign({},this.state,{position}));
  };

  hit = () => {
    const {store, npcIndex} = this.props;
    const direction = this.state.position.x < store.characterPosition.x ? 1 : -1;
    if (this.state.hasHit < 3) {
      this.isHit = true;
      const distance = direction < 0 ? Math.ceil(Math.random() * 10) : 0 - Math.ceil(Math.random() * 10);
      this.setNpcPosition({x: this.state.position.x + distance, y: this.state.position.y}, npcIndex);
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
    const direction = this.state.position.x < store.characterPosition.x ? 1 : -1;
    const distance = direction < 0 ? Math.ceil(Math.random() * 28) : 0 - Math.ceil(Math.random() * 28);
    this.setNpcPosition({
      x: this.state.position.x + distance * 5,
      y: this.state.position.y
    }, npcIndex);
    this.setState(Object.assign({}, this.state, {
      npcState:Math.random() < .5 ? 10 : 11,
      hasHit: this.state.hasHit + 1,
      direction,
      repeat: false,
      ticksPerFrame: 10
    }));
  };

  respawn = () => {
    const {store, npcIndex} = this.props;
    const direction = this.state.position.x < store.characterPosition.x ? 1 : -1;
    let distance = 0;
    let npcState = 4;
    if(Math.random()<.5) {
      distance = direction < 0 ? Math.ceil(Math.random() * 1000) + 1000 : -1000 - Math.ceil(Math.random() * 1000);
      this.setNpcPosition({x: store.characterPosition.x + distance, y: this.state.position.y}, npcIndex);
    }
    else {
      let npcState = 14;
      if(store.characterDirection < 0) {
        distance = Math.ceil(Math.random() * 200+100);
      }
      else {
        distance = 0-Math.ceil(Math.random() * 200+100);
      }

      this.setNpcPosition({x: store.characterPosition.x + distance, y: this.state.position.y-200}, npcIndex);
    }
    this.setState(Object.assign({}, this.state, {
      npcState,
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
      ticksPerFrame: 100 // respawn time
    }));
  };

  land = () => {
    this.isLanding = true;
    this.setState(Object.assign({}, this.state, {
      npcState: 15,
      repeat: false,
      ticksPerFrame: 10
    }));
  };

  isBehind() {
    const {store, npcIndex} = this.props;
    const turnOffset = this.state.position.x < store.characterPosition.x ? -1000 : 1000;
    return this.state.position.x < store.characterPosition.x - turnOffset;
  }

  turn(direction) {
    const {npcIndex} = this.props;
    this.lastDirection = direction;
    this.setState(Object.assign({}, this.state, {
      direction: direction
    }));
  }

  isFar = () => {
    const {store, npcIndex} = this.props;
    const directionOffset = this.state.direction < 0 ? -40 : 0;
    const distance = Math.abs(this.state.position.x - store.characterPosition.x);
    return distance > 110 + directionOffset;
  };

  move = (body, distance, npcState) => {
    const {store, npcIndex} = this.props;
    this.setNpcPosition({x: this.state.position.x + distance, y: this.state.position.y}, npcIndex);
    this.setState(Object.assign({}, this.state, {
      npcState,
      direction: this.state.position.x < store.characterPosition.x ? 1 : -1,
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

  ambush = () => {
    this.isAmbush = true;
    this.setState(Object.assign({}, this.state, {
      npcState: 14,
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

  lookBack = () => {
    this.isLookBack = true;
    this.setState(Object.assign({}, this.state, {
      npcState: 17,
      ticksPerFrame: 10,
      hasStopped: this.state.hasStopped + 1,
      repeat: false
    }));
  };

  snarl = () => {
    this.isSnarling = true;
    this.setState(Object.assign({}, this.state, {
      npcState: 18,
      ticksPerFrame: 10,
      hasStopped: this.state.hasStopped + 1,
      repeat: false
    }));
  };

  crouchIdle = () => {
    const {store, npcIndex} = this.props;
    this.isCrouchIdle = true;
    this.setState(Object.assign({}, this.state, {
      npcState: 16,
      direction: this.state.position.x < store.characterPosition.x ? 1 : -1,
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
            1,// drop 2
            1,
            1,
            2, // ambush
            1, // land
            2, //16 crouchIdle
            3, // 17 lookBack
            2 // 18 snarl
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
          display={this.state.npcState === 8 ? "block" : "none"}
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
          ticksPerFrame={1}
          top={-90}
          display={this.state.npcState === 11? "block" : "none"}
        />
      </div>
    );
  }

}
