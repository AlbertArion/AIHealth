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
					<message-show ref="messageShow" v-for="(message,index) in messages" :key="index" :index="index"
						:fromDialog="true" v-bind:message="message" :id="'cc'+message._id" :currentMax="currentMax"
						:color="color" />
					<tool-bar ref="toolBar" v-if="couldInquiry" @item-click="requestInquiry" />
				</scroll-view>
			</view>
			<view class="float-container" id="bottom-input" :style="`width: ${style.windowWidth}px;}`">
				<chatty-input ref="chatInput" @send-message="sendMessage" @last-message="getLastMessage" :color="color"
					:fromDialog="true" :fromCheckIn="from == 'checkin'" />
			</view>
		</view>
	</view>
</template>

<script>
	import chattyInput from './chattyinput.vue';
	import toolBar from '@/components/chat/toolbar.vue';
	import messageShow from '@/components/chat/messageshow.vue';
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store.js';
	import {
		generateUUID,
		getRandomInviteCode
	} from '@/common/utils/generateUUID.ts';
	import {
		arrayBufferToString,
		fetchlines,
		handleChatData,
		handleChatNonJsonData
	} from '@/common/utils/chat';
	import {
		promptPdfCondition,
		promptInquiry
	} from '@/common/utils/prompt';
	var result = '';
	const db = uniCloud.database();
	var requestTaskG = null;
	export default {
		data() {
			return {
				records: [],
				style: {
					pageHeight: 0,
					contentViewHeight: 0,
					footViewHeight: 90,
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
				showAnimation: true,
				showTopGuide: false,
				barTitle: "综合解读",
				// 流传输数据暂存
				streamMessage: {},
				showModelSelect: false,
				questionRefreshing: false,
				chat_history: [],
				history: [],
				isPc: false,
				isDialogFinished: false,
				// 对话id
				parent_id: '',
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
			}
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
			hasMessages() {
				return this.messages?.length > 0;
			},
			couldSummarize() {
				return this.messages?.length > 11;
			},
			couldInquiry() {
				return (this.records?.length > 1 || this.messages?.length > 9) && !this.isDialogFinished && !this.messages[
					this.messages.length - 1].loading;
			},
			currentMax: function() {
				return this.messages.length;
			}
		},
		components: {
			chattyInput,
			messageShow,
			toolBar
		},
		mounted: function() {
			this.loadHeight('dialog');
		},
		methods: {
			load: function(option) {
				if (option.uniInvitationCode && option.uniInvitationCode.length === 6) {
					uni.setStorageSync('share_id', option.uniInvitationCode);
				} else {
					uni.removeStorageSync('share_id');
				}
				this.$refs.chatInput.load();
				this.records.unshift(store.healthRecords[option.index]);
				const query = store.userInfo?._id ? {
					// 登录用户
					uid: store.userInfo._id,
					is_del: 0,
					chat_type: 3,
				} : {
					// 未登录用户
					did: store.userConfig.deviceID,
					is_del: 0,
					chat_type: 3,
				};
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
							if (data.is_finish === 1) {
								this.onFinishDialog();
							}
						} else {
							this.onLoadAll();
						}
					})
				this.queueCount = this.queueCount++;
			},
			show: function() {
				this.$refs.chatInput.show();
			},
			hide: function() {
				this.$refs.chatInput.hide();
			},
			ready: function() {
				this.queueTimer = setInterval(() => {
					if (this.queueCount > 0) {
						this.queueCount--;
						this.scrollToBottom();
					}
				}, 500);
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
			onLoadAll: function() {
				this.isShowAllMessage = true;
			},
			onFinishDialog: function() {
				this.loadHeight('reset')
				this.isDialogFinished = true;
			},
			scrolltoupper: function(e) {
				if (this.isInQuery) {
					return;
				}
				if (!this.isShowAllMessage) {
					this.isInQuery = true;
					this.getQuery('scrolltoupper');
				}
			},
			getQuery: async function(type) {
				this.isInQuery = true;
				const query = store.userInfo?._id ? {
					// 登录用户
					uid: store.userInfo._id,
					is_del: 0,
					parent_id: this.parent_id,
					chat_type: 3,
				} : {
					// 未登录用户
					did: store.userConfig.deviceID,
					is_del: 0,
					parent_id: this.parent_id,
					chat_type: 3,
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
								// 用户消息
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
								// AI消息
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
								this.messages = messages.concat(this.messages);
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
							if (type === 'scrolltoupper') {
								// 滚动到顶部，查询上一页
							} else {
								// 首次/刷新查询
								this.messages = messages;
								this.pushPdfMessage();
							}
							this.onLoadAll();
						}
						this.isInQuery = false;
					}).catch((err) => {
						console.log("ChatDialog, 获取历史记录失败：", err.message);
						this.isInQuery = false;
					}).finally(() => {
						this.isInQuery = false;
						// 列表强制滑动到底部
						if (type !== 'scrolltoupper') {
							this.forceScrollBottom();
						}
					})
			},
			pushPdfMessage: function() {
				const message = {
					message_type: 2
				};
				this.sendMessage(message);
			},
			onBackPressed: function() {
				uni.navigateBack();
			},
			forceScrollBottom: function() {
				//关闭动画，滑倒底部 
				this.showAnimation = false;
				this.scrollTop = this.scrollTop - 10;
				this.scrollToBottom();
			},
			saveCache: function() {
				setTimeout(() => {
					uni.setStorage({
						key: 'messages_list_real',
						data: this.messages.length > 20 ? this.messages.slice(this.messages.length -
							20, this.messages.length) : this.messages
					});
				}, 500)
			},
			getLastMessage: function(callback) {
				callback(this.isDialogFinished, this.messages[this.messages.length - 1]);
			},
			// 发送输入框内容到聊天
			sendMessage: function(message) { //获取子组件的输入数据
				if (this.isLoading) {
					this.showStopDialog();
					return;
				}
				if (!this.parent_id) {
					this.parent_id = generateUUID();
					let obj = {
						uid: store.userInfo._id,
						nickname: store.userInfo.nickname,
						title: message.content,
						msg_id: this.parent_id,
						chat_type: 3,
					}
					if (!obj.uid) {
						obj['did'] = store.userConfig.deviceID;
					}
					db.collection('chatai-dialog-list').add(obj);
				}
				this.showAnimation = true;
				result = '';
				if (message.message_type == 2) { // 发送PDF消息
					this.addPdfMessage('customer', message);
					this.queueCount++;
				} else { // 发送文本消息
					this.addMessage('customer', message.content, false);
					this.queueCount++;
					const messageId = this.addMessage('home', '', false, false, true);
					const question = "你是一名十分懂得提供情绪价值的医生，我是一位患者，我的问题是：" + message.content +
						(this.couldSummarize ? '' : "；\n请直接问一个和我病情有关的问题，不要赘述。");
					console.log("InquiryChat, question = " + question);
					this.requestAI('medical', '', messageId, question);
					// this.requestAI('clinic', 'inquiry', messageId, message.content);
				}
			},
			addPdfMessage: function(user, data) {
				if (data.record) {
					this.records.unshift(data.record);
				}
				const message = {
					uid: store.userInfo._id,
					nickname: store.userInfo.nickname,
					parent_id: this.parent_id,
					chat_type: 3,
					message_type: 2,
					url: this.records[0].fileUrl,
					filename: this.records[0].filename
				};
				// db.collection('chatai-dialog').add(message);
				const pdfMessageId = generateUUID();
				this.messages.push({
					...message,
					filePath: data.record?.filePath,
					user: user,
					type: 'head',
					id: pdfMessageId
				});
				uni.hideLoading();

				const messageId = this.addMessage('home', '', false, false, true);
				this.requestPdfAiTips(messageId);
				return pdfMessageId;
			},
			addMessage: function(user, content, hasSub, subcontent, loading) {
				const id = generateUUID();
				const now = Date.now()
				const message = {
					user: user,
					content: content,
					hasSub: hasSub,
					subcontent: subcontent,
					loading: loading,
					time: now,
					id
				};
				this.messages.push(message);
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
				let totalHeight = this.style.itemHeight || 0;

				if (this.$refs.messageShow === undefined) return;
				// 计算消息区域高度
				this.$refs.messageShow.forEach(child => {
					const promise = new Promise((resolve, reject) => {
						child.getDomByClass(".m-item_flag").boundingClientRect().exec(function(rect) {
							resolve(rect[0].height);
						});
					});
					promises.push(promise);
				});
				// 汇总计算
				Promise.all(promises).then(heights => {
					heights.forEach(height => {
						totalHeight += height + 20;
					});
					this.style.itemHeight = totalHeight;
					callBack();
				}).catch(error => {
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
			requestInquiry: function() {
				this.addMessage('customer', '生成全面评估', false);
				const messageId = this.addMessage('home', '', false, false, true);
				let reportContent = '';
				this.records.forEach(record => {
					reportContent += record.report + '\n';
				})
				const prompt = reportContent + "\n上述内容是我的多份病历的结果。" + promptInquiry;
				this.requestRecordAiTips(messageId, prompt, true);
				this.onFinishDialog();
			},
			requestRecordAiTips: function(messageId, prompt, inquiry) {
				uni.request({
					url: 'https://www.aicareme.cn/medical/invoke',
					method: 'POST',
					data: {
						"input": {
							"repo": "",
							"question": prompt,
						}
					},
					success: (res) => {
						const content = res.data.output.content;
						if (!content) {
							// this.records[0].aiTips = "";
							uni.showToast({
								title: "解析失败",
								icon: 'none',
								duration: 2000
							});
							return;
						}
						const message = this.messages.find(item => item.id === messageId);
						message.loading = false;
						message.content = content;
						this.queueCount++;
						this.chat_history.push({
							question: prompt,
							answer: content
						});
						if (!inquiry) {
							this.records[0].report = content;
							// 反问用户一个问题
							const id = this.addMessage('home', '', false, false, true);
							const question = "你是一名十分懂得提供情绪价值的医生，我是一位患者，我的健康报告解读如下：\n" +
								content + "\n请反问一个和我病情有关的问题。";
							this.requestAI('medical', '', id, question);
						}
						// this.updateRecordAiTips(content);
						this.autoScroll();

					}
				});
			},
			updateRecordAiTips: function(content) {
				this.records[0].aiTips = content;
				console.log("InquiryChat, PDF报告解读成功, content = \n" + content);
				db.collection('health-records').where({
						_id: this.records[0]._id
					})
					.update({
						aiTips: content,
					})
					.then((res) => {
						console.log("InquiryChat, updateAiTips success");
					})
					.catch((err) => {
						console.log("InquiryChat, updateAiTips failed: ", err);
					});
			},
			requestPdfAiTips: function(messageId, params = {}) {
				uni.request({
					url: 'https://chat.aicareme.cn/api/tencent/ocr',
					method: 'POST',
					data: {
						...params,
						url: this.records[0].fileUrl
					},
					success: (res) => {
						if (res.data.code === 200) {
							const responseData = res.data.data;
							let textDetections = '';
							let content = '';
							if (responseData instanceof Array) {
								responseData.forEach(item => {
									textDetections = item.textDetections.map(item => item
										.detectedText);
									content += textDetections.join(',');
								});
							} else {
								textDetections = responseData.textDetections.map(item => item
									.detectedText)
								content = textDetections.join(',');
							}
							const isHeartReport = content.indexOf('动态心电图报告') >= 0;
							if (isHeartReport) {
								let info = '';
								let infoEnd = content.indexOf('测试日期');
								if (infoEnd > 0) {
									info = content.substr(0, infoEnd);
								}
								let report = '';
								let reportStart = content.indexOf('结论,');
								if (reportStart > 0) {
									report = '\n结论：' + content.substr(reportStart + 3);
								}
								content = info + report;
							}
							if (this.records[0].content?.length > 0) {
								content += " | 病人自述：" + this.records[0].content;
							}

							const prompt = content + "\n以上内容是我的病历。" + promptPdfCondition;
							this.requestRecordAiTips(messageId, prompt);
							// this.requestAI('medical', '', messageId, prompt);
						} else {
							uni.showToast({
								title: 'PDF解析失败',
								icon: 'none',
								duration: 2000
							});
						}
					},
					fail: (err) => {
						console.log("InquiryChat, PDF解读失败 failed: ", err);
						uni.showToast({
							title: 'PDF暂时无法识别',
							icon: 'none',
							duration: 2000
						});
					}
				});
			},
			requestAI: function(model, type, messageId, question) {
				this.isLoading = true;
				this.isShowLoading = true;
				let writingIndex = 0;
				let writingOffset = 0;
				let writingContent = "";
				let writingTimer;
				let writingEnded = false;

				if (model == 'emohaa') {
					uni.request({
						url: 'https://www.aicareme.cn/emo_chat',
						method: 'POST',
						data: {
							question: question,
							chat_history: this.history.concat(this.chat_history),
							prompt: "你是一名十分懂得提供情绪支持的医生，你正在面临一位因为心血管疾病而焦虑的患者，你需要疏导他的情绪，同时鼓励他坚持追踪疾病情况坚持治疗。"
						},
						success: (res) => {
							console.log("InquiryChat, inquiry success: ", res);
							if (res.data.status == 200) {
								writingContent = res.data.data.content;
								console.log('InquiryChat, writingContent = ' + writingContent);
								const message = this.messages.find(item => item.id === id);
								message.loading = false;
								if (!writingTimer) {
									writingTimer = setInterval(() => {
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
						},
						fail: (err) => {
							console.log("InquiryChat, inquiry failed: ", err);
							result += "服务器网络异常，请重试";
							const msg = this.messages.pop();
							if (msg.user === 'customer') {
								this.messages.push(msg);
							}
							this.addMessage("home", result, true);
							this.queueCount++;
						},
						complete: () => {
							const obj = this.messages.find(item => item.id === id);
							if (obj) {
								const message = {
									message: question,
									ai_message: writingContent,
									approve: false,
									disapprove: false,
									parent_id: this.parent_id,
									chat_type: 3,
								};
								if (store.userInfo._id) {
									message.uid = store.userInfo._id;
									message.nickname = store.userInfo.nickname;
								} else {
									message.did = store.userConfig.deviceID;
								}
								// db.collection('chatai-dialog').add(message);
							}
							this.isShowLoading = false;
							this.chat_history.push({
								question: question,
								answer: writingContent,
							});
							writingEnded = true;
							this.isLoading = false;
							this.queueCount++;
							this.autoScroll();
						}
					});
				} else {
					const requestData = model == 'clinic' ? {
						input: {
							repo: "",
							question: question,
							chat_history: this.history.concat(this.chat_history),
							extra_params: {
								clinic_type: type,
							}
						}
					} : {
						input: {
							repo: "",
							question: question,
							chat_history: this.history.concat(this.chat_history)
						}
					};
					console.log("InquiryChat, requestData = ", requestData);
					uni.http.streamWx(model, messageId, requestData,
						(success, res) => {
							console.log("InquiryChat, inquiry success");
						}, (fail, err) => {
							console.log("InquiryChat, inquiry failed: ", err);
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
							const obj = this.messages.find(item => item.id === id);
							if (obj) {
								const message = {
									message: question,
									ai_message: writingContent,
									approve: false,
									disapprove: false,
									parent_id: this.parent_id,
									chat_type: 3,
								};
								if (store.userInfo._id) {
									message.uid = store.userInfo._id;
									message.nickname = store.userInfo.nickname;
								} else {
									message.did = store.userConfig.deviceID;
								}
								// db.collection('chatai-dialog').add(message);
							}
							this.isShowLoading = false;
							this.chat_history.push({
								question: question,
								answer: writingContent,
							});
							writingEnded = true;
							this.isLoading = false;
							this.queueCount++;
							this.autoScroll();
						}, onHeadersReceivedCallBack => {
							// console.log("InquiryChat, onHeadersReceivedCallBack");
						}, (onChunkReceivedCallBack, id, input) => {
							const requestData = arrayBufferToString(onChunkReceivedCallBack.data);
							let lines = [];
							if (type == 'inquiry') {
								lines = handleChatNonJsonData(requestData);
							} else {
								lines = handleChatData(requestData);
							}
							lines.forEach(line => {
								if (type == 'inquiry') {
									writingContent += line
								} else {
									writingContent += line.content;
								}
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
						});
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