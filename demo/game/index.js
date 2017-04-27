import React, {Component, PropTypes} from 'react';
import {observer} from 'mobx-react';

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
import Ammo from './ammo';

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

  handleCharacterHit = () => {
    if(!this.state.isHit) {
      this.setState(Object.assign({},this.state,{
        hitCount:this.state.hitCount + 1,
        isHit: true,
      }));
    }
  };

  handleCharacterHitDone = () => {
    this.setState(Object.assign({},this.state,{
      isHit: false,
    }));
  };

  handleReload = () => {
    this.setState({
      ammo: 990
    });
  };

  resetLevel() {

  }

  constructor(props) {
    super(props);

    this.state = {
      fade: true,
      levelUpdate:false,
      isHit: false,
      hitCount: 0,
      ammo: 990
    };
    this.keyListener = new KeyListener();
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    window.context = window.context || new AudioContext();
  }

  componentDidMount() {
    this.player = new AudioPlayer('/assets/bg_music/Rescue.mp3', () => {
      this.stopMusic = this.player.play({loop: true, offset: 0, volume: 0.35});
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
      65,
      83, // s key
    ]);
  }

  componentWillUnmount() {
    this.stopMusic();
    this.keyListener.unsubscribe();
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
        <Stage style={{ background: '#000' }}>
            <Level store={GameStore}/>
          {!this.state.fade && <Corporal
              onEnterBuilding={this.handleEnterBuilding}
              onShoot={this.handleShoot}
              onReload={this.handleReload}
              isHit={this.state.isHit}
              hitCount={this.state.hitCount}
              store={GameStore}
              ammo={this.state.ammo}
              keys={this.keyListener}/>}
            {!this.state.fade && aliens}
            {!this.state.fade && faceHuggers}
            {!this.state.fade && eggs}
            <Ammo count={this.state.ammo}/>
        </Stage>
        <Fade visible={this.state.fade}/>
      </Loop>
    );
  }
}
