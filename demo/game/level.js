import React, { Component, PropTypes } from 'react';
import { autorun } from 'mobx';

import {
  TileMap,
} from '../../src';

import GameStore from './stores/game-store';

export default class Level extends Component {

  static propTypes = {
    store: PropTypes.object,
    fade: PropTypes.bool,
  };

  static contextTypes = {
    scale: PropTypes.number,
  };

  constructor(props) {
    super(props);

    this.state = {
      stageX: 0,
    };
  }

  componentDidMount() {
    this.cameraWatcher = autorun(() => {
      const targetX = Math.round(GameStore.stageX * this.context.scale);
      this.setState({
        stageX: targetX,
      });
    });
  }

  componentWillReceiveProps(nextProps, nextContext) {
    const targetX = Math.round(GameStore.stageX * nextContext.scale);
    this.setState({
      stageX: targetX,
    });
  }

  componentWillUnmount() {
    this.cameraWatcher();
  }

  getWrapperStyles() {
    return {
      position: 'absolute',
      transform: `translate(${this.state.stageX}px, 0px) translateZ(0)`,
      transformOrigin: 'top left',
    };
  }

  render() {
    const {store,fade} = this.props;
    return (
      <div style={this.getWrapperStyles()}>
        {(store.levelCount===0&&!fade) && <TileMap
          style={{ top: Math.floor(90 * this.context.scale) }}
          src="assets/tile_bg_outdoor_square.png"
          rows={1}
          columns={12}
          tileSize={280}
          layers={[
            [1,1,1,1,1,1,1,1,1,1,1,1],
          ]}
        />}

        {(store.levelCount===1&&!fade) && <TileMap
          style={{ top: Math.floor(0 * this.context.scale) }}
          src="assets/hospital_0.png"
          rows={1}
          columns={10}
          tileSize={460}
          layers={[
            [1,2,3,4,1,2,3,4,1,2,3,4,1,2,3]
          ]}
        />}

        {(store.levelCount===2&&!fade) && <TileMap
          style={{ top: Math.floor(0 * this.context.scale) }}
          src="assets/bathroom_0.png"
          rows={1}
          columns={10}
          tileSize={460}
          layers={[
            [1,2,3,4,1,2,3,4,1,2,3,4,1,2,3]
          ]}
        />}

        {(store.levelCount===3&&!fade) && <TileMap
          style={{ top: Math.floor(0 * this.context.scale) }}
          src="assets/hangar_0.png"
          rows={1}
          columns={10}
          tileSize={460}
          layers={[
            [1,2,3,4,1,2,3,4,1,2,3,4,1,2,3]
          ]}
        />}

        {(store.levelCount===4&&!fade) && <TileMap
          style={{ top: Math.floor(0 * this.context.scale) }}
          src="assets/giger_tile.png"
          rows={1}
          columns={10}
          tileSize={340}
          layers={[
            [1,1,1,1,1,1,1,1,1,1,1,1,1],
          ]}
        />}

        {(store.levelCount===4&&!fade) && <TileMap
          style={{ top: Math.floor(0 * this.context.scale) }}
          src="assets/hive_0.png"
          rows={1}
          columns={10}
          tileSize={460}
          layers={[
            [1,2,3,4,2,3,4,1,2,3,1,2,1,1],
          ]}
        />}

      </div>
    );
  }
}
