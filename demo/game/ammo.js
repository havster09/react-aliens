import React from 'react';
import * as PropTypes from "react/lib/ReactPropTypes";

const ammo = ({count}) => {
    return (
        <div className="ui" style={{width: 300 ,height: 138,overflow: 'hidden',position: 'absolute'}}>
            <p>AMMO {count}</p>
        </div>
    );
};

ammo.propTypes = {
    count: PropTypes.number.isRequired
};

export default ammo;
