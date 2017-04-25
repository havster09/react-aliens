import React, { Component, PropTypes } from 'react';
import Preloader from 'preloader.js'; //https://www.npmjs.com/package/preloader.js
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
      blink: false,
      loaded:false,
    };
  }

  componentDidMount() {
    const model = this;
    const preloader = new Preloader({
      resources: [
        'assets/bg_music/Rescue.mp3',
        'assets/se/bite2.wav',
        'assets/se/mg-1.wav',
        'assets/se/m41.wav',
        'assets/se/mgbolt.ogg',
        'assets/se/reload.wav',
        'assets/se/role3_die1.wav',
        'assets/se/swipehit1.wav',
        'assets/corporal.png',
        'assets/egg.png',
        'assets/egg_burst.png',
        'assets/egg_r_burst.png',
        'assets/pulse_rifle_shoot.png',
        'assets/pulse_rifle_crouch_shoot.png',
        'assets/giger_tile.png',
        'assets/hive_0.png',
        'assets/face_hugger.png',
        'assets/acid_0.png',
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
    this.interval = setInterval(() => {
      this.setState({
        blink: !this.state.blink,
      });
    }, 500);
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
        {this.state.loaded && <p className="start" style={{ display: this.state.blink ? 'block' : 'none' }}>Press Start</p>}
        {!this.state.loaded && <p className="start" style={{ display: 'block'}}>Loading</p>}
      </div>
    );
  }
}
