<template>
	<view>
		<!-- 语音识别区 -->
		<view class="feedback-content">
			<view class="input-container">
				<textarea class="input-text" v-model="content" type="text" adjust-position="false"
					placeholder="请输入您的反馈：" cursor-color="#4C5382" />
			</view>
			<view class="feedback-actions">
				<button class="action-button" @click="clear"
					style="background-color: white; color: darkgray;">取消</button>
				<button class="action-button" @click="submit"
					style="background-color: #4C5382; color: white;">提交</button>
			</view>
		</view>

		<!-- 语音音阶动画 长按说话时的动画 -->
		<view class="prompt" v-if="animation">
			<section class="dots-container">
				<view class="dot"></view>
				<view class="dot"></view>
				<view class="dot"></view>
				<view class="dot"></view>
				<view class="dot"></view>
			</section>
			<text>录音中...</text>
		</view>
		<!-- 按钮功能区 -->
		<view class="action" v-show="!shows">
			<!-- 开始录音按钮  长按录音  松手上传 text为-----开始录音----上传录音文字 -->
			<button @longpress="startRecord" @touchend="endRecord" touchstart="startRecord">{{text}}</button>
		</view>
		<view class="actioning" v-show="shows">
			<button @click="playVoice" style="background-color: #4C5382; color: white;">播放录音</button>
			<button @click="resetVoice" style="background-color: white; color: darkgray;">重置录音</button>
		</view>

	</view>
</template>

<script>
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store';
	// 录音播放事件引入
	const audio = uni.createInnerAudioContext();
	audio.autoplay = true;
	// 翻译事件引入
	var plugin = requirePlugin("WechatSI");
	let manager = plugin.getRecordRecognitionManager();

	export default {
		data() {
			return {
				text: '开始录音',
				voicePath: '',
				// 音频展示
				shows: false,
				// 动画状态
				animation: false,
				voiceState: "点击录音开始",
				content: '',
				endOne: '',
				num: 1

			}
		},
		computed: {
			// 用户昵称
			nickname() {
				return store.userInfo ? store.userInfo.nickname : "";
			}
		},
		onShow() {
			// 初始化调用
			this.initRecord();
		},
		methods: {
			startRecord() {
				console.log('Feedback, 开始录音');
				manager.start({
					duration: 60000,
					lang: "zh_CN"
				})
				this.text = '松手上传';
				this.animation = true
			},
			endRecord() {
				console.log('Feedback, 录音结束');
				this.text = '开始录音';
				this.animation = false
				this.shows = true
				manager.stop();
			},
			playVoice() {
				console.log('Feedback, 播放录音');
				if (this.voicePath) {
					audio.src = this.voicePath;
					audio.play();
				}
			},
			resetVoice() {
				console.log('Feedback, 重置录音');
				audio.stop();
				this.shows = false
				this.voicePath = '';
				this.endOne = ''
				this.voiceState = ''
				this.num = 1
			},
			clear: function() {
				this.content = '';
				this.shows = false;
			},
			submit: function() {
				const feedback = this.content?.trim();
				if (feedback?.length > 0) {
					this.uploadFeedback(this.content);
				} else {
					uni.showToast({
						title: '请输入反馈内容',
						icon: 'none',
						duration: 600
					});
				}
			},
			translate: function() {
				if (this.num == 1) {
					this.endOne = this.voiceState;
					this.num = this.num + 1;
					console.log("Feedback, translate success");
				} else {
					console.log("Feedback, translate failed");
				}
			},
			uploadFeedback: function(feedback) {
				uniCloud.callFunction({
					name: 'feedback', // 云函数名称
					data: {
						data: {
							nickname: this.nickname,
							feedback: feedback,
							config: {}
						}, // 要发送的数据
					},
				}).then(res => {
					// 处理云函数返回的数据
					this.clear();
					uni.showToast({
						title: '提交成功',
						icon: 'success',
						duration: 600, //持续时间为 2秒
					});
				}).catch(err => {
					// 处理错误
					uni.showToast({
						title: '提交失败',
						icon: 'fail',
						duration: 600, //持续时间为 2秒
					});
				});
			},
			/**
			 * 初始化语音识别回调  
			 * 绑定语音播放开始事件  
			 */
			initRecord: function() {
				manager.onStart = function(res) {
					this.voiceState = "onStart:" + res.msg + "正在录音"
					console.log("Feedback, start record: " + this.voiceState);
				};
				//有新的识别内容返回，则会调用此事件  
				manager.onRecognize = (res) => {
					this.voiceState = res.result;
					console.log("Feedback, onRecognize: " + this.voiceState);
				}
				// 识别结束事件  
				manager.onStop = (res) => {
					this.voicePath = res.tempFilePath;
					this.voiceState = res.result;
					if (this.voiceState == '') {
						console.log('Feedback, 没有说话')
						this.endOne = '周围太安静啦，再试试~';
					}
					this.content = res.result;
					console.log("Feedback, content = " + this.content);
					this.translate();
				}

				// 识别错误事件  
				manager.onError = (res) => {
					this.voiceState = '';
					this.shows = false;
					console.log("NewRecord, voice manager onError: ", res);
				}
			},
		}
	}
