<template>
	<!-- 通话界面 -->
	<view class="calling-container">
		<view class="calling-avatar-container">
			<!-- <image :class="userAvatarClass" mode="widthFix" :src="userAvatar" /> -->
			<image class="calling-avatar" mode="widthFix"
				src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/static/chat/calling_female.jpg" />
		</view>
		<scroll-view class="calling-caption" id="scrollview" scroll-y="true" :scroll-with-animation="true"
			:scroll-top="scrollTop">
			<view class="calling-caption-view">
				<!-- <text class="calling-caption-title">{{captionTitle}}</text> -->
				<!-- <text class="calling-caption-text">{{captionText}}</text> -->
				<uaMarkDown
					outerStyle="font-size: 14px; color: white; font-weight: bold; line-height: 20px; opacity: 0.8;"
					:source="captionText" :showLine="false" />
			</view>

		</scroll-view>
		<view class="calling-action-container">
			<view class="calling-recording-container">
				<wave class="calling-recording-anim" />
				<view class="calling-recording-btn" @click="intercept">
					<text>{{callingText}}</text>
					<uni-icons class="calling-stop-icon" size="22" color="#FFFFFF"
						:type="`${playing?'mic-filled':'smallcircle'}`" />
				</view>
			</view>
			<view class="calling-stop-btn" @click="endCall">
				<uni-icons class="calling-stop-icon" type="closeempty" size="30" color="#FFFFFF" />
			</view>
		</view>
	</view>
</template>

