<template>
	<view class="footer">
		<view v-if="fromDialog && !fromCheckIn" class="footer-left" @click="$emit('show-history')">
			<uni-icons class="action-icon" type="list" size="24" :color="color" />
		</view>
		<div class="textarea-container">
			<textarea class="textarea" :style="`height: ${textAreaMinHeight}; border-color: ${color};`"
				:placeholder="`${recording?'':'请输入您的问题'}`" @linechange="inputLineChanged" always-embed="true"
				adjust-position="true" cursor-spacing="30" cursor-color="#4C5382" maxlength="1000" type="text"
				v-model="inputValue" confirm-type="send" @confirm="sendMessage" @touchstart="$emit('closePopup')" />
			<view class="record-loading" v-if="recording" style="width: 80px;">
				<view class="m-content-head m-content-head-home" style="padding-left: 20px;padding-top: 15px;">
					<loading-dots class="recording-dots" :color="color" />
				</view>
			</view>
			<uni-icons v-if="hasLogin" class="icon fas fa-search" @click="sendMessage" type="paperplane-filled" size="24"
				:color="color" />
			<button v-else class="send-btn" open-type="getPhoneNumber" @getphonenumber="quickLogin">发送</button>
		</div>
		<view v-if="fromDialog" class="footer-right" @click="startCall" @touchstart="callTouchStart"
			@touchend="callTouchEnd">
			<uni-icons class="action-icon" :type="`${callTouching ? 'phone-filled' : 'phone'}`" size="24"
				:color="color" />
		</view>
		<view v-else class="footer-right" @touchstart="startRecord" @touchend="endRecord">
			<uni-icons class="action-icon" :type="`${recording ? 'mic-filled' : 'mic'}`" size="24" :color="color" />
		</view>
		<!-- 通话界面 -->
		<view v-if="calling" class="calling-container">
			<view class="calling-avatar-container">
				<image class="calling-avatar" mode="widthFix"
					src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/static/chat/calling_female.jpg" />
			</view>
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
		<!-- 固定定位的快捷登录按钮 -->
		<uni-id-pages-fab-login style="display: none;" ref="uniFabLogin" />
	</view>
</template>

