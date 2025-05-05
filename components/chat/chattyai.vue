<template>
	<view class="dialog-container">
		<view class="uni-column" style="overflow-y: hidden;">
			<!-- #ifdef MP || APP -->
			<view :style="`${isPc ? '' : 'height: 83rpx;'}`" />
			<!-- #endif -->
			<view class="chat-nav-bar" v-if="fromHome" :style="`background-color: #9DB6F9;}`">
				<image class="chat-nav-left-icon" mode="heightFix"
					src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/static/chat/chat_nav_logo.png" />
				<view class="action-area" @click="startCall">
					<uni-icons class="action-icon" type="phone" size="24" color="white" />
				</view>
			</view>
			<view class="chat-content" id="content">
				<scroll-view upper-threshold="100" id="scrollview" scroll-y="true" @scrolltoupper="scrolltoupper"
					:style="`height: ${style.contentViewHeight}px;`" :scroll-with-animation="showAnimation"
					:scroll-top="scrollTop" scroll-into-view="bottom-input" :scroll-into-view="scrollIntoIndex">
					<view v-if="shouldLoadMessages" class="loading-view" style="padding-top: 10px;">
						<uni-icons class="rotate-animation" type="spinner-cycle" size="24" :color="color" />
					</view>
					<message-show ref="messageShow" v-for="(message,index) in messages" :key="index"
						v-bind:message="message" :id="'cc'+message._id" :currentMax="currentMax" :color="color"
						:feedbackRange="fetchFeedbackRange(message._id)" @message-feedback="onMessageFeedback"
						@show-intro="showPopup" />
					<guide-questions v-if="hasQuestions" ref="guideQuestions"
						@onGuideQuestionClick="onGuideQuestionClick" @refreshQuestions="refreshQuestions"
						:guideQuestions="guideQuestions" />
				</scroll-view>
			</view>
			<view id="bottom-input" class="float-container"
				:style="`${fromHome?'bottom: 0px;':'bottom: 13px;'} width: ${style.windowWidth}px;}`">
				<chat-input ref="chatInput" color="#4C5382" :popupShow="popupShow" @send-message="sendMessage"
					@closePopup="closePopup" @start-record="startRecord" @end-record="endRecord" @start-call="startCall"
					@call-touch-start="callTouchStart" @call-touch-end="callTouchEnd" />
			</view>
		</view>
		<uni-popup ref="agreement" type="dialog">
			<popup-tips mode="base" cancelText="不同意" confirmText="同意" :title="appTips" type="info" />
		</uni-popup>
		<uni-popup ref="popupIntro" type="dialog" @maskClick="closePopup">
			<popup-intro mode="base" @closePopup="closePopup" style="margin-top: 100px;" />
		</uni-popup>
		<!-- <uni-popup ref="popupIntro" type="dialog" @maskClick="closePopup">
			<popup-poster mode="base" @closePopup="closePopup" style="margin-top: 100px;" />
		</uni-popup> -->
	</view>
</template>

