import React, {Component, PropTypes} from 'react';
import {observer} from 'mobx-react';
import Matter from 'matter-js';

import {
    AudioPlayer,
    Body,
    Sprite,
} from '../../src';

@observer
export default class Corporal extends Component {

    static propTypes = {
        keys: PropTypes.object,
        onEnterBuilding: PropTypes.func,
        onShoot: PropTypes.func,
        onReload: PropTypes.func,
        store: PropTypes.object,
    };

    static contextTypes = {
        engine: PropTypes.object,
        scale: PropTypes.number,
    };

    handlePlayStateChanged = (state) => {
        this.setState({
            spritePlaying: state ? true : false
        });
    };

    getContextLoop = (contextLoop) => {
        const {store} = this.props;
        store.setHeroLoopCount(contextLoop);
        this.setState({
            contextLoop: contextLoop
        });
    };

    move = (body, x) => {
        this.lastDirection = (x < 0 && Math.abs(x) > 2) ? 1 : 0;
        Matter.Body.setVelocity(body, {x, y: 0});
    };

    jump = (body) => {
        this.jumpNoise.play();
        this.isJumping = true;
        Matter.Body.applyForce(
            body,
            {x: 0, y: 0},
            {x: 0, y: -0.01
            },
        );
        Matter.Body.set(body, 'friction', 0.0001);
    };

    shoot = () => {
        this.isShooting = true;
        let direction = this.lastDirection > 0?-1:1;
        if(this.props.ammo > 0) {
            this.props.onShoot();
            this.setState({
                characterState: 3,
                direction,
                repeat: true
            });
        }
        else {
            this.reload();
        }
    };

    reload = () => {
        if(!this.state.reloadTimeStamp) {
            this.setState({
                reloadTimeStamp:this.state.contextLoop
            });
        }
        let direction = this.lastDirection > 0?-1:1;
        this.setState({
            characterState: 4,
            direction,
            repeat: false
        });

        if(this.state.reloadTimeStamp) {
            if(this.state.contextLoop>this.state.reloadTimeStamp+50) {
                this.props.onReload();
                this.setState({
                    reloadTimeStamp:null
                });
            }
        }
    };

    stop = () => {
        let direction = this.lastDirection > 0?-1:1;
        this.setState({
            characterState: 2,
            direction,
            repeat: false
        });
    };

    getDoorIndex = (body) => {
        let doorIndex = null;

        const doorPositions = [...Array(6).keys()].map((a) => {
            return [(512 * a) + 208, (512 * a) + 272];
        });

        doorPositions.forEach((dp, di) => {
            if (body.position.x + 64 > dp[0] && body.position.x + 64 < dp[1]) {
                doorIndex = di;
            }
        });

        return doorIndex;
    }

    enterBuilding = (body) => {
        const doorIndex = this.getDoorIndex(body);

        if (doorIndex !== null) {
            this.setState({
                characterState: 3,
            });
            this.isLeaving = true;
            this.props.onEnterBuilding(doorIndex);
        }
    };

    checkKeys = (shouldMoveStageLeft, shouldMoveStageRight) => {
        const {keys, store} = this.props;
        const {body} = this.body;

        let characterState = 2;
        let direction = this.lastDirection > 0?-1:1;

        if (keys.isDown(83)) {
            return this.shoot();
        }

        if (keys.isDown(65)) {
            return this.stop();
        }

        if (keys.isDown(keys.SPACE)) {
            this.jump(body);
        }

        if (keys.isDown(keys.UP)) {
            return this.enterBuilding(body);
        }

        if (keys.isDown(keys.LEFT)) {
            if (shouldMoveStageLeft) {
                store.setStageX(store.stageX + 4);
            }
            direction = -1;
            this.move(body, -3);
            characterState = 1;
        } else if (keys.isDown(keys.RIGHT)) {
            if (shouldMoveStageRight) {
                store.setStageX(store.stageX - 4);
            }
            characterState = 0;
            direction = 1;
            this.move(body, 3);
        }

        // console.log(characterState);

        this.setState({
            characterState,
            direction,
            repeat: characterState < 2,
        });
    };

    update = () => {
        const {store} = this.props;
        const {body} = this.body;

        // console.log(store.heroLoopCount);

        const midPoint = Math.abs(store.stageX) + 360;

        const shouldMoveStageLeft = body.position.x < midPoint && store.stageX < 0;
        const shouldMoveStageRight = body.position.x > midPoint && store.stageX > -2048;

        const velY = parseFloat(body.velocity.y.toFixed(10));

        if (velY === 0) {
            this.isJumping = false;
            Matter.Body.set(body, 'friction', 0.9999);
        }

        if (!this.isJumping && !this.isPunching && !this.isLeaving) {
            this.checkKeys(shouldMoveStageLeft, shouldMoveStageRight);
            store.setCharacterPosition(body.position);
        } else {
            if (this.isPunching && this.state.spritePlaying === false) {
                this.isPunching = false;
            }

            if (this.isShooting && this.state.spritePlaying === false) {
                this.isShooting = false;
            }

            const targetX = store.stageX + (this.lastX - body.position.x);
            if (shouldMoveStageLeft || shouldMoveStageRight) {
                store.setStageX(targetX);
            }
        }

        this.lastX = body.position.x;
    };

    constructor(props) {
        super(props);

        this.loopID = null;
        this.isJumping = false;
        this.isPunching = false;
        this.isShooting = false;
        this.isLeaving = false;
        this.lastX = 0;

        this.state = {
            characterState: 2,
            loop: false,
            spritePlaying: true,
            ticksPerFrame:5,
            contextLoop:null
        };
    }

    componentDidMount() {
        this.jumpNoise = new AudioPlayer('/assets/jump.wav');
        Matter.Events.on(this.context.engine, 'afterUpdate', this.update);
    }

    componentWillUnmount() {
        Matter.Events.off(this.context.engine, 'afterUpdate', this.update);
    }

    getWrapperStyles() {
        const {characterPosition, stageX} = this.props.store;
        const {scale} = this.context;
        const {x, y} = characterPosition;
        const targetX = x + stageX;

        return {
            position: 'absolute',
            transform: `translate(${targetX * scale}px, ${y * scale}px)`,
            transformOrigin: 'left top',
        };
    }

    render() {
        const x = this.props.store.characterPosition.x;

        return (
            <div style={this.getWrapperStyles()}>
                <Body
                    args={[x, 415, 20, 60]}
                    inertia={Infinity}
                    ref={(b) => { this.body = b; }}
                >
                <Sprite
                    repeat={this.state.repeat}
                    onPlayStateChanged={this.handlePlayStateChanged}
                    onGetContextLoop={this.getContextLoop}
                    src="assets/corporal.png"
                    scale={this.context.scale * 1}
                    direction={this.state.direction}
                    state={this.state.characterState}
                    steps={[7,7,0,1,0]}
                    offset={[0,0]}
                    tileWidth={160}
                    tileHeight={120}
                    ticksPerFrame={this.state.ticksPerFrame}
                />
                </Body>
                <Sprite
                    repeat={this.state.repeat}
                    src="assets/pulse_rifle_shoot.png"
                    scale={this.context.scale * 1}
                    direction={this.state.direction}
                    steps={[3]}
                    offset={[0,0]}
                    tileWidth={160}
                    tileHeight={120}
                    ticksPerFrame={3}
                    top={-120}
                    display={this.state.characterState!==3?"none":"block"}
                />
            </div>
        );
    }
}