<script>
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store.js';
	import wave from '@/components/wave.vue';
	import {
		asrPlugin,
		asrRecorder,
		initAudio,
		offRecording,
		onRecording,
		onSpeaking
	} from '@/common/js/audio';
	export default {
		name: "chat-input",
		data() {
			return {
				audio: undefined,
				recorderTimer: undefined,
				calling: false,
				needContinue: false,
				recording: false,
				playing: false,
				inputValue: '',
				voicePath: '',
				endOne: '',
				textAreaMinHeight: '35px',
				footSideWidth: '32px',
				callTouching: false,
				onShow: false,
			}
		},
		props: {
			color: {
				type: String,
				default: '#4C5382'
			},
			popupShow: {
				type: Boolean,
				default: false
			},
			fromDialog: {
				type: Boolean,
				default: false
			},
			fromCheckIn: {
				type: Boolean,
				default: false
			},
		},
		components: {
			wave
		},
		computed: {
			hasLogin: function() {
				return store.hasLogin;
			},
			callingText: function() {
				let text = "思考中...";
				if (this.playing) {
					text = "点击打断AI发言";
				} else if (this.recording) {
					text = "听您讲话中...";
				}
				return text;
			},
		},
		methods: {
			load: function() {},
			show: function() {
				this.onShow = true;
				this.initAsrListener();
			},
			hide: function() {
				this.onShow = false;
				this.removeAsrListener();
			},
			clearTimer: function() {
				if (this.recorderTimer) {
					clearInterval(this.recorderTimer);
					this.recorderTimer = undefined;
				}
			},
			initAsrListener: function() {
				if (asrRecorder.listener == 'emochat') {
					return;
				}
				asrRecorder.listener = 'emochat';
				// 开始识别
				asrRecorder.OnRecognitionStart = (res) => {
					if (this.onShow) {
						console.log('ChattyInput, 开始识别', res);
					}
				};
				// 一句话开始
				asrRecorder.OnSentenceBegin = (res) => {
					if (this.onShow) {
						console.log('ChattyInput, 一句话开始', res);
					}
				};
				// 识别变化时
				asrRecorder.OnRecognitionResultChange = (res) => {
					if (!this.onShow) {
						return;
					}
					let sentence = res.result?.voice_text_str;
					console.log('ChattyInput, 识别变化时', sentence);
					if (sentence?.length > 0) {
						this.inputValue = sentence;
					}
					this.recorderTimer = setInterval(() => {
						console.log('ChattyInput, sentence = ' + sentence + ", inputValue = " + this
							.inputValue);
						if (sentence.length > 0 && sentence == this.inputValue) {
							// 1S内检测到用户无输入，清除掉IntervalTimer；
							this.sendtoAI();
							this.clearTimer();
						} else {
							sentence = this.inputValue;
							// 保留IntervalTimer，赋值最新全部输入，1S后再次监听判断；
						}
					}, 1000);

				};
				// 一句话结束
				asrRecorder.OnSentenceEnd = (res) => {
					if (this.onShow) {
						console.log('ChattyInput, 一句话结束', res);
					}
				};
				// 识别结束
				asrRecorder.OnRecognitionComplete = (res) => {
					if (this.onShow) {
						console.log('ChattyInput, 识别结束', res);
					}
				};
				// 识别错误
				asrRecorder.OnError = (res) => {
					// code为6001时，国内站用户请检查是否使用境外代理，如果使用请关闭。境外调用需开通国际站服务
					if (this.onShow) {
						console.log('ChattyInput, 识别失败', res);
					}
				};
				// 录音结束（最长10分钟）时回调
				asrRecorder.OnRecorderStop = (res) => {
					if (!this.onShow) {
						return;
					}
					console.log('ChattyInput, 录音结束', res);
					this.voicePath = res.tempFilePath;
					if (this.inputValue == '') {
						console.log('ChattyInput, 没有说话')
						this.endOne = '周围太安静啦，再试试~';
					}
					if (this.calling) {
						this.calling = this.needContinue;
						this.needContinue = false;
						if (this.inputValue?.length > 0) {
							this.sendMessage();
						} else {
							this.noSpeaking();
						}
					}
				};
			},
			removeAsrListener() {
				offRecording();
			},
			startAsrRecord: function() {
				onRecording();
			},
			endAsrRecord: function() {
				// 需要结束识别时调用此方法
				asrRecorder.stop();
				this.clearTimer();
			},
			callTouchStart: function() {
				this.callTouching = true;
			},
			callTouchEnd: function() {
				this.callTouching = false;
			},
			startCall: function() {
				console.log('ChattyInput, emohaa, 开始通话');
				this.calling = true;
				this.$emit('last-message', (isFinished, message) => {
					let text = '';
					if (message.user != 'home' || message._id == '000000000000000000000000') {
						text = "欢迎使用Emohaa，我是您的Emohaa助手，您有什么问题需要咨询吗？";
					} else {
						text = message.content;
					}
					this.aiSpeaking(text);
				});
			},
			// 新录音代码开始
			startRecord: function() {
				console.log('ChattyInput, 开始录音');
				this.recording = true;
				this.startAsrRecord();
			},
			endRecord: function() {
				this.endAsrRecord();
				this.recording = false;
				console.log('ChattyInput, 录音结束');
			},
			noSpeaking: function() {
				this.$emit('last-message', (isFinished, message) => {
					let text = '您似乎没有说话，请问还有什么可以帮您？';
					if (!isFinished && message.user == 'home') {
						text = '您似乎没有说话？' + message.content;
					}
					this.aiSpeaking(text);
				});
			},
			endCall: function() {
				console.log('ChattyInput, emohaa, 结束通话');
				this.audio?.stop();
				this.endRecord();
				this.calling = false;
				this.$emit('end-call');
			},
			intercept: function() {
				console.log('ChattyInput, intercept, this.playing = ' + this.playing +
					", this.recording = " + this.recording);
				if (this.playing) {
					this.audio?.stop();
				}
			},
			sendtoAI: function() {
				console.log('ChattyInput, sendToAI, this.playing = ' + this.playing +
					", this.recording = " + this.recording);
				if (this.playing) {
					this.audio?.stop();
				} else if (this.recording) {
					this.needContinue = true;
					this.endRecord();
				}
			},
			aiSpeaking: function(text) {
				if (!this.calling) {
					return
				}
				onSpeaking(text, (audioUrl) => {
					this.playing = true;
					this.playAudio(audioUrl);
				}, (err) => {
					this.playing = false;
					this.aiSpeaking('这个问题的答案太长了，请您结束通话后查看文字部分。还有什么可以帮您？');
				});
			},
			playAudio: function(filename) {
				this.playing = true;
				this.audioHandler(filename);

			},
			releaseAudio: function() {
				if (this.audio) {
					this.audio.destroy();
					this.audio = undefined;
				}
			},
			audioHandler: function(filename) {
				this.releaseAudio();
				this.audio = initAudio(filename, () => {
					console.log("ChattyInput, 语音播放中止");
					this.playing = false;
					this.releaseAudio();
					if (this.calling) {
						this.startRecord();
					}
				}, () => {
					console.log("ChattyInput, 语音播放完成");
					this.playing = false;
					this.releaseAudio();
					if (this.calling) {
						this.startRecord();
					}
				});
				this.audio.play();
			},
			inputLineChanged: function(e) {
				this.textAreaMinHeight = (e.detail.height + 18) + 'px';
				if (this.footSideWidth == '32px') {
					this.footSideWidth = (e.detail.height + 15) + 'px';
				}
			},
			sendMessage: function(event) {
				if (this.inputValue.trim() == '') {
					this.inputValue = '';
					uni.showToast({
						title: '发送内容不能为空~',
						icon: 'none',
						duration: 600
					});
				} else {
					//点击发送按钮时，通知父组件用户输入的内容
					this.$emit('sendMessage', {
						type: 'text',
						content: this.inputValue
					});
					this.inputValue = '';
				}
			},
			quickLogin: function(e) {
				if (e.detail?.errMsg != "getPhoneNumber:ok") {
					console.log("ChattyInput, quickLogin, failed: ", e.detail?.errMsg)
					return;
				}
				let options = {}
				if (e.detail?.code) {
					options.phoneNumberCode = e.detail.code
				}
				this.$refs.uniFabLogin.login_before('weixin', true, options)
			},
		}
	}