<script>
	import chatInput from './chatinput.vue';
	import messageShow from './messageshow.vue';
	import guideQuestions from '../guidequestions.vue';
	import popupIntro from '../popup/popup-intro.vue';
	import popupTips from '../popup/popup-tips.vue';
	import popupPoster from '../popup/popup-poster.vue';
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store.js'
	import {
		generateUUID,
		getRandomInviteCode
	} from '@/common/utils/generateUUID.ts'
	import {
		getDateToday,
		getNowTime
	} from '@/common/utils/timestamp.js';
	import {
		arrayBufferToString,
		handleChatData
	} from '@/common/utils/chat';
	import {
		asrOptions,
		asrPlugin,
		longBreakIndex,
		onSpeaking,
		shortBreakIndex
	} from '@/common/js/audio';
	import {
		updateEat,
		updateFeelings,
		updatePulse,
		updateSleep,
		updateSteps
	} from '@/common/js/monitor';
	import {
		compareScore
	} from '@/common/utils/tool';

	let result = '';
	const db = uniCloud.database();

	export default {
		data() {
			return {
				style: {
					contentViewHeight: 0,
					itemHeight: 0,
					windowWidth: 0,
				},
				// 默认数量
				pageSize: 10,
				// 默认页数
				pageNo: 1,
				isShowAllMessage: false,
				isInQuery: false,
				scrollTop: 0,
				scrollIntoIndex: '',
				messages: [],
				// 截流对象
				scrollTimer: null,
				isLoading: false,
				isShowLoading: false,
				//模拟队列做屏幕自动下滑
				queueCount: 0,
				queueTimer: null,
				currentMax: 1,
				showAnimation: true,
				barTitle: this.$t('dialogTitle'),
				// 流传输数据暂存
				streamMessage: {},
				guideQuestions: [],
				questionRefreshing: false,
				chat_history: [],
				history: [],
				isPc: false,
				popupShow: false,
				callTouching: false
			}
		},
		props: {
			from: {
				type: String,
				default: ''
			},
			color: {
				type: String,
				default: '#4C5382'
			},
		},
		components: {
			chatInput,
			messageShow,
			guideQuestions,
			popupIntro,
			popupTips,
			popupPoster
		},
		computed: {
			fromHome: function() {
				return this.from === 'home';
			},
			shouldLoadMessages: function() {
				return this.hasLogin && !this.isShowAllMessage;
			},
			appTips: function() {
				return this.$t('appTips');
			},
			appContent: function() {
				return this.$t('appContent');
			},
			// 用户昵称
			nickname: function() {
				return store.userInfo ? store.userInfo.nickname : "";
			},
			hasLogin() {
				return store.hasLogin;
			},
			greetings() {
				let res = "您好，";
				const now = new Date();
				const hours = now.getHours();
				if (hours >= 5 && hours < 9) {
					res = "早上好，";
				} else if (hours >= 9 && hours < 12) {
					res = "上午好，";
				} else if (hours >= 12 && hours < 17) {
					res = "下午好，";
				} else if (hours >= 17 && hours <= 22) {
					res = "晚上好，";
				} else {
					res = "辛苦了，";
				}
				return res;
			},
			hasMessage() {
				return this.messages && this.messages.length > 0;
			},
			hasQuestions() {
				return this.hasMessage && this.guideQuestions.length > 0;
			}
		},
		mounted: function() {
			console.log("ChattyAI, mounted");
			this.initStyle();
			this.getQuery();
			this.queueCount = this.queueCount++;
		},
		methods: {
			initStyle() {
				const systemInfo = getApp().globalData.systemInfo;
				this.isPc = (systemInfo.deviceType === 'pc');
				this.style.windowWidth = systemInfo.screenWidth;
				this.style.contentViewHeight = systemInfo.windowHeight - systemInfo.statusBarHeight - 115;
				console.log("ChattyAI, systemInfo: ", systemInfo);
				console.log("ChattyAI, chat-content style: ", this.style);
			},
			load: function(option) {
				uni.$on('loginSuccess', () => {
					this.getQuery();
					this.queueCount = this.queueCount++;
				});
				uni.$on('sendMessage', (message) => {
					this.sendMessage(message);
				});
				if (option.uniInvitationCode && option.uniInvitationCode.length === 6) {
					uni.setStorageSync('share_id', option.uniInvitationCode);
				} else {
					uni.removeStorageSync('share_id');
				}
				this.initUserConfig();
				this.$refs.chatInput.load();
			},
			unload: function() {
				uni.$off('sendMessage');
				uni.$off('loginSuccess');
			},
			show() {
				console.log("ChattyAI, onShow");
				if (uni.isShowLoading) {
					uni.hideLoading();
					uni.isShowLoading = false;
				}
				this.barTitle = this.$t('dialogTitle');
				if (!this.isLoading) {
					//重新设置引导语
					this.currentMax = this.messages.length;
				}
			},
			hide() {
				console.log("ChattyAI, onHide");
			},
			ready: function() {
				console.log("ChattyAI, onReady");
				const that = this;
				this.queueTimer = setInterval(() => {
					if (that.queueCount > 0) {
						that.queueCount--;
						that.scrollToBottom();
					}
				}, 500);
				// // #ifdef MP-WEIXIN
				// wx.checkIsAddedToMyMiniProgram({
				// 	success: (res) => {
				// 		console.log("checkIsAddedToMyMiniProgram_success", res);
				// 	}
				// })
				// // #endif
			},
			refreshQuestions: function() {
				this.guideQuestions = this.randomQuestions();
			},
			generateAIQuestions: function(question = "") {
				if ((!question || question.length == 0) && this.hasMessage) {
					question = this.messages[this.messages.length - 3].content;
				}
				uni.request({
					url: getApp().globalData.isDevTools() ?
						'https://test.aicareme.cn/simGen/invoke' : // 测试环境
						'https://www.aicareme.cn/simGen/invoke', // 正式环境
					method: 'POST',
					data: {
						input: {
							num: 3,
							question: question,
						},
					},
					success: (res) => {
						if (res.data?.output && res.data.output.length > 0) {
							this.guideQuestions = [];
							res.data.output.forEach((q => {
								this.guideQuestions.push(q);
							}));
						}
					},
					fail: (err) => {
						console.log("ChattyAI, generateAIQuestions failed: ", err);
					},
					complete: () => {
						this.autoScroll();
					}
				});
			},
			randomQuestions: function() {
				let questions = [];
				const questionsRange = [
					'手术后我可以立即活动吗？',
					'血压是如何形成的？',
					'常见的心脏疾病有哪些？',
					'高血压患者如何优化生活方式？',
					'什么是心律失常？',
					'高血压患者每日摄入的食盐量是多少？',
					'引起心律失常的常见原因有哪些？',
					'常见心律失常的类型包括哪些？',
					'心律失常有哪些症状？',
					'什么是心动过缓？',
					'吃糖果、喝咖啡、吃瘦肉多了好吗？',
					'减肥有何新招？',
					'怎样看脂进食？',
					'心动过缓都有哪些类型？',
					'心动过缓的治疗方法有哪些？',
					'适合高血压患者的传统养生运动有哪些？',
					'运动中要遵守的原则有哪些？',
					'运动中的注意事项有哪些？',
					'为什么有氧运动调脂效果好？',
					'怎样做好生活保健？',
					'情绪与高血压有关系吗？',
					'为什么说爱生气的人更容易患高血压？',
					'良好的情绪会对血压产生哪些影响？',
					'听音乐能降低血压吗？',
					'哪些食物可降血脂？',
					'早餐如何吃？',
					'高脂血症病人可用哪些食疗？',
					'午餐应该怎么做？',
					'高脂血症病人可吃哪些药膳？',
					'晚餐应该注意什么？',
					'胆固醇高的人怎样吃海鲜？',
					'血脂高的人如何吃肉？',
					'单靠控制饮食能降血脂吗？',
					'哪些运动可降血脂？',
					'爬楼喘气要查心肺功能吗？',
					'如何保持好心情？'
				];
				let index = 0 + Math.floor(Math.random() * 12);
				questions.push(questionsRange[index]);
				index = 12 + Math.floor(Math.random() * 12);
				questions.push(questionsRange[index]);
				index = 24 + Math.floor(Math.random() * 12);
				questions.push(questionsRange[index]);
				return questions;
			},
			closePopup: function() {
				this.popupShow = false;
				this.$refs.popupIntro.close();
			},
			showPopup: function() {
				this.popupShow = true;
				this.$refs.popupIntro.open();
			},
			initUserConfig: function() {
				const lastTime = uni.getStorageSync("aboutus");
				const today = new Date().getTime();
				// 604800000: weekInMillis | 86400000: dayInMillis
				if (lastTime && (today - lastTime < 604800000)) {
					// 时间间隔小于1周，不能再次弹出
					console.log("Chattyai, 团队介绍：时间间隔小于1周，不能再次弹出");
				} else {
					this.showPopup();
					uni.setStorageSync("aboutus", today);
				}

				if (!this.hasLogin) {
					return;
				}

				db.collection('uni-id-users')
					.where("'_id' == $env.uid")
					.field("score, freescoretaken, my_invite_code, agreed")
					.get()
					.then((res) => {
						const data = res.result.data[0];
						if (!data) {
							return;
						}
						const localScore = store.userInfo.score;
						store.userInfo.score = data.score ? data.score : 0;
						store.userInfo.freescoretaken = data.freescoretaken ? data.freescoretaken : false;
						if (!store.hasInviteCode()) {
							store.userInfo.inviteCode = data.my_invite_code ? data.my_invite_code : this
								.generateInviteCode();
						}
						if (data.agreed) {
							compareScore(localScore, data.score);
						} else {
							this.$refs.agreement.open();
						}
						store.refreshUser();
					});
			},
			generateInviteCode: async function() {
				const code = getRandomInviteCode();
				await db.collection('uni-id-users')
					.where("'_id' == $env.uid")
					.update({
						my_invite_code: code,
					});
				return code;
			},
			scrolltoupper(e) {
				console.log("ChattyAI, scrolltoupper, isInQuery = " + this.isInQuery + ", isShowAllMessage = " + this
					.isShowAllMessage);
				if (this.isInQuery) {
					return;
				}
				if (!this.isShowAllMessage) {
					this.isInQuery = true;
					this.showAnimation = false;
					this.getQuery('scrolltoupper');
				}
			},
			async getQuery(type) {

				const query = store.userInfo?._id ? {
					// 登录用户
					uid: store.userInfo._id,
					is_del: 0,
				} : {
					// 未登录用户
					did: store.userConfig.deviceID,
					is_del: 0,
				};

				// 先获取有多少条数据
				let {
					result
				} = await db.collection('chatai-msg').where(query).count();
				// 如果为0，就代表获取完毕
				if (result.total === 0) {
					this.isShowAllMessage = true;
				}

				const offset = (this.pageNo - 1) * this.pageSize;

				db.collection('chatai-msg').where(query)
					.skip(offset) // 跳过前%条
					.limit(this.pageSize) // 获取%条
					.orderBy('create_date desc')
					.get()
					.then((res) => {
						let messages = [];
						if (res?.result?.data?.length > 0) {
							let data = res?.result?.data.reverse();
							const chat = data.map(item => {
								return {
									question: item.message,
									answer: item.ai_message,
								}
							})
							this.history = chat.concat(this.history);
							data.forEach(item => {
								if (item.message) {
									messages.push({
										...item,
										user: 'customer',
										type: 'head',
										content: item.message,
									});
								} else if (item.message_type == 2) {
									messages.push({
										...item,
										user: 'customer',
										type: 'head'
									});
								}
								if (item.ai_message) {
									messages.push({
										...item,
										_id: item._id,
										user: 'home',
										content: item.ai_message,
										approve: item.approve,
										disapprove: item.disapprove,
										hasSub: true,
										playing: false
									});
								}
							})
							if (result.total > this.pageNo * this.pageSize) {
								this.pageNo = this.pageNo + 1;
							} else {
								this.isShowAllMessage = true;
							}
						} else {
							this.isShowAllMessage = true;
						}
						if (type === 'scrolltoupper') {
							if (messages.length === 0) {
								this.isShowAllMessage = true;
							} else {
								let scroolTopId = this.messages[0]._id;
								this.messages = messages.concat(this.messages)
								// 恢复滚动位置，调整滚动位置
								this.scrollIntoIndex = 'cc' + scroolTopId;
							}
						} else {
							this.messages = messages;
							this.fetchMonitor();
						}
						this.isInQuery = false;
						// uni.hideLoading();
						// res 为数据库查询结果
					}).catch((err) => {
						console.log("ChatDialog, 获取历史记录失败：", err.message);
						this.isInQuery = false;
					}).finally(() => {
						// 列表强制滑动到底部
						if (type !== 'scrolltoupper') {
							this.forceScrollBottom();
						}
					})
			},
			fetchMonitor: function() {
				if (store.userConfig.monitorUpdated) {
					this.pushDailyAsk();
				} else {
					const query = this.hasLogin ? {
						uid: store.userInfo._id
					} : {
						did: store.userConfig.deviceID
					};
					db.collection('health-monitor').where(query).orderBy('timestamp desc').get({
						getOne: true
					}).then(res => {
						const data = res.result?.data;
						if (data?.date == getDateToday()) {
							updatePulse(data);
							updateSleep(data);
							updateSteps(data);
							updateEat(data);
							updateFeelings(data);
							store.userConfig.monitorUpdated = true;
							store.userConfig.dataSource = data.dataSource;
						}
						this.pushDailyAsk();
					}).catch(err => {
						console.log("ChattyAI, 获取健康数据失败: ", err);
					});
				}
			},
			pushDailyAsk: function() {
				// 每日问答
				let whichmeal = "早饭";
				const hours = new Date().getHours();
				if (hours >= 5 && hours < 12) {
					whichmeal = "早饭";
				} else if (hours >= 12 && hours < 18) {
					whichmeal = "午饭";
				} else {
					whichmeal = "晚饭";
				}
				const welcome = [{
					_id: '000000000000000000000000',
					user: 'home',
					type: 'head',
					playing: false,
					approve: false,
					disapprove: false,
					content: `${this.greetings}欢迎您使用「心脉AI」！在这里，您可以随时向我提出心血管健康相关问题并获得我的实时回答。您也可以随时上传心血管健康相关文件并获得个体化健康建议。现在就来试试吧！`
				}, {
					_id: '000000000000000000000001',
					user: 'home',
					type: 'head',
					playing: false,
					approve: false,
					disapprove: false,
					content: `您昨天睡得怎么样？`
				}, {
					_id: '000000000000000000000002',
					user: 'home',
					type: 'head',
					playing: false,
					approve: false,
					disapprove: false,
					content: `您今天感觉怎么样？`
				}, {
					_id: '000000000000000000000003',
					user: 'home',
					type: 'head',
					playing: false,
					approve: false,
					disapprove: false,
					content: `您${whichmeal}吃的怎么样？`
				}, {
					_id: '000000000000000000000004',
					user: 'home',
					type: 'head',
					playing: false,
					approve: false,
					disapprove: false,
					content: `您今天早上醒来后的心率是多少？`
				}];
				if (!this.hasMessage) {
					this.messages.push(welcome[0]);
					this.queueCount += 1;
				}
				const today = getDateToday();
				const rangeIndices = [0];
				// 睡眠
				if (!store.isDeviceBound()) {
					const sleepData = store.userConfig.monitor[3];
					if (sleepData.date != today || !sleepData.value) {
						rangeIndices.push(1);
					}
				}
				// 表情
				const feelingData = store.userConfig.monitor[2];
				if (feelingData.date != today || !feelingData.value) {
					rangeIndices.push(2);
				}
				// 饮食
				const eatData = store.userConfig.monitor[1];
				if (eatData.date != today || !eatData.value) {
					rangeIndices.push(3);
				}
				// 心率
				if (!store.isDeviceBound()) {
					const pulseData = store.userConfig.monitor[4];
					if (pulseData.date != today || !pulseData.value) {
						rangeIndices.push(4);
					}
				}
				if (rangeIndices.length > 1) {
					const index = Math.ceil(Math.random() * (rangeIndices.length - 1)).toFixed(0);
					this.messages.push(welcome[rangeIndices[index]]);
					this.queueCount += 1;
				}
				this.messages.length > 2 ? this.generateAIQuestions() : this.randomQuestions();
			},
			fetchFeedbackRange: function(messageId) {
				return messageId == '000000000000000000000004' ? [{
					content: "<40次/分",
					status: "过慢",
					value: 35,
				}, {
					content: "40~49次/分",
					status: "略慢",
					value: 45,
				}, {
					content: "50~75次/分",
					status: "正常",
					value: 65,
				}, {
					content: "76~100次/分",
					status: "略快",
					value: 85,
				}, {
					content: ">100次/分",
					status: "过快",
					value: 120,
				}] : [{
					content: "不错",
					status: "good",
					value: 90,
				}, {
					content: "一般",
					status: "normal",
					value: 60,
				}, {
					content: "较差",
					status: "bad",
					value: 30,
				}];
			},
			forceScrollBottom: function() {
				this.scrollToBottom(false);
			},
			saveCache: function() {
				const that = this;
				setTimeout(() => {
					uni.setStorage({
						key: 'messages_list_real',
						data: that.messages.length > 20 ? that.messages.slice(that.messages.length -
							20, that.messages.length) : that.messages
					});
				}, 500)
			},
			onMessageFeedback: function(message) {
				console.log("Chattyai, onMessageFeedback, message = ", message);
				result = '';
				this.addMessage('customer', message.content, false);
				if (message.content == "较差") {
					const content = message._id == '000000000000000000000003' ?
						'给自己加个餐！没有什么比吃好更重要了' : '没有什么是睡一个好觉解决不了的事情';
					this.addMessage('home', content, false, false, false);
				} else if (message.content == "一般") {
					const content = message._id == '000000000000000000000003' ?
						'可以给自己加个餐~' : '可以试着放松一下~';
					this.addMessage('home', content, false, false, false);
				} else {
					this.addMessage('home', '好的，谢谢您与我分享~ 现在有什么我可以帮您的吗？', false, false, false);
				}
				this.queueCount += 2;
			},
			// 填充input并发送消息
			inputSend: function(message) {
				this.$refs.chatInput.inputSend(message);
			},
			// 发送输入框内容到聊天
			sendMessage: function(message) { //获取子组件的输入数据
				if (this.isLoading) {
					this.showStopDialog();
					return;
				}
				this.guideQuestions = [];
				this.showAnimation = true;
				result = '';
				if (message.message_type == 2) { // 发送PDF消息
					this.addAskMore(message);
				} else { // 发送文本消息
					this.addMessage('customer', message.content, false);
					this.queueCount++;
					const messageId = this.addMessage('home', '', false, false, true);
					this.toRobot(message, messageId);
				}
			},
			addAskMore: function(data) {
				if (!data.isAsked) { // 第一次执行'askMore'
					// 增加PDF报告消息
					const message = {
						uid: store.userInfo._id,
						nickname: store.userInfo.nickname,
						message_type: 2,
						url: data.record.fileUrl,
						filename: data.record.filename,
					};

					db.collection('chatai-msg').add(message);
					this.messages.push({
						...message,
						filePath: data.record.filePath,
						user: 'customer',
						type: 'head'
					});
					this.queueCount++;
				}
				// 增加追问消息
				this.addMessage('customer', data.question, false);
				this.queueCount++;
				const questionId = this.addMessage('home', '', false, false, true);
				this.toRobot({
					question: data.content + "\n\n上述是我的病历解读，我想知道：" + data.question,
					content: data.question
				}, questionId);
			},
			addMessage: function(user, content, hasSub, subcontent, loading) {
				const id = generateUUID();
				const now = Date.now()
				const msgData = {
					user: user,
					content: content,
					hasSub: hasSub,
					subcontent: subcontent,
					loading: loading,
					time: now,
					id,
				};
				this.messages.push(msgData);
				return id;
			},
			// 流传输显示到前端，并且添加数据到数据库
			addStreamMessage: function(content, id) {
				let message = this.messages.find(item => item.id === id);
				if (message) {
					if (message.loading) {
						message.loading = false;
						message.user = 'home';
					}
				} else {
					const now = Date.now()
					const msgData = {
						user: "home",
						content: content,
						hasSub: true,
						time: now,
						id,
					};
					this.messages.push(msgData);
				}
			},
			calculateItemHeight: function(callBack) {
				const promises = [];
				const that = this;
				let totalHeight = that.style.itemHeight || 0;

				if (this.$refs.messageShow === undefined) return;
				this.$refs.messageShow.forEach(child => {
					const promise = new Promise((resolve, reject) => {
						child.getDomByClass(".m-item_flag").boundingClientRect().exec(function(rect) {
							resolve(rect[0] ? rect[0].height : 0);
						});
					});
					promises.push(promise);
				});
				const qc = this.$refs.guideQuestions;
				if (qc) {
					const promise = new Promise((resolve, reject) => {
						qc.getDomByClass(".question-item-flag").boundingClientRect().exec(function(rect) {
							resolve(rect[0] ? rect[0].height : 0);
						});
					});
					promises.push(promise);
				}
				Promise.all(promises)
					.then(heights => {
						heights.forEach(height => {
							totalHeight += height + 20;
						});
						that.style.itemHeight = totalHeight;
						callBack();
					})
					.catch(error => {
						console.log(error);
					});
			},
			scrollToBottom: function(animation = true) {
				this.showAnimation = animation;
				this.style.itemHeight = 0;
				// #ifdef MP-WEIXIN
				this.calculateItemHeight(() => {
					this.scrollTop = this.style.itemHeight;
				});
				// #endif
			},
			showStopDialog: function() {
				uni.showModal({
					title: '提示',
					content: '您的问题还在回复中',
					showCancel: false
				});
			},
			asrTts: function() {
				const index = store.userConfig.speakingTtsIndex;
				const speakingLines = store.userConfig.speakingLines;
				const content = speakingLines[index].content;
				const onSuccess = (audioUrl) => {
					speakingLines[index].audioUrl = audioUrl;
					if (index == 0) {
						store.userConfig.speakingIndex = 0;
						this.$emit('ai-speaking');
					}
					store.userConfig.speakingTtsIndex += 1;
					if (store.userConfig.speakingTtsIndex >= speakingLines.length) {
						store.userConfig.speakingTtsIndex = -1;
					} else {
						this.asrTts();
					}
				};
				const onFail = (err) => {
					// console.log('Chattyai, textToSpeech err: ', err);
				};
				onSpeaking(content, onSuccess, onFail);
			},
			splitLines: function(writingContent, line) {
				const speakingLines = store.userConfig.speakingLines;
				const savedLength = speakingLines.length;
				if (savedLength > 0) {
					const lastLine = speakingLines[savedLength - 1].content;
					const measure = lastLine.length + line.content.length;
					// 腾讯云小程序插件TTS语音识别限制：100字以内，超过100字或者遇到断句标点，另起一段
					if (savedLength == 1 && measure > 40 || // 加速播放，第一段超过40字就开始寻找断点
						savedLength > 1 && measure > 90) { // 第二段开始，超过90字就开始寻找断点
						let breakIndex = shortBreakIndex(line.content) + 1;
						if (lastLine.length + breakIndex > 100) {
							breakIndex = 100 - lastLine.length + 1;
						}
						if (breakIndex >= 0) {
							speakingLines[savedLength - 1].content = lastLine + line.content.substring(0, breakIndex);
							speakingLines.push({
								content: line.content.substring(breakIndex)
							});
							console.log(`Chattyai, 第${savedLength}段插入完成: ` + getNowTime() + '\n' + speakingLines[
								savedLength - 1].content);
						} else {
							speakingLines[savedLength - 1].content = lastLine + line.content;
						}
					} else {
						speakingLines[savedLength - 1].content = lastLine + line.content;
					}
				} else {
					speakingLines.push({
						content: line.content
					});
					console.log(`Chattyai, 开始插入: ` + getNowTime());
				}
				if (store.userConfig.speakingTtsIndex == -1 && savedLength == 2) {
					console.log("Chattyai, 开始TTS转换: " + getNowTime());
					store.userConfig.speakingTtsIndex = 0;
					this.asrTts();
				}
				store.userConfig.captionText = writingContent;
			},
			splitLastLine: function() {
				if (!store.userConfig.calling) {
					// 非通话状态下不进行分段
					return;
				}
				console.log("Chattyai, 最后一行插入完成: " + getNowTime() + "\n" + store.userConfig.speakingLines[store
					.userConfig.speakingLines.length - 1].content);
				if (store.userConfig.speakingTtsIndex == -1) {
					store.userConfig.speakingTtsIndex = 0;
					this.asrTts();
				}
			},
			wxRobatRequest: function(receivedMessage, id) {
				const that = this;
				this.isLoading = true;
				this.isShowLoading = true;
				const question = receivedMessage.question ? receivedMessage.question : receivedMessage.content;
				const param_history = this.history.concat(this.chat_history);
				const slice_number = 0 - Math.min(param_history.length, 10);
				const requestData = {
					input: {
						repo: "",
						question: question,
						chat_history: param_history.slice(slice_number),
					},
				};
				let writingIndex = 0;
				let writingOffset = 0;
				let writingContent = "";
				let writingTimer;
				let writingEnded = false;
				console.log("Chattyai, startRequest: " + getNowTime());
				uni.http.streamWx('medical', id, requestData, // 注意，streamWx方法的参数顺序固定，不能变动
					(success, res) => {
						console.log("Chattyai, requestSuccess: " + getNowTime());
					}, (fail, err) => {
						console.log("Chattyai, requestFailed: ", err);
						//用户主动中断请求，不进行提示
						if (fail.errMsg != 'request:fail abort') {
							result += "服务器网络异常，请重试";
							let msg = that.messages.pop();
							if (msg.user === 'customer') {
								that.messages.push(msg);
							}
							that.addMessage("home", result, true);
							this.queueCount++;
						}
					}, (complete, id, input) => {
						this.splitLastLine();
						const obj = this.messages.find(item => item.id === id);
						if (obj) {
							const message = {
								message: receivedMessage.content,
								ai_message: writingContent,
								approve: false,
								disapprove: false
							};
							if (store.userInfo._id) {
								message.uid = store.userInfo._id;
								message.nickname = store.userInfo.nickname;
							} else {
								message.did = store.userConfig.deviceID;
							}
							db.collection('chatai-msg').add(message);
						}
						this.chat_history.push({
							question: receivedMessage.content,
							answer: writingContent,
						})
						writingEnded = true;
						this.isLoading = false;
						this.saveCache();
						this.queueCount++;
					}, onHeadersReceivedCallBack => {
						store.userConfig.speakingLines = [];
					}, (onChunkReceivedCallBack, id, input) => {
						const requestData = arrayBufferToString(onChunkReceivedCallBack.data);
						const receivingLines = handleChatData(requestData);

						receivingLines.forEach(line => {
							writingContent += line.content;
							if (store.userConfig.calling) {
								this.splitLines(writingContent, line);
							}
							this.addStreamMessage(writingContent, id);
						});
						if (!writingTimer) {
							writingTimer = setInterval(() => {
								const message = that.messages.find(item => item.id === id);
								if (message && writingIndex < writingContent.length) {
									message.content += writingContent.charAt(writingIndex);
									writingIndex++;
									writingOffset++;
									if (writingOffset > 20) {
										writingOffset = 0;
										that.autoScroll();
									}
								} else if (writingEnded) {
									writingIndex = 0;
									writingOffset = 0;
									writingContent = "";
									clearInterval(writingTimer);
									this.generateAIQuestions(message.content);
								}
							}, 50);
						}
					}
				);
			},
			autoScroll: function(millis = 200) {
				if (this.scrollTimer != null) {
					clearTimeout(this.scrollTimer);
				}
				this.scrollTimer = setTimeout(() => {
					this.scrollToBottom(); // 截流执行滚动到最底下，不然流添加文案时用户需要自己手动下滑
				}, millis);
			},
			toRobot: function(message, id) {
				const that = this;
				// 执行stream流读取
				that.wxRobatRequest(message, id);
			},
			onGuideQuestionClick: function(question) {
				this.sendMessage({
					content: question
				});
			},
			// 模拟语音对话需要暴露的接口
			callTouchStart: function() {
				this.callTouching = true;
			},
			callTouchEnd: function() {
				this.callTouching = false;
			},
			startCall: function() {
				store.userConfig.calling = true;
				this.$emit('start-call');
			},
			endCall: function() {
				store.userConfig.calling = false;
			},
			startRecord: function() {
				this.$emit('start-record');
			},
			endRecord: function() {
				this.$emit('end-record');
			},
		}
	}
