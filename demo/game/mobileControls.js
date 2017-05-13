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
      transform: `translate(${1 * scale}px, ${1 * scale}px)`,
      style: {opacity:.4}
    };
  }

  render() {
    return (
      <div style={this.getWrapperStyles()}>

        <div
          onTouchStart={this.props.onDirectionPadLeftPressStart}
          onTouchEnd={this.props.onDirectionPadLeftPressEnd}>
          <Sprite
            style={{overflow: 'hidden',position: 'absolute'}}
            transformOrigin="center top"
            tileWidth={100}
            tileHeight={100}
            left={100 * this.context.scale}
            top={450 * this.context.scale}
            repeat={false}
            src="assets/d_pad.png"
            scale={this.context.scale * 1}
            state={0}
            steps={[0]}
            ticksPerFrame={0}
          />
        </div>

        <div
          onTouchStart={this.props.onDirectionPadRightPressStart}
          onTouchEnd={this.props.onDirectionPadRightPressEnd}>
          <Sprite
            style={{overflow: 'hidden',position: 'absolute'}}
            transformOrigin="center top"
            tileWidth={100}
            tileHeight={100}
            left={200 * this.context.scale}
            top={450 * this.context.scale}
            repeat={false}
            src="assets/d_pad.png"
            scale={this.context.scale * 1}
            state={0}
            steps={[0]}
            ticksPerFrame={0}
          />
        </div>

        <div
          onTouchStart={this.props.onDirectionPadDownPressStart}
          onTouchEnd={this.props.onDirectionPadDownPressEnd}>
          <Sprite
            style={{overflow: 'hidden',position: 'absolute'}}
            transformOrigin="center top"
            tileWidth={100}
            tileHeight={100}
            left={150 * this.context.scale}
            top={500 * this.context.scale}
            repeat={false}
            src="assets/d_pad.png"
            scale={this.context.scale * 1}
            state={0}
            steps={[0]}
            ticksPerFrame={0}
          />
        </div>

        <div
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
  onDirectionPadLeftPressStart:PropTypes.func,
  onDirectionPadLeftPressEnd:PropTypes.func,
  onDirectionPadRightPressStart:PropTypes.func,
  onDirectionPadRightPressEnd:PropTypes.func,
  onDirectionPadDownPressStart:PropTypes.func,
  onDirectionPadDownPressEnd:PropTypes.func
};

mobileControls.contextTypes = {
  scale: PropTypes.number
};