</script>

<style>
	@import "@/common/icon.css";

	.footer {
		display: flex;
		flex-direction: row;
		width: 100%;
		height: auto;
		overflow: hidden;
		padding: 3px;
		align-items: center;
	}

	.textarea-container {
		flex: 1;
		position: relative;
		display: flex;
		flex-direction: row-reverse;
		align-items: center;
		width: 100%;
		height: 100%;
		padding: 3px;
	}

	.textarea {
		width: 100%;
		height: 38px;
		min-height: 38px;
		max-height: 90px;
		border: solid 1px white;
		padding-left: 10px;
		padding-top: 8px;
		padding-bottom: 8px;
		font-family: verdana !important;
		overflow: hidden;
		border-radius: 10px;
		font-size: 15px;
		box-sizing: border-box;
		padding-right: 27px;
		margin-right: 5px;
		margin-left: 5px;
		line-height: 10px;
		background-color: #CBD2E4;
	}

	/deep/.uni-textarea-wrapper .uni-textarea-textarea {
		font: initial;
		font-family: verdana !important;
		font-size: 14px;
	}

	/deep/.uni-textarea-wrapper .uni-textarea-placeholder {
		top: 3px;
		overflow: initial;
	}

	.footer-left {
		width: 36px;
		height: 36px;
		display: flex;
		justify-content: center;
		align-items: center;
		margin-left: 5px;
		border-radius: 10px;
		background-color: #CBD2E4;
	}

	.footer-right {
		width: 36px;
		height: 36px;
		display: flex;
		justify-content: center;
		align-items: center;
		margin-right: 12px;
		border-radius: 10px;
		background-color: #CBD2E4;
	}

	.action-icon {
		color: #ccc;
		cursor: pointer;
		z-index: 10;
		padding: 12px;
	}

	.send-btn {
		position: absolute;
		right: 10px;
		color: #4C5382;
		background: transparent;
		border: none;
		font-size: 14px;
		z-index: 999;
	}

	.send-btn::after {
		border: none;
	}

	.textarea-container .icon {
		position: absolute;
		top: 50%;
		right: 16px;
		transform: translateY(-50%);
		color: #ccc;
		cursor: pointer;
		margin-right: 3px;
		z-index: 10;
	}

	.textarea-container .icon:hover {
		color: #ccc;
	}

	.record-loading {
		position: absolute;
		left: 10px;
		height: inherit;
		align-items: center;
		text-align: center;
		padding-top: 20px;
	}

	.recording-dots {}

	.calling-container {
		display: flex;
		flex-direction: column;
		z-index: 20;
		align-items: center;
		position: fixed;
		top: 0px;
		bottom: 0px;
		left: 0px;
		right: 0px;
		background: linear-gradient(0deg, #4C5382 3%, #000000 100%);
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