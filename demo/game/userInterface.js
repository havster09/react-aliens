import React, {Component, PropTypes} from 'react';


import {
  AudioPlayer,
  Sprite
} from '../../src';

import Ammo from './ammo';

export default class userInterface extends Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  getWrapperStyles() {
    const {scale} = this.context;
    return {
      position: 'absolute',
      transform: `translate(${1 * scale}px, ${1 * scale}px)`
    };
  }

  handleTouchStart() {
    console.log('touch');
  }

  render() {
    return (
      <div style={this.getWrapperStyles()}>
        <Ammo count={this.props.ammo}/>
        <Sprite
          style={{overflow: 'hidden',position: 'absolute'}}
          tileWidth={146}
          tileHeight={96}
          left={350 * this.context.scale}
          top={475 * this.context.scale}
          repeat={false}
          src="assets/ammo_counter.png"
          scale={this.context.scale * 1}
          state={0}
          steps={[0]}
          ticksPerFrame={0}
        />
        <Sprite
          style={{overflow: 'hidden',position: 'absolute'}}
          tileWidth={96}
          tileHeight={96}
          left={500 * this.context.scale}
          top={475 * this.context.scale}
          repeat={true}
          src="assets/motion_tracker.png"
          scale={this.props.context * 1}
          state={0}
          steps={[6]}
          ticksPerFrame={6}
        />
      </div>
    );
  }


};

userInterface.propTypes = {
  ammo: PropTypes.number.isRequired
};

userInterface.contextTypes = {
  scale: PropTypes.number
};


