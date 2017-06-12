import {
  AudioPlayer,
  Sprite,
} from '../../src';

import React, {Component, PropTypes} from 'react';

export default class Explosion extends Component {
  componentDidMount() {
    const explodeSound = Math.floor(Math.random() * 3);
    this.explosionSound = new AudioPlayer(`assets/se/explode_${explodeSound}.ogg`, () => {
      this.explosionSound.play();
    });
  }

  componentWillUnmount() {

  }

  getWrapperStyles() {
    return {
      position: 'absolute',
      transformOrigin: 'center center',
    };
  }

  render() {
    return (
      <div  style={this.getWrapperStyles()} className={'explosion'} id={`explosion_${this.props.npcIndex}`}>
        <Sprite
          repeat={false}
          src={`assets/grenade_explode_${this.props.grenadeImage}.png`}
          scale={this.context.scale * 2}
          direction={this.props.direction}
          steps={[16]}
          offset={[0, 0]}
          tileWidth={64}
          tileHeight={64}
          ticksPerFrame={1}
          top={this.props.top}
          left={this.props.left}
          transformOrigin={'center center'}
        />
      </div>
    );
  }
};

Explosion.propTypes = {
  grenadeImage:PropTypes.number,
  direction:PropTypes.number,
  left:PropTypes.number,
  top:PropTypes.number
};

Explosion.contextTypes = {
  scale: PropTypes.number
};
