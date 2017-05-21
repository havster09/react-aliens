import {
  AudioPlayer,
  Sprite,
} from '../../src';

import React, {Component, PropTypes} from 'react';

export default class Explosion extends Component {
  componentDidMount() {
    const explodeImg = Math.floor(Math.random() * 3);
    this.explosionSound = new AudioPlayer(`assets/se/explode_${explodeImg}.ogg`, () => {
      this.explosionSound.play();
    });
  }

  componentWillUnmount() {
  }

  render() {
    return (
      <div>
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
          top={Math.ceil(-100-Math.ceil(Math.random()*10))}
        />
      </div>
    );
  }
};

Explosion.propTypes = {
  grenadeImage:PropTypes.number,
  direction:PropTypes.number,
};

Explosion.contextTypes = {
  scale: PropTypes.number
};