</script>

<style>
	.dialog-container {
		background-color: #9DB6F9;
	}

	.uni-column {}

	.chat-nav-bar {
		display: flex;
		flex-direction: row;
		align-items: center;
		height: 100rpx;
		padding: 0px 10px;
	}

	@keyframes breathing {
		0% {
			/* transform: scale(0.5); */
			opacity: 0.2;
		}

		50% {
			/* transform: scale(1); */
			opacity: 0.8;
		}

		100% {
			/* transform: scale(0.5); */
			opacity: 0.2;
		}
	}

	.action-area {
		display: flex;
		flex-direction: row;
		position: fixed;
		left: 120px;
		right: 120px;
		justify-content: center;
		border-radius: 20px;
		background-color: #4C6392;
		/* animation: breathing 1.6s ease-in-out infinite; */
	}

	.action-area:active {
		opacity: 0.8;
	}

	.action-icon {
		margin: 0px 20px;
	}

	.chat-nav-left-icon {
		height: 30px;
	}

	.privacy-dialog {
		position: fixed;
		left: 20%;
		width: 60%;
		top: 20%;
		height: 60%;
		background-color: cadetblue;
	}

	.float-container {
		position: fixed;
		z-index: 10;
		bottom: 3px;
		background-color: #4C5382;
		/* 将容器置于最顶层 */
	}

	.chat-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-around;
		background: linear-gradient(135deg, #D7DCFC 0%, #E9F9F5 70%, #FBFDF0 100%);
		border-top-left-radius: 20px;
		border-top-right-radius: 20px;
		border: 2px solid #E9ECFD;
		border-bottom-width: 0px;
	}

	.logo {
		height: 100rpx;
		width: 100rpx;
		margin-top: 100rpx;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 25rpx;
	}

	.text-area {
		display: flex;
		justify-content: center;
	}

	.title {
		font-size: 36rpx;
		color: #8f8f94;
	}
</style>