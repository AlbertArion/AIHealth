<template>
	<view class="m-item m-item_flag" ref="nessageChild" :id="'message'+id">
		<view class="m-left" :style="`width: ${leftWidthReal};`">
			<image v-if="isAIMessage" class="head-icon-dialog" :src="headSrc" />
		</view>
		<view class="m-content" v-if="!message.loading"
			:style="`padding-bottom: ${(currentMax == index + 1) ? '20px' : '0px'}`">
			<view class="m-content-head" :class="{'m-content-head-right':message.user=='customer'}">
				<!-- PDF文件区域 -->
				<view v-if="isFileMessage" class="m-content-pdf" :style="`${isPdfMessage ? '' : 'padding: 2px;'}`"
					@click="preview">
					<image v-if="isPdfMessage" style="width: 18px;" mode="widthFix"
						src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/static/record/icon_record_pdf.png" />
					<text v-if="isPdfMessage" class="m-content-pdf-text">{{message.filename}}</text>
					<image v-else style="width: 231px;" mode="widthFix" :src="message.url" />
				</view>
				<!-- 用户聊天内容 -->
				<view v-else-if="isUserMessage" class="m-content-head-customer shadow"
					:style="`font-size: ${fontStyle}; background-color: ${color};`"
					@longpress="onMessageLongPress(message.user)">
					{{message.content}}
				</view>
				<!-- AI聊天内容 -->
				<view v-else-if="isAIMessage" class="m-content-head-home-dialog shadow"
					@longpress="onMessageLongPress(message.user)">
					<uaMarkDown :fontStyle="`${fontStyle}`" :source="message.content" :width="calculatedWidth"
						:showLine="false" />
				</view>
				<!-- 每日一问区域 -->
				<view v-if="isDailyAsk" class="feedback-container">
					<view v-if="hasLogin" v-for="(item, index) in feedbackRange" :key="`feedback_${index}`"
						class="btn-basic shadow" :class="feedbackClass(index)" :style="feedbackStyle(index)"
						@click="onMessageFeedback(index)">{{item.content}}</view>
					<button v-else v-for="(item, index) in feedbackRange" :key="`feedback_${index}`"
						class="btn-basic shadow" :class="feedbackClass(index)" :style="feedbackStyle(index)"
						open-type="getPhoneNumber" @getphonenumber="quickLogin">{{item.content}}</button>
				</view>
			</view>
			<view v-if="isAIMessage && isTextMessage" class="m-content-bottom">
				<view v-if="!isPlaying && !fromDialog" style="margin-top: 1px;" @click="disapprove">
					<uni-icons v-if="message.disapprove" :color="color" size="20px" type="hand-down-filled" />
					<uni-icons v-else color="#a9a9a9" size="20px" type="hand-down" />
				</view>
				<view v-if="!isPlaying && !fromDialog" style="margin-right: 3px;" @click="approve">
					<uni-icons v-if="message.approve" :color="color" size="20px" type="hand-up-filled" />
					<uni-icons v-else color="#a9a9a9" size="20px" type="hand-up" />
				</view>
				<loading-dots v-if="isPlaying && !fromDialog" :color="color"
					style="align-self: center; margin-top: 3px; margin-right: 3px;" />
				<view v-if="!fromDialog" style="margin-right: 6px; margin-top: 1px;" @click="startTts">
					<uni-icons v-if="isPlayingAudio" :color="color" size="20px" type="sound-filled" />
					<uni-icons v-else color="#a9a9a9" size="20px" type="sound" />
				</view>
				<view class="m-content-label">来自AI的回答</view>
			</view>
		</view>
		<view class="m-right" v-if="!message.loading" :style="`width: ${rightWidthReal}`">
			<view class="customer-avatar-dialog" v-if="isUserMessage">
				<cloud-image class="customer-head-icon" width="36px" height="36px" :roundCorner="fromDialog"
					:src="userInfo.avatar_file.url" v-if="hasLogin&&userInfo.avatar_file&&userInfo.avatar_file.url" />
				<view v-else class="defaultAvatarUrl">
					<uni-icons :color="color" size="36" type="person-filled" />
				</view>
				<view class="copy-parent" v-if="isAIMessage" />
			</view>
		</view>
		<view v-if="message.loading" style="width: 80px;">
			<view class="m-content-head m-content-head-home" style="padding-left: 20px;padding-top: 15px;">
				<loading-dots :color="color" />
			</view>
		</view>
	</view>

	<!-- 如果是最后一条记录，则在后面加上引导 -->
	<view class="m-item_flag" v-if="currentMax===id+1 && guideInfo!==null"
		style="padding-bottom: 60px;padding-top: 40px;">
		<view class="guide">
			<view class="guide_title" v-if="guideInfo.title!==''">
				{{guideInfo.title}}
			</view>
			<view class="guide_text" v-if="guideInfo.content!==''">
				{{guideInfo.content}}
			</view>
			<view class="guide_select clickEacct" @click="inputSelect(item)"
				v-for="(item,index) in guideInfo.selectList" :key="index">
				<text>{{item}}</text>
				<uni-icons type="right" size="14" class="p-right-icon"></uni-icons>
			</view>
		</view>
	</view>
	<!-- 固定定位的快捷登录按钮 -->
	<uni-id-pages-fab-login style="display: none;" ref="uniFabLogin" />
