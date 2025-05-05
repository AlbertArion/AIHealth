<template>
	<view class="dialog-container">
		<view class="uni-column" style="overflow-y: hidden;">
			<!-- #ifdef MP || APP -->
			<view :style="`${isPc ? '' : 'height: 81rpx; width: 100%;'}`" />
			<!-- #endif -->
			<uni-nav-bar :border="false" @clickLeft="onBackPressed" left-icon="back" color="#ffffff"
				background-color="transparent" height="100rpx" :title="barTitle" />
			<view class="dialog-content" id="content">
				<scroll-view class="dialog-scroll-view" upper-threshold="100" id="scrollview" scroll-y="true"
					:style="`height: ${style.contentViewHeight}px;`" :scroll-with-animation="showAnimation"
					:scroll-top="scrollTop" scroll-into-view="bottom-input" @scrolltoupper="scrolltoupper"
					:scroll-into-view="scrollIntoIndex">
					<view v-if="shouldLoadMessages" class="loading-view" style="padding-top: 10px;">
						<uni-icons class="rotate-animation" type="spinner-cycle" size="24" :color="color" />
					</view>
					<message-show ref="messageShow" v-for="(message,index) in messages" :key="index"
						v-bind:message="message" :id="'cc'+message._id" :currentMax="currentMax" :color="color"
						:fromDialog="true"
						:isReport="from == 'checkin' && index == messages.length - 1 && extra_params.finish == true" />
					<view class="chat-dialog-finish-wrap">
						<view v-if="isShowFinishButton && !isDialogFinished" @click="endDialog"
							class="chat-dialog-finish-wrap-view">
							<text class="text">结束对话,生成总结</text>
						</view>
						<view v-if="isDialogFinished" @click="newDialog" class="chat-dialog-finish-wrap-view">
							<text class="text">开启新的对话</text>
						</view>
					</view>
				</scroll-view>
			</view>
			<view class="float-container" id="bottom-input" :style="`width: ${style.windowWidth}px;}`">
				<chatty-input ref="chatInput" @show-history="showHistory" @send-message="getInputMessage"
					@last-message="getLastMessage" @end-call="endCall" @closePopup="closePopup" :color="color"
					:popupShow="popupShow" :fromDialog="true" :fromCheckIn="from == 'checkin'" />
			</view>
			<uni-notice-bar v-if="noticeMessage!=''" show-close
				style="position: absolute; top: 180rpx; height: 50px; width: 100%; z-index: 10;" show-icon
				:text="noticeMessage" />
		</view>
		<uni-popup ref="popupConfig" type="dialog" @maskClick="closePopup">
			<popup-config ref="config" mode="base" @closePopup="closePopup" style="margin-top: 100px;" />
		</uni-popup>
		<uni-drawer ref="showLeft" mode="left" :width="300" @change="drawerChange($event)">
			<history-drawer ref="historyComp" @loadHistory="loadHistory" :v-if="showLeft" />
		</uni-drawer>
	</view>
</template>