</script>

<style>
	.feedback-content {
		width: 84%;
		margin-left: 8%;
		min-height: 300px;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.input-container {
		width: 100%;
		height: 270rpx;
		display: flex;
		padding: 10px 10px;
		margin: 10px 20px;
		border: 1px solid #4C5382;
		border-radius: 10px;
		flex-direction: column;
	}

	.input-text {
		width: 100%;
		font-size: 14px;
		line-height: 20px;
		vertical-align: top;
	}

	.feedback-actions {
		width: 50%;
		background-color: white;
		align-self: flex-end;
		display: flex;
		flex-direction: row;
	}

	.action-button {
		width: 120px;
		font-size: 14px;
		margin-left: 10px;
	}

	.action {
		position: fixed;
		bottom: 20px;
		width: 100%;
	}

	.action button {
		background-color: #4C5382;
		color: white;
		font-size: 14px;
		display: flex;
		height: 40px;
		width: 90%;
		margin-left: 5%;
		align-items: center;
		justify-content: center;
	}

	.actioning {
		position: fixed;
		bottom: 20px;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.actioning button {
		height: 40px;
		width: 40%;
		border: 0;
		font-size: 14px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.bbig {
		width: 94%;
	}

	/* 动画 */
	.prompt {
		width: 100%;
		height: 80px;
		position: fixed;
		bottom: 70px;
	}

	.prompt text {
		position: absolute;
		bottom: 6px;
		color: #4C5382;
		left: calc(43%);
		font-size: 12px;
		animation: puls 1.5s infinite ease-in-out;
	}

	.dots-container {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 60px;
		width: 45%;
		position: absolute;
		bottom: 40px;
		left: calc(27.5%);
		background-color: rgba(0, 136, 187, 0.2);
		border-radius: 20px;
	}

	.dot {
		height: 16px;
		width: 16px;
		margin-right: 10px;
		border-radius: 10px;
		background-color: #4C5382;
		animation: pulse 1.5s infinite ease-in-out;
	}

	.dot:last-child {
		margin-right: 0;
	}

	.dot:nth-child(1) {
		animation-delay: -0.3s;
	}

	.dot:nth-child(2) {
		animation-delay: -0.1s;
	}

	.dot:nth-child(3) {
		animation-delay: 0.1s;
	}

	@keyframes pulse {
		0% {
			transform: scale(0.8);
			background-color: #4C5382;
			box-shadow: 0 0 0 0 rgba(0, 136, 187, 0.7);
		}

		50% {
			transform: scale(1.2);
			background-color: #1199cc;
			box-shadow: 0 0 0 10px rgba(17, 153, 204, 0);
		}

		100% {
			transform: scale(0.8);
			background-color: #4C5382;
			box-shadow: 0 0 0 0 rgba(0, 136, 187, 0.7);
		}
	}

	@keyframes puls {
		0% {
			transform: translateY(0px)
		}

		50% {
			transform: translateY(-4px)
		}

		100% {
			transform: translateY(0px)
		}
	}
</style>