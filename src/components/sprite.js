import React, {Component, PropTypes} from 'react';

export default class Sprite extends Component {

    static propTypes = {
        offset: PropTypes.array,
        onPlayStateChanged: PropTypes.func,
        onGetContextLoop: PropTypes.func,
        repeat: PropTypes.bool,
        scale: PropTypes.number,
        direction: PropTypes.number,
        src: PropTypes.string,
        state: PropTypes.number,
        steps: PropTypes.array,
        style: PropTypes.object,
        ticksPerFrame: PropTypes.number,
        tileHeight: PropTypes.number,
        tileWidth: PropTypes.number,
    };

    static defaultProps = {
        offset: [0, 0],
        onPlayStateChanged: () => {
        },
        onGetContextLoop: () => {
        },
        repeat: true,
        src: '',
        direction: 1,
        state: 0,
        steps: [],
        ticksPerFrame: 4,
        tileHeight: 64,
        tileWidth: 64,
    };

    static contextTypes = {
        loop: PropTypes.object,
        scale: PropTypes.number,
    };

    constructor(props) {
        super(props);

        this.loopID = null;
        this.tickCount = 0;
        this.finished = false;

        this.state = {
            currentStep: 0,
        };
    }

    componentDidMount() {
        this.props.onPlayStateChanged(1);
        const animate = this.animate.bind(this, this.props);
        this.loopID = this.context.loop.subscribe(animate);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.state !== this.props.state) {
            this.finished = false;
            this.props.onPlayStateChanged(1);
            this.context.loop.unsubscribe(this.loopID);
            this.tickCount = 0;

            this.setState({
                currentStep: 0,
            }, () => {
                const animate = this.animate.bind(this, nextProps);
                this.loopID = this.context.loop.subscribe(animate);
            });
        }
    }

    componentWillUnmount() {
        this.context.loop.unsubscribe(this.loopID);
    }

    animate(props) {
        const {repeat, ticksPerFrame, state, steps} = props;

        this.props.onGetContextLoop(this.context.loop.loopID);

        if (this.tickCount === ticksPerFrame && !this.finished) {
            if (steps[state] !== 0) {
                const {currentStep} = this.state;
                const lastStep = steps[state];
                const nextStep = currentStep === lastStep ? 0 : currentStep + 1;

                this.setState({
                    currentStep: nextStep,
                });

                if (currentStep === lastStep && repeat === false) {
                    this.finished = true;
                    this.props.onPlayStateChanged(0);
                }
            }

            this.tickCount = 0;
        } else {
            this.tickCount++;
        }

    }

    getImageStyles() {
        const {currentStep} = this.state;
        const {state, tileWidth, tileHeight,direction} = this.props;

        const left = this.props.offset[0] + (currentStep * tileWidth);
        const top = this.props.offset[1] + (state * tileHeight);

        if(direction < 0 && state===3) {
        }

        return {
            position: 'absolute',
            transform: `translate(-${left}px, -${top}px) scale(${direction},1)`,
        };
    }

    getWrapperStyles() {
        return {
            height: this.props.tileHeight,
            width: this.props.tileWidth,
            overflow: 'hidden',
            position: 'relative',
            transform: `scale(${this.props.scale || this.context.scale})`,
            transformOrigin: 'top left',
            imageRendering: 'pixelated',
        };
    }

    render() {
        return (
            <div style={{ ...this.getWrapperStyles(), ...this.props.style }}>
                <img
                    style={this.getImageStyles()}
                    src={this.props.src}
                />
            </div>
        );
    }

}
