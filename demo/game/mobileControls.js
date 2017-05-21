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
            style={{overflow: 'hidden',position: 'absolute', opacity:.4}}
            transformOrigin="center top"
            tileWidth={100}
            tileHeight={77}
            left={20 * this.context.scale}
            top={430 * this.context.scale}
            repeat={false}
            src="assets/d_pad_left.png"
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
            style={{overflow: 'hidden',position: 'absolute', opacity:.4}}
            transformOrigin="center top"
            tileWidth={100}
            tileHeight={77}
            left={145 * this.context.scale}
            top={430 * this.context.scale}
            repeat={false}
            src="assets/d_pad_right.png"
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
            style={{overflow: 'hidden',position: 'absolute', opacity:.4}}
            transformOrigin="center top"
            tileWidth={89}
            tileHeight={93}
            left={90 * this.context.scale}
            top={480 * this.context.scale}
            repeat={false}
            src="assets/d_pad_down.png"
            scale={this.context.scale * 1}
            state={0}
            steps={[0]}
            ticksPerFrame={0}
          />
        </div>

        <div>
          <Sprite
            style={{overflow: 'hidden',position: 'absolute', opacity:.4}}
            transformOrigin="center top"
            tileWidth={89}
            tileHeight={102}
            left={90 * this.context.scale}
            top={360 * this.context.scale}
            repeat={false}
            src="assets/d_pad_up.png"
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
            style={{overflow: 'hidden',position: 'absolute', opacity:.4}}
            transformOrigin="center top"
            tileWidth={150}
            tileHeight={144}
            left={600 * this.context.scale}
            top={400 * this.context.scale}
            repeat={false}
            src="assets/pad_btn.png"
            scale={this.context.scale * 1}
            state={0}
            steps={[0]}
            ticksPerFrame={0}
          />
        </div>

        <div
          onClick={this.props.onGrenadePressEnd}>
          <Sprite
            style={{overflow: 'hidden',position: 'absolute', opacity:.4}}
            transformOrigin="center top"
            tileWidth={150}
            tileHeight={144}
            left={780 * this.context.scale}
            top={400 * this.context.scale}
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
  onGrenadePressEnd:PropTypes.func,
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


