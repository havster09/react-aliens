import React, {Component, PropTypes} from 'react';
import Matter from 'matter-js';

import {
    AudioPlayer,
    Loop,
    Stage,
    KeyListener,
    World,
    Sprite
} from '../../src';

import Character from './character';
import Level from './level';
import Fade from './fade';
import Ammo from './ammo';

import GameStore from './stores/game-store';

export default class Game extends Component {


    static propTypes = {
        onLeave: PropTypes.func,
    };

    physicsInit = (engine) => {
        const ground = Matter.Bodies.rectangle(
            512 * 3, 400,
            1024 * 3, 64,
            {
                isStatic: true,
            },
        );

        const leftWall = Matter.Bodies.rectangle(
            -180, 288,
            64, 576,
            {
                isStatic: true,
            },
        );

        const rightWall = Matter.Bodies.rectangle(
            2950, 288,
            64, 576,
            {
                isStatic: true,
            },
        );

        Matter.World.addBody(engine.world, ground);
        Matter.World.addBody(engine.world, leftWall);
        Matter.World.addBody(engine.world, rightWall);
    };

    handleEnterBuilding = (index) => {
        this.setState({
            fade: true,
        });
        setTimeout(() => {
            this.props.onLeave(index);
        }, 500);
    };

    handleShoot = () => {
        this.setState({
            ammo: this.state.ammo -1
        });
    };

    handleReload = () => {
        this.setState({
            ammo: 99
        });
    };

    constructor(props) {
        super(props);

        this.state = {
            fade: true,
            ammo:99
        };
        this.keyListener = new KeyListener();
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        window.context = window.context || new AudioContext();
    }

    componentDidMount() {
        this.player = new AudioPlayer('/assets/music.wav', () => {
            //this.stopMusic = this.player.play({ loop: true, offset: 1, volume: 0.35 });
        });


        this.setState({
            fade: false,
        });

        this.keyListener.subscribe([
            this.keyListener.LEFT,
            this.keyListener.RIGHT,
            this.keyListener.UP,
            this.keyListener.SPACE,
            65, 83
        ]);
    }

    componentWillUnmount() {
        //this.stopMusic();
        this.keyListener.unsubscribe();
    }

    render() {
        return (
            <Loop>
                <Stage style={{ background: '#000' }}>
                    <World onInit={this.physicsInit}>
                        <Level store={GameStore}/>
                        <Character
                            onEnterBuilding={this.handleEnterBuilding}
                            onShoot={this.handleShoot}
                            onReload={this.handleReload}
                            store={GameStore}
                            ammo={this.state.ammo}
                            keys={this.keyListener}/>
                        <Ammo count={this.state.ammo}/>
                    </World>
                </Stage>
                <Fade visible={this.state.fade}/>
            </Loop>
        );
    }

}
