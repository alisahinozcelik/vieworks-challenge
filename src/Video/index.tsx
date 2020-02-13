import React from 'react';
import style from "./style.module.scss";
import { uniqueId, noop } from "@thalesrc/js-utils";
import IconButton from '@material-ui/core/IconButton';
import LinearProgress  from '@material-ui/core/LinearProgress';
import { PlayArrow, Pause } from '@material-ui/icons';

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
}

interface State {
	videoId: string;
	scriptInitialized: boolean;
	playerReady: boolean;
	shouldPlay: boolean;
	playingState: PlayerState;
}

let intervalId: number;
let time: number;

export default class Video extends React.Component<Props, State> {
	public static defaultProps: Props = {
		videoId: 'AjWfY7SnMBI',
		onReady: noop
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

	public state: State = {
		videoId: uniqueId('video') as string,
		scriptInitialized: false,
		playerReady: false,
		shouldPlay: false,
		playingState: PlayerState.Unstarted
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
					onReady: () => {
						// this.player!.playVideo();
						// this.player!.pauseVideo();
					},
					onStateChange: ({data}) => {
						console.log(data);
						
						if (!this.state.playerReady && ((data as number) === PlayerState.VideoCued)) {
							this.setState({playerReady: true});
						} else {
							this.setState({playingState: data as number});
						}
					},
					onError: function() {console.log('onError', ...arguments)},
					onApiChange: function() {console.log('onApiChange', ...arguments)},
					onPlaybackQualityChange: function() {console.log('onPlaybackQualityChange', ...arguments)},
				}
			});

			this.setState({scriptInitialized: true});
		})
	}

	public interval = () => {
		this.player!.seekTo(time, false);
	}

	public getSnapshotBeforeUpdate(prevProps: Props, prevState: State) {
		const { playerReady, shouldPlay } = this.state;
		// const { play } = this.props;

		if (!prevState.playerReady && playerReady) {
			this.props.onReady();

			return null;
		}

		if (prevState.shouldPlay !== shouldPlay) {
			if (shouldPlay) {
				// window.clearInterval(intervalId);
				// this.player!.unMute();
				this.player!.playVideo();
			} else {
				this.player!.pauseVideo();
				// this.player!.mute();
				// time = this.player!.getCurrentTime();
				// intervalId = window.setInterval(this.interval, 10);
				// this.player!.pauseVideo();
			}
		}

		// if (prevProps.play !== play) {
		// 	if (play && playingState !== PlayerState.Playing) {
		// 		this.player!.playVideo();
		// 	}
		// }

		return null;
	}

	public componentDidUpdate() {
		// if (this.state.shouldPlay && (this.state.playingState !== PlayerState.Playing)) {
		// 	this.player!.playVideo();
		// }
	}

	render() {
		const { videoId, shouldPlay, playingState } = this.state;

		console.log(this.state);
		

		return (
			<figure className={style.host}>
				<iframe ref={this.iframeRef} title="Video" className={style.iframe} src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&controls=0&showInfo=0&autoplay=1`}></iframe>
				<img src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} alt="thumb" className={style.image} style={{opacity: playingState === PlayerState.Unstarted ? 1 : 0}}></img>
				<div className={style.controls}>
					<header></header>
					<div className={style.body}>
						{/* <IconButton variant="contained" color="primary" onClick={() => this.setState({shouldPlay: !shouldPlay})}>Play</IconButton> */}
					</div>
					<footer className={style.footer}>
						<IconButton color="primary" onClick={() => this.setState({shouldPlay: !shouldPlay})}>
							{
								playingState !== PlayerState.Playing
									? <PlayArrow fontSize="large"></PlayArrow>
									: <Pause fontSize="large"></Pause>
							}
						</IconButton>
						<LinearProgress variant="buffer" value={25} valueBuffer={50} style={{width: '100%'}}></LinearProgress>
					</footer>
				</div>
			</figure>
		)
	}
}