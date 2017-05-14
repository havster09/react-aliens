import React, { Component, PropTypes } from 'react';
import Preloader from 'preloader.js'; //https://www.npmjs.com/package/preloader.js
import {IS_MOBILE} from './game/constants';
import { AudioPlayer } from '../src';

export default class Intro extends Component {
  static propTypes = {
    onStart: PropTypes.func,
  };

  startUpdate = () => {
    this.animationFrame = requestAnimationFrame(this.startUpdate);
  };

  handleKeyPress = (e) => {
    if (e.keyCode === 13) {
      this.props.onStart();
    }
  };

  constructor(props) {
    super(props);
    this.state = {
      loaded:false,
    };
  }

  componentWillMount() {
  }

  componentDidMount() {
    const model = this;
    const preloader = new Preloader({
      resources: [
        'assets/bg_music/Rescue.mp3',
        'assets/se/motion_tracker.wav',
        'assets/se/bite2.wav',
        'assets/se/mg-1.wav',
        'assets/se/m41.wav',
        'assets/se/mgbolt.ogg',
        'assets/se/reload.wav',
        'assets/se/role3_die1.wav',
        'assets/se/swipehit1.wav',
        'assets/d_pad_up.png',
        'assets/d_pad_down.png',
        'assets/d_pad_right.png',
        'assets/d_pad_left.png',
        'assets/corporal.png',
        'assets/egg.png',
        'assets/d_pad.png',
        'assets/pad_btn.png',
        'assets/egg_burst.png',
        'assets/egg_r_burst.png',
        'assets/pulse_rifle_shoot.png',
        'assets/pulse_rifle_crouch_shoot.png',
        'assets/giger_tile.png',
        'assets/hive_0.png',
        'assets/face_hugger.png',
        'assets/acid_0.png',
        'assets/tile_bg_outdoor_square.png',
        'assets/motion_tracker.png',
        'assets/bathroom_0.png',
        'assets/hangar_0.png',
        'assets/hospital_0.png',
        'assets/alien_0.png'],
      concurrency: 4
    });

    preloader.addProgressListener(function (loaded, length) {
      console.log('loading ', loaded, length, loaded / length)
    });

    preloader.addCompletionListener(function () {
      console.log('load completed');
      model.setState(Object.assign({},...model.state,{
        loaded:true
      }))
    });
    preloader.start();

    window.addEventListener('keypress', this.handleKeyPress);
    this.animationFrame = requestAnimationFrame(this.startUpdate);
  }

  componentWillUnmount() {
    window.removeEventListener('keypress', this.handleKeyPress);
    cancelAnimationFrame(this.animationFrame);
    clearInterval(this.interval);
  }

  render() {
    return (
      <div onClick={this.props.onStart}>
        <img className="intro" src="assets/intro.png"/>
        {!IS_MOBILE && <p className="instructions">S Key to shoot</p>}
        {this.state.loaded && <p className="start" style={{ display: 'block'}}>Press Start</p>}
        {!this.state.loaded && <p className="start" style={{ display: 'block'}}>Loading</p>}
      </div>
    );
  }
}
