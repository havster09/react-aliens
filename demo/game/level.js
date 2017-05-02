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
        {/*<TileMap
          style={{ top: Math.floor(74 * this.context.scale) }}
          src="assets/boardwalktile.png"
          tileSize={128}
          columns={24}
          rows={4}
          layers={[
            [
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            ],
          ]}
        />
        <TileMap
          style={{ top: Math.floor(-53 * this.context.scale) }}
          src="assets/buildings.png"
          rows={1}
          columns={6}
          tileSize={512}
          layers={[
            [1,2,3,4,5,6],
          ]}
        />*/}
        {(store.levelCount===0&&!fade) && <TileMap
          style={{ top: Math.floor(200 * this.context.scale) }}
          src="assets/tile_bg_outdoor_square.png"
          rows={1}
          columns={12}
          tileSize={280}
          layers={[
            [1,1,1,1,1,1,1,1,1,1,1,1],
          ]}
        />}

        {(store.levelCount===1&&!fade) && <TileMap
          style={{ top: Math.floor(110 * this.context.scale) }}
          src="assets/giger_tile.png"
          rows={1}
          columns={10}
          tileSize={340}
          layers={[
            [1,1,1,1,1,1,1,1,1,1,1,1,1],
          ]}
        />}

        {(store.levelCount===1&&!fade) && <TileMap
          style={{ top: Math.floor(110 * this.context.scale) }}
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
