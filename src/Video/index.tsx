import React from 'react';
import { uniqueId } from "@thalesrc/js-utils";

enum Controls {
	Hide = 0,
	ShowLoadPlayer = 1,
	ShowDelayLoadPlayer = 2
}

declare global {
	interface Window {
		onYouTubeIframeAPIReady(): void;
	}
}

interface Props {
	videoId: string;
}

interface State {
	videoId: string;
	scriptInitialized: boolean;
}

export default class Video extends React.Component<Props, State> {
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
		scriptInitialized: false
	};

	public static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
		if (props.videoId !== state.videoId) {
			return {videoId: props.videoId};
		}

		return null;
	}

	constructor(props: Props) {
		super(props);

		Video.scriptReady$.then(() => {
			this.player = new YT.Player(this.iframeRef.current!, {
				playerVars: {
					controls: 0,
					iv_load_policy: 0,
					showinfo: 0
				},
				events: {
					onReady: () => {console.log('onReady')},
					onStateChange: console.log,
					onError: console.log,
					onApiChange: console.log,
				}
			});

			this.setState({scriptInitialized: true});
		})
	}

	

	render() {
		const { videoId = 'AjWfY7SnMBI' } = this.state;

		return (
			<>
				<iframe ref={this.iframeRef} title="Video" src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1`}></iframe>
			</>
		)
	}
}