<script>
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store.js';
	import wave from '@/components/wave.vue';
	import uaMarkDown from '@/components/ua-markdown/ua-markdown.vue';
	import {
		getNowTime
	} from '@/common/utils/timestamp';
	import {
		asrPlugin,
		asrRecorder,
		onRecording,
		offRecording,
		initAudio,
		onSpeaking
	} from '@/common/js/audio';
	export default {
		data() {
			return {
				audio: undefined,
				recorderTimer: undefined,
				paused: false,
				needContinue: false,
				recording: false,
				playing: false,
				endOne: '',
				scrollTop: 0,
			}
		},
		components: {
			wave,
			uaMarkDown
		},
		computed: {
			userAvatar: function() {
				return store.userInfo.avatar_file.url;
			},
			userAvatarClass: function() {
				return this.recording ? 'calling-avatar avatar-fade-in' : 'calling-avatar avatar-fade-out';
			},
			aiAvatarClass: function() {
				return this.recording ? 'calling-avatar-ai avatar-fade-out' : 'calling-avatar-ai avatar-fade-in';
			},
			captionTitle: function() {
				return this.playing ? "心脉AI： " : (this.recording ? "我： " : '');
			},
			captionText: function() {
				return this.recording ? store.userConfig.inputValue : store.userConfig.captionText;
			},
			callingText: function() {
				let text = "思考中...";
				if (this.playing) {
					text = "点击打断AI发言";
				} else if (this.recording) {
					text = "听您讲话中...";
				}
				return text;
			}
		},
		methods: {
			show() {
				console.log('Simulator, onShow');
				this.initAsrListener();
				this.resumeCall();
			},
			hide() {
				console.log('Simulator, onHide');
				offRecording();
				this.pauseCall();
			},
			startTimer: function(sentence) {
				this.recorderTimer = setInterval(() => {
					const inputValue = store.userConfig.inputValue;
					// const captionText = store.userConfig.captionText;
					// const trigger = inputValue.indexOf('等一下') >= 0;
					// console.log('Simulator, TimerTask: sentence = ' + sentence);
					// console.log('Simulator, TimerTask: inputValue = ' + inputValue);
					// if (trigger) {
					// 	this.clearTimer();
					// 	this.intercept();
					// 	store.userConfig.inputValue.replaceAll('等一下', '');
					// } else
					if (sentence.length > 0 && sentence == store.userConfig.inputValue) {
						// 1S内检测到用户无输入，清除掉IntervalTimer；
						this.sendtoAI();
						this.clearTimer();
					} else {
						sentence = store.userConfig.inputValue;
						// 保留IntervalTimer，赋值最新全部输入，1S后再次监听判断；
					}
				}, 1500);
			},
			clearTimer: function() {
				if (this.recorderTimer) {
					clearInterval(this.recorderTimer);
					this.recorderTimer = undefined;
				}
			},
			initAsrListener: function() {
				if (asrRecorder.listener == 'simulator') {
					return;
				}
				asrRecorder.listener = 'simulator';
				// 开始识别
				asrRecorder.OnRecognitionStart = (res) => {
					console.log('Simulator, 开始录音识别', res);
				};
				// 一句话开始
				asrRecorder.OnSentenceBegin = (res) => {
					console.log('Simulator, 一句话开始', res);
				};
				// 识别变化时
				asrRecorder.OnRecognitionResultChange = (res) => {
					const sentence = res.result?.voice_text_str;
					if (sentence?.length > 0) {
						store.userConfig.inputValue = sentence;
					}
					if (store.userConfig.calling) {
						this.startTimer(sentence);
					}
				};
				// 录音结束（最长10分钟）时回调
				asrRecorder.OnRecorderStop = (res) => {
					console.log('Simulator, 录音结束', res);
					// 通话实时转文字在这里识别
					if (store.userConfig.calling) {
						if (store.userConfig.inputValue == '') {
							console.log('Simulator, 没有说话')
							this.endOne = '周围太安静啦，再试试~';
						}
						store.userConfig.calling = this.needContinue;
						this.needContinue = false;
						if (store.userConfig.inputValue.length > 0) {
							this.sendMessage();
						} else {
							this.shortSpeaking('您似乎没有说话，有什么可以帮您？');
						}
					}
				};
				// 一句话结束
				asrRecorder.OnSentenceEnd = (res) => {
					console.log('Simulator, 一句话结束', res);
					// 语音转文字在这里识别
					if (!store.userConfig.calling) {
						const sentence = res.result?.voice_text_str;
						if (sentence?.length > 0) {
							store.userConfig.inputValue = sentence;
							this.sendMessage();
						}
					}
				};
				// 识别完成
				asrRecorder.OnRecognitionComplete = (res) => {
					console.log('Simulator, 识别完成', res);
				};
				// 识别错误
				asrRecorder.OnError = (res) => {
					// code为6001时，国内站用户请检查是否使用境外代理，如果使用请关闭。境外调用需开通国际站服务
					console.log('Simulator, 识别失败', res);
				};
			},
			intercept: function() {
				if (this.playing) {
					this.audio?.stop();
				} // 需要分段播放的内容清空，停止播放
				store.userConfig.speakingTtsIndex = -1;
				store.userConfig.speakingIndex = -1;
				store.userConfig.speakingLines = [];
				store.userConfig.captionText = '';
			},
			startCall: function() {
				console.log('Simulator, 智能问答, 开始通话');
				store.userConfig.calling = true;
				this.shortSpeaking('欢迎使用智能问答，有什么可以帮您？',
					'https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/dialog/mp3/welcome.mp3');
			},
			pauseCall: function() {
				if (store.userConfig.calling) {
					console.log('Simulator, 智能问答, 暂停通话');
					this.audio?.stop();
					this.endRecord();
					this.paused = true;
					store.userConfig.calling = false;
				}
			},
			resumeCall: function() {
				if (this.paused) {
					console.log('Simulator, 智能问答, 继续通话');
					this.paused = false;
					this.startCall();
				}
			},
			endCall: function() {
				console.log('Simulator, 智能问答, 结束通话');
				this.audio?.stop();
				this.endRecord();
				this.$emit('end-call');
				store.userConfig.calling = false;
				// 需要分段播放的内容为空，或者已经播放完毕
				store.userConfig.speakingTtsIndex = -1;
				store.userConfig.speakingIndex = -1;
				store.userConfig.speakingLines = [];
				store.userConfig.captionText = '';
			},
			startRecord: function() {
				if (this.recording) {
					console.log('Simulator, 录音进行中，无需重复启动');
					return;
				}
				this.recording = true;
				onRecording();
			},
			endRecord: function() {
				this.endAsrRecord();
				this.recording = false;
			},
			sendtoAI: function() {
				console.log('Simulator, sendToAI, this.playing = ' + this.playing +
					", this.recording = " + this.recording);
				if (this.playing) {
					this.audio?.stop();
				} else if (this.recording) {
					this.needContinue = true;
					this.endRecord();
				}
			},
			sendMessage() {
				if (store.userConfig.inputValue.trim() == '') {
					store.userConfig.inputValue = '';
					uni.showToast({
						title: '发送内容不能为空',
						icon: 'none',
						duration: 600
					});
				} else {
					this.$emit('input-send', {
						type: 'text',
						content: store.userConfig.inputValue
					});
					store.userConfig.inputValue = '';
				}
			},
			endAsrRecord: function() {
				// 需要结束识别时调用此方法
				console.log("Simulator, endAsrRecord");
				asrRecorder.stop();
				this.clearTimer();
			},
			releaseAudio: function() {
				store.userConfig.speakingIndex = -1;
				store.userConfig.speakingLines = [];
				store.userConfig.captionText = '';
				this.playing = false;
				if (this.audio) {
					this.audio.destroy();
					this.audio = undefined;
				}
				if (store.userConfig.calling) {
					this.startRecord();
				}
			},
			audioHandler: function() {
				if (store.userConfig.speakingIndex == -1) {
					console.log("Simulator, 还有未播放，但提前终止，speakingIndex = -1");
					// 中止播放
					return;
				}
				const index = store.userConfig.speakingIndex;
				const speakingLines = store.userConfig.speakingLines;
				const audioUrl = speakingLines[index].audioUrl;
				console.log('Simulator, audioHandler, audioUrl = ' + audioUrl);
				const onStop = () => {
					this.releaseAudio();
				};
				const onEnded = () => {
					store.userConfig.speakingIndex += 1;
					if (store.userConfig.speakingIndex >= speakingLines.length) { // 需要分段播放的内容为空，或者已经播放完毕
						this.releaseAudio();
					} else {
						// 分段播放内容，继续播放下一段
						this.audioHandler();
					}
				};
				this.audio = initAudio(audioUrl, onStop, onEnded);
				this.audio.play();

				// 滚动字幕到当前播放为止
				if (index > 1) {
					this.scrollTop = index * 72;
				}
			},
			aiSpeaking: function() {
				if (!store.userConfig.calling || this.playing) {
					return;
				}
				this.playing = true;
				this.audioHandler();
			},
			shortSpeaking: function(content, audioUrl = undefined) {
				if (!store.userConfig.calling || this.playing) {
					return;
				}
				store.userConfig.speakingLines = [{
					content: content
				}];
				store.userConfig.captionText = content;
				store.userConfig.speakingIndex = 0;
				this.playing = true;
				if (audioUrl) {
					store.userConfig.speakingLines[0].audioUrl = audioUrl;
					this.audioHandler();
				} else {
					const onSuccess = (audioUrl) => {
						store.userConfig.speakingLines[0].audioUrl = audioUrl;
						this.audioHandler();
					};
					const onFail = (err) => {
						this.releaseAudio();
					};
					onSpeaking(content, onSuccess, onFail);
				}
			}
		}
	}
