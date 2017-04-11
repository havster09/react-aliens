import React, {Component, PropTypes} from 'react';
import Matter from 'matter-js';

import {
  AudioPlayer,
  Loop,
  Stage,
  KeyListener,
  World,
  Sprite
} from '../../src';

import Corporal from './corporal';
import Npc from './npc';
import Level from './level';
import Fade from './fade';
import Ammo from './ammo';

import GameStore from './stores/game-store';

export default class Game extends Component {


  static propTypes = {
    onLeave: PropTypes.func,
  };

  handleEnterBuilding = (index) => {
    this.setState({
      fade: true,
    });
    setTimeout(() => {
      this.props.onLeave(index);
    }, 500);
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

  constructor(props) {
    super(props);

    this.state = {
      fade: true,
      isHit: false,
      hitCount: 0,
      ammo: 990
    };
    this.keyListener = new KeyListener();
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    window.context = window.context || new AudioContext();
  }

  componentDidMount() {
    this.player = new AudioPlayer('/assets/Rescue.mp3', () => {
      this.stopMusic = this.player.play({loop: true, offset: 1, volume: 0.35});
    });


    this.setState({
      fade: false,
    });

    this.keyListener.subscribe([
      this.keyListener.LEFT,
      this.keyListener.RIGHT,
      this.keyListener.UP,
      this.keyListener.SPACE,
      65, 83
    ]);
  }

  componentWillUnmount() {
    this.stopMusic();
    this.keyListener.unsubscribe();
  }

  render() {
    const aliens = GameStore.npcPositions.map((alien, i) => {
      return (
        <Npc key={i} store={GameStore} npcIndex={parseInt(i)} onCharacterHit={this.handleCharacterHit} onCharacterHitDone={this.handleCharacterHitDone}/>
      )
    });

    return (
      <Loop>
        <Stage style={{ background: '#000' }}>
            <Level store={GameStore}/>
            <Corporal
              onEnterBuilding={this.handleEnterBuilding}
              onShoot={this.handleShoot}
              onReload={this.handleReload}
              isHit={this.state.isHit}
              hitCount={this.state.hitCount}
              store={GameStore}
              ammo={this.state.ammo}
              keys={this.keyListener}/>

            {aliens}
            <Ammo count={this.state.ammo}/>
        </Stage>
        <Fade visible={this.state.fade}/>
      </Loop>
    );
  }

}
