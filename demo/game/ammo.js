import React, {Component, PropTypes} from 'react';

export default class Ammo extends Component {
  render() {
    return (
      <div className="ammo-interface" style={{
        direction: 'rtl',
        left:395*this.context.scale,
        top:475*this.context.scale,
        position: 'absolute',
        width:60*this.context.scale}}>
        <p style={{textAlign: 'center',color:'red', fontSize:26*this.context.scale}}>{(`0${Math.floor(this.props.count/10)}`).slice(-2)}</p>
      </div>
    );
  }
};

Ammo.propTypes = {
    count: PropTypes.number.isRequired
};

Ammo.contextTypes = {
  scale: PropTypes.number
};
