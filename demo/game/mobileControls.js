import React, {Component, PropTypes} from 'react';


import {
  Sprite
} from '../../src';

export default class mobileControls extends Component {
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

  onDirectionPadPressStart(event) {
    this.props.onDirectionPadPressStart(event,this.context.scale);
  }

  render() {
    return (
      <div style={this.getWrapperStyles()}>
        <div
          onTouchStart={this.onDirectionPadPressStart.bind(this)}
          onTouchEnd={this.props.onDirectionPadPressEnd}>
          <Sprite
            elementId="directional-pad"
            style={{overflow: 'hidden',position: 'absolute'}}
            transformOrigin="center top"
            tileWidth={100}
            tileHeight={100}
            left={100 * this.context.scale}
            top={470 * this.context.scale}
            repeat={false}
            src="assets/pad_dir.png"
            scale={this.context.scale * 1}
            state={0}
            steps={[0]}
            ticksPerFrame={0}
          />
        </div>

        <div
          style={
            {opacity:0.4}
          }
          onTouchStart={this.props.onShootPressStart}
          onTouchEnd={this.props.onShootPressEnd}>
          <Sprite
            style={{overflow: 'hidden',position: 'absolute'}}
            transformOrigin="center top"
            tileWidth={80}
            tileHeight={80}
            left={760 * this.context.scale}
            top={480 * this.context.scale}
            repeat={false}
            src="assets/pad_btn.png"
            scale={this.context.scale * 1}
            state={0}
            steps={[0]}
            ticksPerFrame={0}
          />
        </div>
      </div>
    );
  }


};

mobileControls.propTypes = {
  onShootPressStart:PropTypes.func,
  onShootPressEnd:PropTypes.func,
  onDirectionPadPressStart:PropTypes.func,
  onDirectionPadPressEnd:PropTypes.func
};

mobileControls.contextTypes = {
  scale: PropTypes.number
};


