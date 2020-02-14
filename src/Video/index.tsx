import React from 'react';
import style from "./style.module.scss";
import { uniqueId, noop } from "@thalesrc/js-utils";
import IconButton from '@material-ui/core/IconButton';
import LinearProgress  from '@material-ui/core/LinearProgress';
import { PlayArrow, Pause, VolumeOff, VolumeUp } from '@material-ui/icons';
import * as _browser from 'detect-browser';

const browser = _browser.detect();

declare global {
	interface Window {
		onYouTubeIframeAPIReady(): void;
	}
}

export enum PlayerState {
	Unstarted = -1,
	Ended = 0,
	Playing = 1,
	Paused = 2,
	Buffering = 3,
	VideoCued = 5,
}

interface Props {
	videoId: string;
	onReady(): void;
	onEnd(): void;
}

interface State {
	videoId: string;
	playingState: PlayerState;
	buffer: number;
	seconds: number;
	duration: number;
	muted: boolean;
}

export default class Video extends React.Component<Props, State> {
	public static defaultProps: Props = {
		videoId: 'AjWfY7SnMBI',
		onReady: noop,
		onEnd: noop
	};

	private static readonly scriptReady$ = Video.createScript();

	private static createScript(): Promise<void> {
		return new Promise(resolve => {
			const script = document.createElement('script');

			script.src = "https://www.youtube.com/iframe_api";
	
			window.onYouTubeIframeAPIReady = function() {
				resolve();
			}
	
			document.head.appendChild(script);
		});
	}

	private player: YT.Player | null = null;
	private iframeRef = React.createRef<HTMLIFrameElement>();
	private shouldPlay = false;
	private playerReady = false;
	private scriptInitialized = false;
	private dataIntervalId: number = -1;
	private firstPlayStarted = false;

	public state: State = {
		videoId: uniqueId('video') as string,
		playingState: PlayerState.Unstarted,
		buffer: 0,
		seconds: 0,
		duration: 0,
		muted: false
	};

	public static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
		let newState: Partial<State> = {};

		if (props.videoId !== state.videoId) {
			newState = {videoId: props.videoId};
		}

		return Object.keys(newState).length ? newState : null;
	}

	constructor(props: Props) {
		super(props);

		Video.scriptReady$.then(() => {
			this.player = new YT.Player(this.iframeRef.current!, {
				playerVars: {
					controls: 0,
					iv_load_policy: 0,
					showinfo: 0,
					autoplay: 1
				},
				events: {
					onReady: noop,
					onStateChange: ({data}) => {
						if (!this.playerReady) {
							this.onPlayerReady();
						} else {
							if (!this.firstPlayStarted && (data as number) === PlayerState.Playing) {
								this.firstPlayStarted = true;
								this.shouldPlay = true;
							}

							if ((data as number) === PlayerState.Ended) {
								this.props.onEnd();
							}

							this.setState({playingState: data as number});
						}
					},
					onError: function() {console.log('onError', ...arguments)},
					onApiChange: function() {console.log('onApiChange', ...arguments)},
					onPlaybackQualityChange: function() {console.log('onPlaybackQualityChange', ...arguments)},
				}
			});

			this.scriptInitialized = true;
		})
	}

	public componentWillUnmount() {
		window.clearInterval(this.dataIntervalId);
	}

	private togglePlay() {
		this.shouldPlay = !this.shouldPlay;

		if (this.shouldPlay) {
			this.player!.playVideo();
		} else {
			this.player!.pauseVideo();
		}
	}

	private toggleVolume() {
		if (this.state.muted) {
			this.player!.unMute();
		} else {
			this.player!.mute();
		}

		this.setState({muted: !this.state.muted});
	}

	private onPlayerReady() {
		this.playerReady = true;
		this.props.onReady();

		this.setState({duration: this.player!.getDuration()});

		this.dataIntervalId = window.setInterval(() => {
			const buffer = this.player!.getVideoLoadedFraction() * 100;
			const seconds = this.player!.getCurrentTime();

			this.setState({buffer, seconds});

		}, 100);
	}

	private get coverOpacity(): 0 | 1 {
		const { playingState } = this.state;

		return playingState === PlayerState.Playing ? 0 : 1;
	}

	private get controlDisplay(): undefined | 'none' {
		switch (browser!.name) {
			case 'chrome':
			case 'safari':
				return this.firstPlayStarted ? undefined : 'none';
			default:
				return undefined;
		}
	}

	render() {
		const { videoId, playingState, duration, seconds, buffer, muted } = this.state;

		const value = (100 / duration) * seconds;

		return (
			<figure className={style.host}>
				<iframe ref={this.iframeRef} title="Video" className={style.iframe} src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&controls=0&showInfo=0&autoplay=1`}></iframe>
				<img src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} alt="thumb" className={style.image} style={{opacity: this.coverOpacity, display: this.controlDisplay}} />
				<div className={style.controls} style={{display: this.controlDisplay}}>
					<header></header>
					<div className={style.body}>
					</div>
					<footer className={style.footer}>
						<IconButton color="primary" onClick={() => this.togglePlay()}>
							{
								playingState !== PlayerState.Playing
									? <PlayArrow fontSize="large"></PlayArrow>
									: <Pause fontSize="large"></Pause>
							}
						</IconButton>
						<LinearProgress variant="buffer" value={value} valueBuffer={buffer} style={{width: '100%'}}></LinearProgress>
						<IconButton color="primary" onClick={() => this.toggleVolume()}>
							{
								muted
									? <VolumeOff fontSize="large"></VolumeOff>
									: <VolumeUp fontSize="large"></VolumeUp>
							}
						</IconButton>
					</footer>
				</div>
			</figure>
		)
	}
}