<script>
	import chattyInput from './chattyinput.vue';
	import messageShow from '@/components/chat/messageshow.vue';
	import guideQuestions from '@/components/guidequestions.vue';
	import historyDrawer from './history.vue';
	import popupConfig from '@/components/popup/popup-patient-config.vue';
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store.js';
	import {
		generateUUID,
		getRandomInviteCode
	} from '@/common/utils/generateUUID.ts';
	import {
		arrayBufferToString,
		handleChatData,
		handleChatNonJsonData,
	} from '@/common/utils/chat';
	var result = '';
	const db = uniCloud.database();
	var requestTaskG = null;
	export default {
		data() {
			return {
				style: {
					pageHeight: 0,
					contentViewHeight: 0,
					footViewHeight: 90,
					itemHeight: 0,
					windowWidth: 0,
				},
				showLeft: false,
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
				noticeMessage: '',
				currentMax: 1,
				showAnimation: true,
				showTopGuide: false,
				barTitle: this.from == 'checkin' ? '智能入组' : '智能随访',
				// 流传输数据暂存
				streamMessage: {},
				showModelSelect: false,
				guideQuestions: [],
				questionRefreshing: false,
				chat_history: [],
				history: [],
				isPc: false,
				popupShow: false,
				isShowFinishButton: false,
				isDialogFinished: false,
				// 对话id
				parent_id: '',
				// 对话额外字段
				extra_params: {
					num: 0,
					/**
					 * question_type: 问诊类型
					 * 	取值范围：
					 * 		checkin: 智能入组
					 * 		fibrillation: 心房颤动
					 * 		baseInfo: 基本信息
					 * 		familyHistory: 家族病史
					 * 		healthHistory: 个人病史
					 * 		sport: 运动状况
					 */
					question_type: this.from == 'checkin' ? 'checkin' : 'fibrillation',
					finish: false,
				},
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
		computed: {
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
			hasMessage() {
				return this.messages && this.messages.length > 0;
			},
			hasQuestions() {
				return this.hasMessage && this.guideQuestions.length > 0;
			},
			needPopup() {
				// return !store.userConfig.realname || !store.userConfig.doctor;
				return false;
			}
		},
		components: {
			chattyInput,
			messageShow,
			guideQuestions,
			historyDrawer,
			popupConfig
		},
		mounted: function() {
			console.log("ChattyComp, mounted");
			this.loadHeight('dialog');
			const query = store.userInfo?._id ? {
				// 登录用户
				uid: store.userInfo._id,
				is_del: 0,
				chat_type: 1,
			} : {
				// 未登录用户
				did: store.userConfig.deviceID,
				is_del: 0,
				chat_type: 1,
			};
			if (this.from == 'checkin') {
				// 智能入组
				this.onLoadAll();
				return;
			}
			db.collection('chatai-dialog-list').where(query)
				.orderBy('create_date desc')
				.get({
					getOne: true
				})
				.then((res) => {
					const data = res.result.data;
					if (data) {
						this.parent_id = data.msg_id;
						this.getQuery();
						if (data.is_finish === 1 || !data.question_type) {
							this.onFinishDialog();
						} else {
							this.extra_params.question_type = data.question_type;
							this.extra_params.num = data.num;
						}
						store.userConfig.realname = data.realname ? data.realname : '';
						store.userConfig.doctor = data.doctor ? data.doctor : '';
						this.$refs.config.updateUser();

					} else {
						this.onLoadAll();
					}
					if (this.needPopup) {
						this.showPopup();
					}
				})
			this.queueCount = this.queueCount++;
		},
		methods: {
			onLoadAll: function() {
				this.isShowAllMessage = true;
				this.pushGuideMessage();
			},
			loadHistory: function(data) {
				console.log(data, 'data');
				this.pageSize = 10
				// 默认页数
				this.pageNo = 1
				this.messages = [];
				this.isShowAllMessage = false;
				this.$refs['showLeft'].close()
				this.parent_id = data.msg_id;
				this.getQuery();
				if (data.is_finish === 1) {
					this.onFinishDialog();
				}
			},
			drawerChange: function(e) {
				// this.$refs['showLeft'].close()
				this.showLeft = e;
			},
			loadHeight: function(type) {
				const systemInfo = getApp().globalData.systemInfo;
				if (systemInfo.deviceType === 'pc') {
					this.isPc = true;
				}
				this.style.pageHeight = systemInfo.windowHeight;
				this.style.windowWidth = systemInfo.screenWidth;
				this.style.contentViewHeight = (getApp().globalData.platform === 'mp-weixin') ? (systemInfo
					.windowHeight - systemInfo.windowTop - systemInfo.statusBarHeight - 137) : (systemInfo
					.screenHeight / 1.4);
			},
			showPopup: function() {
				this.popupShow = true;
				this.$refs.popupConfig.open();
			},
			closePopup(updated = false) {
				this.popupShow = false;
				this.$refs.popupConfig.close();
				if (updated) {
					const dbData = {};
					if (store.userConfig.realname?.length > 0) {
						dbData.realname = store.userConfig.realname;
					}
					if (store.userConfig.doctor?.length > 0) {
						dbData.doctor = store.userConfig.doctor;
					}
					const collName = this.from == 'checkin' ? 'chatai-scenario-list' : 'chatai-dialog-list';
					db.collection(collName).where({
						msg_id: this.parent_id,
					}).update(dbData);
				}
			},
			load: function(option) {
				console.log("ChattyComp, onLoad, option: ", option);
				if (option.uniInvitationCode && option.uniInvitationCode.length === 6) {
					uni.setStorageSync('share_id', option.uniInvitationCode);
				} else {
					uni.removeStorageSync('share_id');
				}
				this.$refs.chatInput.load();
			},
			show: function() {
				console.log("ChattyComp, onShow");
				if (uni.isShowLoading) {
					uni.hideLoading();
					uni.isShowLoading = false;
				}
				if (!this.isLoading) {
					//重新设置引导语
					this.currentMax = this.messages.length;
				}
				this.$refs.chatInput.show();
			},
			hide: function() {
				console.log("ChattyComp, onHide");
				this.$refs.chatInput.hide();
			},
			ready: function() {
				console.log("ChattyComp, onReady");
				const that = this;
				this.queueTimer = setInterval(() => {
					if (that.queueCount > 0) {
						that.queueCount--;
						that.scrollToBottom();
					}
				}, 500);
			},
			refreshQuestions: function() {
				this.guideQuestions = this.randomQuestions();
			},
			generateAIQuestions: function(question = "") {
				if ((!question || question.length == 0) && this.hasMessage) {
					question = this.messages[this.messages.length - 3].content;
				}
				uni.request({
					url: getApp().globalData.isDevTools() ? 'https://test.aicareme.cn/simGen/invoke' :
						'https://www.aicareme.cn/simGen/invoke',
					method: 'POST',
					data: {
						input: {
							num: 3,
							question: question,
						},
					},
					success: (res) => {
						console.log("ChattyComp, generateAIQuestions success, question = " + question,
							res);
						if (res.data?.output && res.data.output.length > 0) {
							this.guideQuestions = [];
							res.data.output.forEach((q => {
								this.guideQuestions.push(q);
							}));
						}
					},
					fail: (err) => {
						console.log("ChattyComp, generateAIQuestions failed: ", err);
					},
					complete: () => {
						this.autoScroll();
					}
				});
			},
			newDialog: function() {
				this.$refs.historyComp.getQuery();
				this.loadHeight('dialog')
				this.chat_history = [];
				this.history = [];
				this.messages = [];
				this.onLoadAll();
				this.isDialogFinished = false;
				this.queueCount = 0;
				this.isShowFinishButton = false;
				this.parent_id = '';
				this.extra_params.question_type = this.from == 'checkin' ? 'checkin' : 'fibrillation';
				this.extra_params.num = 0;
			},
			endDialog: function() {
				this.onFinishDialog();
				const id = this.addMessage('home', '', false, false, true);
				this.queueCount++;
				this.wxRobatRequest('', id, 'report');
			},
			dialogReport: function(text) {
				this.onFinishDialog();
				this.queueCount++;
				const collName = this.from == 'checkin' ? 'chatai-scenario-list' : 'chatai-dialog-list';
				db.collection(collName).where({
					msg_id: this.parent_id,
				}).update({
					is_finish: 1,
					summary: text,
				});
			},
			onFinishDialog: function() {
				this.loadHeight('reset')
				this.isDialogFinished = true;
			},
			endCall: function() {
				if (!this.isDialogFinished && this.extra_params.finish) {
					this.endDialog();
				}
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
			scrolltoupper(e) {
				if (this.isInQuery) {
					return;
				}
				if (!this.isShowAllMessage) {
					this.isInQuery = true;
					this.getQuery('scrolltoupper');
				}
			},
			async getQuery(type) {
				this.isInQuery = true;
				const query = store.userInfo?._id ? {
					// 登录用户
					uid: store.userInfo._id,
					is_del: 0,
					parent_id: this.parent_id
				} : {
					// 未登录用户
					did: store.userConfig.deviceID,
					is_del: 0,
					parent_id: this.parent_id
				};

				// 先获取有多少条数据
				let {
					result
				} = await db.collection('chatai-dialog').where(query).count();
				// 如果为0，就代表获取完毕
				if (result.total === 0) {
					this.isShowAllMessage = true;
				}

				const offset = (this.pageNo - 1) * this.pageSize;
				db.collection('chatai-dialog').where(query)
					.skip(offset) // 跳过前%条
					.limit(this.pageSize) // 获取%条
					.orderBy('create_date desc')
					.get()
					.then((res) => {
						console.log(res, 'res');
						let messages = [];
						if (res?.result?.data?.length > 0) {
							let data = res?.result?.data.reverse();
							const chat = data.map(item => {
								return {
									question: item.message,
									answer: item.ai_message,
								}
							});
							this.history = chat.concat(this.history);
							data.forEach(item => {
								if (item.message) {
									messages.push({
										...item,
										user: 'customer',
										type: 'head',
										content: item.message,

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
							if (type === 'scrolltoupper') {
								const scrollTopId = this.messages[0]._id;
								this.messages = messages.concat(this.messages)
								// 恢复滚动位置，调整滚动位置
								this.scrollIntoIndex = 'cc' + scrollTopId;
							} else {
								this.messages = messages;
							}
							if (result.total > this.pageNo * this.pageSize) {
								this.pageNo = this.pageNo + 1;
							} else {
								this.onLoadAll();
							}
						} else {
							this.onLoadAll();
							if (type === 'scrolltoupper') {} else {
								this.messages = messages;
							}
						}

						this.isInQuery = false;
						// uni.hideLoading();
						// res 为数据库查询结果
					}).catch((err) => {
						console.log("ChatDialog, 获取历史记录失败：", err.message);
						this.isInQuery = false;
					}).finally(() => {
						this.isInQuery = false;
						// 列表强制滑动到底部
						if (type !== 'scrolltoupper') {
							this.forceScrollBottom();
						}
						this.isShowFinishButton = this.messages.length > 6;
					})
			},
			pushGuideMessage: function(messages = this.messages) {
				const welcome = [{
					_id: '000000000000000000000000',
					user: 'home',
					type: 'head',
					playing: false,
					approve: false,
					disapprove: false,
					content: this.from == 'checkin' ?
						'您好！欢迎入驻安贞医院心脏康复中心，请问您是否有意向参与「“冠脉搭桥术后老年患者规范化康复路径的临床研究」？' :
						'欢迎使用智能随访，我是您的健康助手，接下来我想要了解一下您最近的健康状况，您看可以吗？'
				}];
				messages.unshift(welcome[0]);
			},
			onBackPressed: function() {
				uni.navigateBack();
			},
			showHistory: function(e) {
				this.$refs['showLeft'].open()
			},
			forceScrollBottom: function() {
				//关闭动画，滑倒底部 
				this.showAnimation = false;
				this.scrollTop = this.scrollTop - 10;
				this.scrollToBottom();
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
			getLastMessage: function(callback) {
				callback(this.isDialogFinished, this.messages[this.messages.length - 1]);
			},
			// 发送输入框内容到聊天
			getInputMessage: function(message) { //获取子组件的输入数据
				if (this.isDialogFinished) {
					uni.showToast({
						title: '该对话已结束，如果您要提问，请点击开启新的对话进行提问~',
						icon: 'none',
						duration: 3000,
					});
					return;
				}
				if (this.isLoading) {
					this.showStopDialog();
					return;
				}
				if (!this.parent_id) {
					let id = generateUUID();
					this.parent_id = id;
					let obj = {
						uid: store.userInfo._id,
						nickname: store.userInfo.nickname,
						realname: store.userConfig.realname,
						doctor: store.userConfig.doctor,
						title: message.content,
						msg_id: id,
						num: 0,

					}
					if (!obj.uid) {
						obj['did'] = store.userConfig.deviceID
					}
					if (this.from == 'checkin') {
						obj['type'] = 'checkin';
						obj['question_type'] = 'checkin';
						db.collection('chatai-scenario-list').add(obj);
					} else {
						obj['question_type'] = 'fibrillation';
						db.collection('chatai-dialog-list').add(obj);
					}
				}
				this.guideQuestions = [];
				this.showAnimation = true;
				result = '';
				this.addMessage('customer', message.content, false);
				const id = this.addMessage('home', '', false, false, true);
				this.queueCount++;
				this.toRobot(message.content, id);
			},
			addMessage: function(user, content, hasSub, subcontent, loading) {
				let id = generateUUID();
				var that = this;
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
				that.messages.push(msgData);
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
							resolve(rect[0].height);
						});
					});
					promises.push(promise);
				});
				const qc = this.$refs.guideQuestions;
				if (qc) {
					const promise = new Promise((resolve, reject) => {
						qc.getDomByClass(".question-item-flag").boundingClientRect().exec(function(rect) {
							resolve(rect[0].height);
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
			scrollToBottom: function() {
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
					showCancel: false,
					success: function(res) {

					}
				});
			},
			wxRobatRequest: function(question, id, type) {
				this.isLoading = true;
				this.isShowLoading = true;
				const param_history = this.history.concat(this.chat_history)
				const requestData = {
					input: {
						repo: "",
						question: question,
						chat_history: param_history,
						extra_params: {
							clinic_type: type === 'report' ? 'report' : 'inquiry',
							num: this.extra_params.num,
							question_type: this.extra_params.question_type,
						}
					},
				};
				let writingIndex = 0;
				let writingOffset = 0;
				let writingContent = "";
				let writingTimer;
				let writingEnded = false;
				const scenario = this.from == 'checkin' ? 'checkin' : 'clinic';
				requestTaskG = uni.http.streamWx(scenario, id, requestData, // 注意，streamWx方法的参数顺序固定，不能变动
					(success, res) => {
						console.log("ChattyComp, AI stream answer success");
					}, (fail, err) => {
						console.log("ChattyComp, AI stream answer failed", err);
						//用户主动中断请求，不进行提示
						if (fail.errMsg != 'request:fail abort') {
							result += "服务器网络异常，请重试";
							let msg = this.messages.pop();
							if (msg.user === 'customer') {
								this.messages.push(msg);
							}
							this.addMessage("home", result, true);
							this.queueCount++;
						}
					}, (complete, id, input) => {
						this.$refs.chatInput.aiSpeaking(writingContent);
						if (type == 'report') {} else {
							this.updateQuestionType();
						}
						const obj = this.messages.find(item => item.id === id);
						if (obj) {
							if (store.userInfo._id) {
								db.collection('chatai-dialog').add({
									uid: store.userInfo._id,
									nickname: store.userInfo.nickname,
									message: input.question,
									ai_message: writingContent,
									approve: false,
									disapprove: false,
									parent_id: this.parent_id,
								});
							} else {
								db.collection('chatai-dialog').add({
									did: store.userConfig.deviceID,
									message: input.question,
									ai_message: writingContent,
									approve: false,
									disapprove: false,
									parent_id: this.parent_id,
								});
							}

							if (type === 'report') {
								this.dialogReport(writingContent);
							} else {
								const query = {
									msg_id: this.parent_id,
								};
								const collName = this.from == 'checkin' ?
									'chatai-scenario-list' : 'chatai-dialog-list';
								db.collection(collName).where(query).update({
									num: this.extra_params.num,
									question_type: this.extra_params.question_type,
								});
							}
						}
						this.chat_history.push({
							question: input.question,
							answer: writingContent,
							clinic_type: type === 'report' ? 'report' : 'inquiry',
							num: this.extra_params.num,
							question_type: this.extra_params.question_type,
						});
						this.isShowFinishButton = this.messages?.length > 4;
						writingEnded = true;
						this.isLoading = false;
						this.queueCount++;
					}, onHeadersReceivedCallBack => {

					}, (onChunkReceivedCallBack, id, input) => {
						const requestData = arrayBufferToString(onChunkReceivedCallBack.data);
						const lines = handleChatData(requestData);
						lines.forEach(line => {
							writingContent += line.content;
							this.addStreamMessage(writingContent, id);
						});
						if (!writingTimer) {
							writingTimer = setInterval(() => {
								const message = this.messages.find(item => item.id === id);
								if (message && writingIndex < writingContent.length) {
									message.content += writingContent.charAt(writingIndex);
									writingIndex++;
									writingOffset++;
									if (writingOffset > 5) {
										writingOffset = 0;
										this.autoScroll();
									}
								} else if (writingEnded) {
									writingIndex = 0;
									writingOffset = 0;
									writingContent = "";
									clearInterval(writingTimer);
									this.autoScroll();
								}
							}, 50);
						}
					}
				);
			},
			updateQuestionType: function() {
				this.extra_params.num = this.extra_params.num + 1;
				let num = this.extra_params.num;
				let question_type = this.extra_params.question_type;
				if (this.from == 'checkin') {
					if (num === 8 && question_type === "checkin") {
						// finish
						this.extra_params.finish = true;
					}
				} else {
					if (num >= 38 && question_type === "fibrillation") {
						// finish
						this.extra_params.finish = true;
					} else if (num === 7 && question_type === "baseInfo") {
						this.extra_params.question_type = "familyHistory";
						this.extra_params.num = 0;
					} else if (num === 3 && question_type === "familyHistory") {
						this.extra_params.question_type = "healthHistory";
						this.extra_params.num = 0;
					} else if (num === 7 && question_type === "healthHistory") {
						this.extra_params.question_type = "sport";
						this.extra_params.num = 0;
					} else if (num === 4 && question_type === "sport") {
						// finish
						this.extra_params.finish = true;
					}
				}
			},
			autoScroll: function(millis = 200) {
				if (this.scrollTimer != null) {
					clearTimeout(this.scrollTimer);
				}
				this.scrollTimer = setTimeout(() => {
					this.scrollToBottom(); // 截流执行滚动到最底下，不然流添加文案时用户需要自己手动下滑
				}, millis);
			},

			isValidData: function(data) {
				return typeof data === 'object' && data !== null && typeof data.content === 'string' && data.content
					.trim() !== '';
			},
			toRobot: function(info, id) {
				// 执行stream流读取
				this.wxRobatRequest(info, id, this.extra_params.finish === true ? 'report' : 'inquiry');
			}
		}
	}
</script>

<style>
	.chat-dialog-finish-wrap {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.chat-dialog-finish-wrap-view {
		width: auto;
		padding: 10rpx 50rpx;
		margin-left: 20rpx;
		margin-right: 20rpx;
		margin-top: 10rpx;
		margin-bottom: 40rpx;
		background-color: transparent;
		color: dimgray;
		font-size: 12px;
		font-family: Arial, sans-serif;
		border-radius: 30px;
		border: #a9a9a9 1px solid;
	}

	.dialog-container {
		background: linear-gradient(90deg, #4C5382 0%, #9DB6F9 100%);
	}

	.dialog-scroll-view {
		/* margin-bottom: 55px; */
	}

	.privacy-dialog {
		position: fixed;
		left: 20%;
		width: 60%;
		top: 20%;
		height: 60%;
		background-color: cadetblue;
	}

	.dialog_text {
		padding: 10px 20px;
		background-color: rgb(76, 76, 76, 0.8);
		color: #fafafa;
		font-size: 14px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		font-family: Arial, sans-serif;
		border-radius: 5px;
		max-width: 300px;
	}

	.float-container {
		position: fixed;
		z-index: 10;
		bottom: 0px;
		padding-bottom: 24px;
		background-color: #4C5382;
	}

	.dialog-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-around;
		background: linear-gradient(135deg, #D7DCFC 0%, #E9F9F5 70%, #FBFDF0 100%);
		border-top-left-radius: 20px;
		border-top-right-radius: 20px;
		border: 2px solid #E9ECFD;
		border-bottom-width: 1px;
		overflow: hidden;
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