</script>

<style>
	.calling-container {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.calling-avatar-container {
		margin-top: 100px;
		padding: 10px 10px;
	}

	.calling-avatar {
		width: 100px;
		height: 100px;
		border-radius: 100%;
		border: 3px solid white;
		overflow: hidden;
	}

	.calling-avatar-ai {
		position: relative;
		width: 100px;
		height: 100px;
		border-radius: 100%;
		border: 3px solid white;
		overflow: hidden;
	}

	.avatar-fade-in {
		animation: fade-in 800ms ease-in-out forwards;
	}

	.avatar-fade-out {
		animation: fade-out 800ms ease-in-out forwards;
	}

	@keyframes fade-in {
		0% {
			opacity: 0;
		}

		100% {
			opacity: 1;
		}
	}

	@keyframes fade-out {
		0% {
			opacity: 1;
		}

		100% {
			opacity: 0;
		}
	}



	.calling-action-container {
		display: flex;
		flex-direction: column;
		position: fixed;
		bottom: 150px;
		align-items: center;
		color: white;
		font-size: 15px;
	}

	.calling-recording-container {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.calling-caption {
		margin: 40px 0px 40px;
		height: 220px;
	}

	.calling-caption-title {
		font-size: 16px;
		color: white;
		font-weight: bold;
		line-height: 20px;
	}

	.calling-caption-view {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 0px 24px;
		white-space: pre-wrap;
		user-select: none;
	}

	.calling-caption-text {
		font-size: 14px;
		color: white;
		font-weight: bold;
		line-height: 20px;
		opacity: 0.8;
	}

	.calling-recording-anim {
		margin: 20px 10px;
	}

	.calling-recording-btn {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
	}

	.calling-stop-icon {
		margin: 0px 5px;
	}

	.calling-stop-btn {
		display: flex;
		position: fixed;
		bottom: 45px;
		align-items: center;
		justify-content: center;
		width: 60px;
		height: 60px;
		border-radius: 100%;
		background-color: indianred;
	}
</style>