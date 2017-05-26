import React, {Component, PropTypes} from 'react';
import {observer} from 'mobx-react';

import {IS_MOBILE} from './constants';

import {
  AudioPlayer,
  Loop,
  Stage,
  KeyListener,
  World,
  Sprite
} from '../../src';

import Corporal from './corporal';
import Alien from './alien';
import FaceHugger from './faceHugger';
import Egg from './egg';
import Level from './level';
import Fade from './fade';
import UserInterface from './userInterface';
import MobileControls from './mobileControls';

import GameStore from './stores/game-store';

@observer
export default class Game extends Component {
  static propTypes = {
    onLeave: PropTypes.func,
  };

  handleEnterBuilding = (level) => {
    this.resetLevel();
    this.setState({
      fade: true,
    });
    setTimeout(() => {
      // this.props.onLeave(level);
      this.setState({
        fade: false,
        level
      });
    }, 1000);
  };

  handleShoot = () => {
    this.setState({
      ammo: this.state.ammo - 2
    });
  };

  handleGrenadeLaunch = () => {
    this.setState({
      grenadeAmmo: this.state.grenadeAmmo - 1,
      mobileControlsGrenade:false
    });
    GameStore.setCharacterIsAttackingGrenade(false);
  };

  handleCharacterHit = () => {
    if (!this.state.isHit) {
      this.setState(Object.assign({}, this.state, {
        hitCount: this.state.hitCount + 1,
        isHit: true,
      }));
    }
  };

  handleCharacterHitDone = () => {
    this.setState(Object.assign({}, this.state, {
      isHit: false,
    }));
  };

  handleReload = () => {
    this.setState({
      ammo: 990
    });
  };

  handleReloadGrenade = () => {
    this.setState({
      grenadeAmmo: 1
    });
  };

  resetLevel() {

  }

  constructor(props) {
    super(props);

    this.state = {
      fade: true,
      levelUpdate: false,
      isHit: false,
      mobileControlsShoot: false,
      mobileControlsGrenade: false,
      hitCount: 0,
      ammo: 990,
      grenadeAmmo: 0,
      mobileControlsDirection: ['neutral','neutral']
    };
    this.keyListener = new KeyListener();
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    window.context = window.context || new AudioContext();

    this.handleShootPressStart.bind(this);

  }

  componentDidMount() {
    this.player = new AudioPlayer('assets/bg_music/Rescue.mp3', () => {
      this.stopMusic = this.player.play({loop: true, offset: 0, volume: 0.1});
    });

    this.setState({
      fade: false,
    });

    this.keyListener.subscribe([
      this.keyListener.LEFT,
      this.keyListener.RIGHT,
      this.keyListener.UP,
      this.keyListener.DOWN,
      this.keyListener.SPACE,
      this.keyListener.A_KEY,
      this.keyListener.S_KEY,
      this.keyListener.D_KEY
    ]);
  }

  componentWillUnmount() {
    this.stopMusic();
    this.stopMotionTrackerSound();
    this.keyListener.unsubscribe();

  }

  handleShootPressStart(...args) {
    this.setState(Object.assign({}, ...this.state, {
      mobileControlsShoot: true
    }));
  }

  handleShootPressEnd(...args) {
    this.setState(Object.assign({}, ...this.state, {
      mobileControlsShoot: false
    }));
  }

  handleGrenadePressEnd(...args) {
    this.setState(Object.assign({}, ...this.state, {
      mobileControlsGrenade: true
    }));
  }

  handleDirectionLeftPadPressStart(event) {
    let direction = [...this.state.mobileControlsDirection];
    direction[0]='left';
    this.setState(Object.assign({}, ...this.state, {
      mobileControlsDirection: direction
    }));
  }

  handleDirectionRightPadPressStart(event) {
    let direction = [...this.state.mobileControlsDirection];
    direction[0]='right';
    this.setState(Object.assign({}, ...this.state, {
      mobileControlsDirection: direction
    }));
  }

  handleDirectionDownPadPressStart(event) {
    let direction = [...this.state.mobileControlsDirection];
    direction[1]='down';
    this.setState(Object.assign({}, ...this.state, {
      mobileControlsDirection: direction
    }));
  }

  handleDirectionPadPressEnd(event) {
    let direction = [];
    direction[0]='neutral';
    direction[1]='neutral';
    this.setState(Object.assign({}, ...this.state, {
      mobileControlsDirection: direction
    }));
  }




  render() {
    const aliens = GameStore.npcPositions.map((alien, i) => {
      return (
        <Alien key={i} store={GameStore} npcIndex={parseInt(i)} onCharacterHit={this.handleCharacterHit}
               onCharacterHitDone={this.handleCharacterHitDone}/>
      )
    });

    const eggs = GameStore.eggPositions.map((egg, i) => {
      return (
        <Egg key={i} store={GameStore} npcIndex={parseInt(i)} onCharacterHit={this.handleCharacterHit}
             onCharacterHitDone={this.handleCharacterHitDone}/>
      )
    });

    const faceHuggers = GameStore.faceHuggerPositions.map((faceHugger, i) => {
      return (
        <FaceHugger key={i} store={GameStore} npcIndex={parseInt(i)} onCharacterHit={this.handleCharacterHit}
                    onCharacterHitDone={this.handleCharacterHitDone}/>
      )
    });

    return (
      <Loop>
        <Stage style={{background: '#000'}}>
          <Level store={GameStore} fade={this.state.fade}/>
          {!this.state.fade && <Corporal
            onEnterBuilding={this.handleEnterBuilding}
            onShoot={this.handleShoot}
            onGrenadeLaunch={this.handleGrenadeLaunch}
            onReload={this.handleReload}
            onReloadGrenade={this.handleReloadGrenade}
            isHit={this.state.isHit}
            hitCount={this.state.hitCount}
            store={GameStore}
            ammo={this.state.ammo}
            grenadeAmmo={this.state.grenadeAmmo}
            mobileControlsShoot={this.state.mobileControlsShoot}
            mobileControlsGrenade={this.state.mobileControlsGrenade}
            mobileControlsDirection={this.state.mobileControlsDirection}
            keys={this.keyListener}/>}
          {!this.state.fade && aliens}
          {!this.state.fade && faceHuggers}
          {!this.state.fade && eggs}
          <Fade visible={this.state.fade}/>
          {IS_MOBILE && <MobileControls
            onShootPressStart={this.handleShootPressStart.bind(this)}
            onShootPressEnd={this.handleShootPressEnd.bind(this)}
            onGrenadePressEnd={this.handleGrenadePressEnd.bind(this)}
            onDirectionPadLeftPressStart={this.handleDirectionLeftPadPressStart.bind(this)}
            onDirectionPadRightPressStart={this.handleDirectionRightPadPressStart.bind(this)}
            onDirectionPadDownPressStart={this.handleDirectionDownPadPressStart.bind(this)}
            onDirectionPadLeftPressEnd={this.handleDirectionPadPressEnd.bind(this)}
            onDirectionPadRightPressEnd={this.handleDirectionPadPressEnd.bind(this)}
            onDirectionPadDownPressEnd={this.handleDirectionPadPressEnd.bind(this)}
            context={this.context}/>}
          <UserInterface context={this.context} ammo={this.state.ammo}/>
        </Stage>
      </Loop>
    );
  }
}