</template>

<script>
	import uaMarkDown from '@/components/ua-markdown/ua-markdown.vue';
	import {
		getDateToday
	} from '@/common/utils/timestamp.js';
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store.js';
	import {
		isPdf
	} from '@/common/js/record';
	import {
		wsiPlugin,
		shortBreakIndex,
		lastAudio,
		saveLastAudio,
		initAudio
	} from '@/common/js/audio';
	import {
		monitorUpdate
	} from '@/common/js/monitor';
	const db = uniCloud.database();
	export default {
		data() {
			return {
				// 当前audio实例
				audio: undefined,
				guideInfo: null,
				messageContentOrigin: "",
				clipIndex: -1,
				playingIndex: -1
			}
		},
		components: {
			uaMarkDown
		},
		props: {
			index: {
				type: Number
			},
			feedbackRange: {
				type: Array
			},
			message: {
				type: Object
			},
			id: {
				type: String
			},
			currentMax: {
				type: Number
			},
			color: {
				type: String,
				default: '#4C5382'
			},
			fromDialog: {
				type: Boolean,
				default: false
			},
			isReport: {
				type: Boolean,
				default: false
			},
			headUrl: {
				type: String
			}
		},
		beforeUpdate() {
			this.initGuideInfo();
		},
		computed: {
			headSrc() {
				if (this.headUrl) {
					return this.headUrl;
				} else if (this.fromDialog) {
					return `https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/static/chat/calling_female.jpg`;
				} else {
					return `https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/static/chat/calling_male.jpg`;
					// return `https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/intro/zhong_rect.jpg`;
				}
			},
			isPulse() {
				return this.message._id == "000000000000000000000004";
			},
			fontStyle() {
				return store.userConfig.fontStyle == 'normal' ? '14px' : '18px';
			},
			calculatedWidth() {
				return `calc(100vw - 120px)`;
			},
			leftWidthReal() {
				return this.isUserMessage ? '50px' : '60px';
			},
			rightWidthReal() {
				return this.isAIMessage ? '40px' : '50px';
			},
			userInfo() {
				return store.userInfo;
			},
			hasLogin() {
				return store.hasLogin;
			},
			isPlaying() {
				return this.message.playing;
			},
			isPlayingAudio() {
				return this.message.playing;
			},
			isGuest() {
				return !this.hasLogin || !store.userInfo?._id;
			},
			isLocalMessage() {
				// 是否为本地消息
				return this.message._id == "000000000000000000000000" ||
					this.message._id == "000000000000000000000001" ||
					this.message._id == "000000000000000000000002" ||
					this.message._id == "000000000000000000000003" ||
					this.message._id == "000000000000000000000004";
			},
			isDailyAsk() {
				// 是否为每日一问
				return this.message._id == "000000000000000000000001" ||
					this.message._id == "000000000000000000000002" ||
					this.message._id == "000000000000000000000003" ||
					this.message._id == "000000000000000000000004";
			},
			isTextMessage() {
				return this.message.message_type == 1;
			},
			isFileMessage() {
				return this.message.message_type == 2;
			},
			isPdfMessage() {
				return isPdf(this.message.filename);
			},
			isAIMessage() {
				return this.message.user == 'home';
			},
			isUserMessage() {
				return this.message.user == 'customer';
			},
		},
		created() {
			this.messageContentOrigin = this.message.content;
			this.initGuideInfo();
		},
		methods: {
			toLogin: function() {
				uni.navigateTo({
					url: '/uni_modules/uni-id-pages/pages/login/login-withoutpwd'
				})
			},
			feedbackClass: function(statusIndex) {
				const content = this.feedbackRange[statusIndex].content;
				if (!this.message.answered) {
					return 'btn-feedback';
				} else if (this.message.answered == content) {
					return 'btn-feedback-selected';
				} else {
					return 'btn-feedback-unselected';
				}
			},
			feedbackStyle: function(statusIndex) {
				const content = this.feedbackRange[statusIndex].content;
				if (!this.message.answered) {
					return 'color: ' + this.color + '; border-color: ' + this.color + ';';
				} else if (this.message.answered == content) {
					return 'background-color: ' + this.color + ';';
				} else {
					return '';
				}
			},
			showIntro: function() {
				this.$emit('show-intro');
			},
			onMessageFeedback: function(index) {
				const el = this.feedbackRange[index];
				this.message.answered = el.content;
				this.$emit('message-feedback', {
					type: 'text',
					content: el.content,
					_id: this.message._id
				});
				let data = {};
				let type = "";
				const today = getDateToday();
				switch (this.message._id) {
					case "000000000000000000000003": {
						type = 'eat';
						data = {
							eat: el.status
						};
						store.userConfig.monitor[1].value = el.value;
						store.userConfig.monitor[1].text = el.content;
						store.userConfig.monitor[1].data = Number(el.value / 90).toFixed(2);
						store.userConfig.monitor[1].date = today;
						break;
					}
					case "000000000000000000000002": {
						type = 'feelings';
						data = {
							feelings: el.status
						};
						store.userConfig.monitor[2].value = el.value;
						store.userConfig.monitor[2].text = el.content;
						store.userConfig.monitor[2].data = Number(el.value / 90).toFixed(2);
						store.userConfig.monitor[2].date = today;
						if (el.value <= 30) {
							uni.showModal({
								content: '心情不好，跟Emohaa聊一下？',
								confirmColor: '#4C5382',
								confirmText: "好的",
								showCancel: true,
								cancelText: "不用",
								cancelColor: '#808080',
								success(res) {
									if (res.confirm) {
										uni.navigateTo({
											url: '/pages/emochat/index'
										});
									}
								}
							});
						}
						break;
					}
					case "000000000000000000000001": {
						type = 'sleep';
						data = {
							sleep: el.status
						};
						store.userConfig.monitor[3].value = el.value;
						store.userConfig.monitor[3].text = el.content;
						store.userConfig.monitor[3].data = Number(el.value / 90).toFixed(2);
						store.userConfig.monitor[3].date = today;
						break;
					}
					case "000000000000000000000004": {
						type = 'pulse';
						data = {
							pulse: el.value
						};
						store.userConfig.monitor[4].value = el.value;
						store.userConfig.monitor[4].text = el.status;
						let score = 0;
						if (el.value == 0) {
							score = 0;
						} else if (el.value > 100 || el.value < 50) {
							score = 30;
						} else if (el.value > 90) {
							score = 60;
						} else {
							score = 100;
						}
						store.userConfig.monitor[4].data = Number(score / 100).toFixed(2);
						store.userConfig.monitor[4].date = today;
						break;
					}
				}
				monitorUpdate(data);
				uni.$emit('monitorUpdate', type);
			},
			approve: function(message) {
				if (this.message.disapprove) {
					this.message.disapprove = false;
				}
				this.message.approve = !this.message.approve;
				this.updateMessage();
			},
			disapprove: function(message) {
				if (this.message.approve) {
					this.message.approve = false;
				}
				this.message.disapprove = !this.message.disapprove;
				this.updateMessage();
			},
			updateMessage: function() {
				if (this.isGuest) {
					this.toLogin();
					return;
				}
				if (this.isLocalMessage) {
					console.log("ChatDialog, 本地消息，不更新状态");
					return;
				}
				uniCloud.database().collection('chatai-msg').where({
					_id: this.message._id,
					uid: store.userInfo._id,
				}).update({
					approve: this.message.approve,
					disapprove: this.message.disapprove
				}).catch(res => {
					console.log(res, '更新chat点赞/点踩失败')
				}).then(res => {
					if (this.message.approve) {
						uni.showToast({
							title: '点赞成功~',
							icon: 'none',
							duration: 600
						});
					}
				});
			},
			startTts: function() {
				if (store.lastPlayingMessage?._id == this.message._id) {
					if (this.message.playing) {
						this.message.playing = false;
						if (this.audio) {
							this.audio.stop();
						}
					} else {
						this.message.playing = true;
						this.speaking();
					}
				} else {
					if (store.lastPlayingMessage) {
						store.lastPlayingMessage.playing = false;
						if (lastAudio) {
							lastAudio.stop();
						}
					}
					this.message.playing = true;
					store.lastPlayingMessage = this.message;
					this.speaking();
				}
			},
			releaseAudio: function() {
				if (this.audio) {
					this.audio.destroy();
					this.audio = undefined;
				}
			},
			// 播放录音
			audioHandler: function() {
				const audioUrl = this.message.audios[this.playingIndex];
				const onStop = () => {
					this.playingIndex = -1;
					this.message.playing = false;
					this.releaseAudio();
				};
				const onEnded = () => {
					this.playingIndex += 1;
					if (this.playingIndex >= this.message.audios.length) {
						this.playingIndex = -1;
						this.message.playing = false;
						this.releaseAudio();
					} else {
						this.audioHandler();
					}
				};
				this.audio = initAudio(audioUrl, onStop, onEnded);
				saveLastAudio(this.audio);
				this.audio.play();
			},
			wsiTts: function() {
				const that = this;
				const clip = this.message.clips[this.clipIndex];
				wsiPlugin.textToSpeech({
					lang: "zh_CN",
					tts: true,
					content: clip,
					success: function(res) {
						if (that.message.audios?.length > 0) {
							that.message.audios.push(res.filename);
						} else {
							that.message.audios = [res.filename];
							that.playingIndex = 0;
							that.audioHandler();
						}
						that.clipIndex += 1;
						if (that.clipIndex >= that.message.clips.length) {
							that.clipIndex = -1;
						} else {
							that.wsiTts();
						}
					},
					fail: function(err) {
						console.log("MessageShow, wechatsi 文字转语音失败: ", err);
						if (that.playingIndex == -1) {
							that.message.playing = false;
						}
						that.clipIndex = -1;
					}
				})
			},
			fillingClips: function(content) {
				if (this.message.clips?.length > 0) {
					this.message.clips.push(content);
				} else {
					this.message.clips = [content];
					this.clipIndex = 0;
					this.wsiTts();
				}
			},
			// 微信同声传译 WechatSI
			wechatSpeaking: function(text) {
				while (text.length > 150) {
					const breakIndex = 150 + shortBreakIndex(text.slice(150, text.length));
					this.fillingClips(text.slice(0, breakIndex + 1));
					text = text.slice(breakIndex + 1, text.length);
				}
				if (text.length > 0) {
					this.fillingClips(text);
				}
			},
			speaking: function() {
				this.message.audios = undefined;
				this.message.clips = undefined;
				this.wechatSpeaking(this.message.content);
			},

			initGuideInfo: function() {
				if (this.id + 1 === this.currentMax && this.guideInfo === null) {
					//最后显示，可以添加引导元素
					// uni.http.guide(null, (res) => {
					// 	console.log("查询到数据", res);
					// 	this.guideInfo = res.data.data;
					// 	//通知父组件去滑动
					// 	this.$parent.forceScrollBottom();
					// })
				}
			},
			inputSelect: function(selectValue) {
				console.log("inputSelect");
				this.$parent.getInputMessage({
					type: 'text',
					content: selectValue
				});
			},
			getDomByClass: function(classNameSelect) {
				return uni.createSelectorQuery().in(this).select(classNameSelect);
			},
			onMessageLongPress: function(msg) {
				if (this.messageContentOrigin === '') {
					this.messageContentOrigin = this.message.content;
				}
				if (this.isReport) {
					const question = this.messageContentOrigin +
						`\n请按照如下格式输出，如果没有找到相关字段，则无需输出：{ "gender": "xx", "age": "xx", "locale": "xx", "healthCondition": "xx", "timeAfterSurgery": "xx" }`;
					uni.navigateTo({
						url: `/modules/health/pages/jsonization?question=${question}`
					});
				} else {
					uni.setClipboardData({
						data: this.messageContentOrigin
					});
				}
			},
			quickLogin: function(e) {
				if (e.detail?.errMsg != "getPhoneNumber:ok") {
					console.log("ChatDialog, quickLogin, failed: ", e.detail?.errMsg)
					return;
				}
				let options = {}
				if (e.detail?.code) {
					options.phoneNumberCode = e.detail.code
				}
				this.$refs.uniFabLogin.login_before('weixin', true, options)
			},
			preview: function() {
				if (this.isPdfMessage) {
					this.openFile();
				} else {
					uni.previewImage({
						urls: [this.message.url]
					});
				}
			},
			openFile: function() {
				if (this.message.filePath?.length > 0) {
					uni.openDocument({
						filePath: this.message.filePath,
						fileType: 'pdf',
						success: (res) => {},
						fail: (err) => {},
						complete: () => {}
					});
				} else if (this.message.url?.length > 0) {
					const that = this;
					uni.downloadFile({
						url: this.message.url,
						success: function(res) {
							uni.saveFile({
								tempFilePath: res.tempFilePath,
								success: function(res) {
									that.message.filePath = res.savedFilePath;
									uni.openDocument({
										filePath: that.message.filePath,
										fileType: 'pdf',
										success: (res) => {},
										fail: (err) => {},
										complete: () => {}
									});
								}
							});
						}
					});
				} else {
					uni.showToast({
						title: '文件不存在',
						icon: 'none',
						duration: 600,
					});
				}
			},
		}
	}
</script>

<style>
	.customer-avatar {
		border-radius: 3px;
		overflow: hidden;
	}

	.customer-avatar-dialog {
		border-radius: 100%;
		overflow: hidden;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
	}

	.customer-head-icon {}

	.defaultAvatarUrl {
		width: 36px;
		height: 36px;
		justify-content: center;
		align-items: center;
		padding-bottom: 3px;
	}

	.guide {
		background-color: white;
		margin-left: 20px;
		margin-right: 20px;
		padding: 10px;
		border-radius: 5px;
	}

	.guide_title {
		font-size: 16px;
		font-weight: bold;
		padding-top: 10px;
		padding-bottom: 10px;
	}

	.guide_text {
		font-size: 14px;
		color: #575659;
		margin-bottom: 10px;
	}

	.guide_select {
		margin-top: 4px;
		display: flex;
		padding: 10px;
		background-color: #f5f6f8;
	}

	.guide_select text {
		width: 100%;
		font-size: 14px;
		font-weight: 600;
	}

	/* 点击效果 */
	.clickEacct {
		transition: background-color 0.3s ease;
		/* 过渡效果 */
	}

	.clickEacct:active {
		background-color: #ddd;
		/* 点击时的背景色 */
	}

	.m-item {
		display: flex;
		flex-direction: row;
		padding-top: 10px;
		padding-bottom: 10px;
	}

	.m-item_flag {}

	.m-left {
		display: flex;
		width: 50px;
		margin-right: 10px;
		justify-content: center;
		align-items: flex-start;
	}

	.m-content {
		display: flex;
		flex: 1;
		flex-direction: column;
		justify-content: center;
		word-break: break-all;
		font-family: Arial, sans-serif;
	}

	.m-right {
		display: flex;
		width: 50px;
		justify-content: center;
		align-items: flex-start;
		margin-left: 5px;
	}

	.copy-parent {
		display: flex;
		width: 100%;
		justify-content: flex-start;
		height: 100%;
	}

	.copy-parent .copy-child {
		font-size: 12px;
		padding: 10px;
		color: #383b9a;
	}

	.head-icon {
		width: 40px;
		height: 40px;
		border-radius: 3px;
	}

	.head-icon-dialog {
		width: 40px;
		height: 40px;
		border-radius: 100%;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
	}

	.m-content-head {
		position: relative;
	}

	.m-content-head-right {
		display: flex;
		justify-content: flex-end;
		user-select: none;
	}

	.m-content-head-home {
		font-size: 14px;
		text-align: left;
		background: white;
		border: 1px #eee solid;
		border-radius: 6px;
		padding: 10px;
		color: #4C5382;
		white-space: pre-wrap;
		/* -webkit-user-select: text; */
		user-select: none;
		-webkit-transform: scale(1.01);
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
	}

	.m-content-head-home-dialog {
		padding: 10px;
		color: #4C5382;
		font-size: 14px;
		text-align: left;
		background-color: white;
		border: 1px #F5FCFD solid;
		border-radius: 6px;
		white-space: pre-wrap;
		user-select: none;
		-webkit-transform: scale(1.01);
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
	}

	.m-content-head-home-dialog:active {
		opacity: 0.8;
	}

	.m-content-pdf-text {
		text-align: center;
		margin-left: 3px;
		white-space: nowrap;
		overflow: hidden;
		text-decoration: underline;
	}

	.m-content-image-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 50px;
		height: 50px;
		background-color: indianred;
	}

	.m-content-image {
		width: 50px;
	}

	.m-content-bottom {
		display: flex;
		flex-direction: row-reverse;
		padding-top: 6px;
	}

	.m-content-label {
		flex: 1;
		font-size: 11px;
		color: #CBD2E4;
		margin-top: 5px;
		margin-left: 9px;
	}

	.feedback-container {
		padding-top: 6px;
	}

	.btn-basic {
		height: 30px;
		line-height: 30px;
		margin-top: 5px;
		font-size: 12px;
		border-radius: 20px;
		text-align: center;
	}

	.btn-feedback {
		color: #4C5382;
		background-color: white;
	}

	.btn-feedback:active {
		background-color: rgba(76, 83, 130, 0.2);
	}

	.btn-feedback-selected {
		color: white;
		background-color: #4C5382;
		pointer-events: none;
		opacity: 0.9;
	}

	.btn-feedback-unselected {
		color: dimgray;
		background-color: white;
		pointer-events: none;
		opacity: 0.9;
	}
</style>