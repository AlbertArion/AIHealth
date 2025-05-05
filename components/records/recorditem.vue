<template>
	<view class="record-info shadow">
		<view class="info-title-content" @click="toRecord">
			<text v-if="isAdmin" class="info-rid">资料分析：{{record._id}}</text>
			<view class="info-title-container">
				<view class="info-title" :style="`${isDefaultStyle?'':'font-size: 16px'}`">
					{{timeFormat(record.timestamp)}}
				</view>
				<view class="info-title-right-container">
					<text :class="`${isAdmin?'info-title-right-highlight':'info-title-right'}`"
						:style="`${isDefaultStyle?'':'font-size: 16px'}`">{{infoTitleRight}}</text>
					<image v-if="isAdmin" class="info-title-icon" :src="record.avatar" />
				</view>
			</view>
		</view>
		<view v-if="hasPDF" class="record-pdf-container" @click="onItemClick">
			<image style="width: 40px;" mode="widthFix"
				src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/static/record/icon_record_pdf_active.png" />
			<text class="record-pdf-filename">{{record.filename}}</text>
		</view>
		<view v-else-if="hasUrl" class="record-image-container" @click="onItemClick">
			<image class="record-item-image" :src="recordUrl" mode="widthFix" />
		</view>
		<view v-if="hasBasicInfo" class="info-list" @click="toRecord">
			<view v-if="hasPDF" class="record-action-divider" style="margin: 0px 10px;" />
			<view v-if="record.content" class="info-area">
				<view class="info-area-label" :style="`${isDefaultStyle?'':'font-size: 16px'}`">
					<text class="info-label-text">病情描述：</text>
					<uni-icons class="info-label-icon" @click="showDetail" type="right" size="14" color="dimgray" />
				</view>
				<view class="input-container">
					<text class="info-area-text"
						:style="`${isDefaultStyle?'':'font-size: 14px'}`">{{record.content}}</text>
				</view>
			</view>
		</view>
		<view v-if="isAdmin" class="tips-area">
			<view class="record-block-divider" />
			<textarea maxlength="-1" class="tips-textarea" v-model="localTip.content" cursor-color="#4C5382"
				placeholder-class="tips-textarea-placeholder" placeholder="请查阅后, 输入合理的健康风险提醒：" />
			<button class="tips-commit" @click="submitTips">提交</button>
		</view>
		<view v-if="showAction" class="record-action-container">
			<view v-if="hasPDF || hasBasicInfo" class="record-action-divider" />
			<view v-else-if="isAiAdmin" class="record-block-divider" />
			<view v-if="hasAiTips" class="tips-ai-container">
				<view class="tip-ai-title" @click="toReport(record.aiTips)">
					<text class="tip-ai-title-text" :style="`${isDefaultStyle?'':'font-size: 16px'}`">分析结果：</text>
					<text class="tip-ai-price">{{aiTipPrice}}</text>
					<button v-if="aiTipUpdated" class="record-report-button" style="background-color: #aa3311;"
						@click.stop="updateAiTips">有更新</button>
					<uni-icons v-else-if="!isAdmin && !isAiWriting" class="info-label-icon" type="right" size="14"
						color="dimgray" />
				</view>
				<view class="tip-ai">
					<uaMarkDown :source="record.aiTips" :class="`${isAdmin?'':'tip-text-clamp'}`" :outerStyle="`margin-left: 10px; margin-right: 3px; 
						${isDefaultStyle?'font-size: 12px;':'font-size: 14px; '} color: #696969;`" :showLine="false" @click="toRecord"
						@longpress="copyContent(record.aiTips)" />
					<loading-dots v-if="isAiWriting" class="writing-dots" color="#4C5382" />
				</view>
				<view class="tip-item-lines" :key="cIndex" v-bind:comment="comment" :id="cIndex"
					v-for="(comment, cIndex) in record.aiComments">
					<text class="tip-comment-item"> {{aiTipCommentText(cIndex)}}{{comment}}</text>
				</view>
			</view>
			<view v-if="showAiAskMore" class="record-action-divider" />
			<view v-if="showAiAskMore" class="tips-action-container">
				<input class="tips-input" v-model="tipComment" placeholder-class="tips-input-placeholder"
					placeholder="请输入咨询内容" cursor-color="#4C5382" />
				<view class="tips-question" @click="toChat(record.aiTips)">继续咨询 >></view>
			</view>
			<view v-if="!isAdmin && hasAiTips" class="record-block-divider" />
			<view v-if="!isAiAdmin" class="record-action-row">
				<view v-if="hasPDF" class="record-action-icon">
					<image style="width: 20px;" mode="widthFix"
						src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/static/record/icon_record_pdf_active.png" />
				</view>
				<view v-else class="record-action-icon">
					<image style="width: 20px;" mode="widthFix"
						src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/static/record/icon_record_image_active.png" />
				</view>
				<view class="record-action-text">{{applyActionText}}</view>
				<button class="record-action-button" @click="applyHealthTips">{{tipActionText}}</button>
				<button class="record-ai-button" @click="applyAiTips">AI</button>
			</view>
		</view>
		<view v-if="!isAiAdmin && hasTips" class="tips-list">
			<view class="tip-item-container" v-for="(tip, index) in record.tips" :key="index" v-bind:tip="tip"
				:id="index" @click="onTipClick">
				<view class="record-block-divider" />
				<view class="tip-title">
					<text class="tip-title-text" :style="`${isDefaultStyle?'':'font-size: 15px'}`">
						{{record.isExpert ? '专家建议：' : '健康建议：'}}
					</text>
					<text class="tip-price" :style="`${isDefaultStyle?'':'font-size: 15px;'}`">
						{{tipPrice}}
					</text>
					<text class="tip-time" :style="`${isDefaultStyle?'':'font-size: 15px'}`">
						{{timeFormat(tip.timestamp)}}
					</text>
				</view>
				<view v-if="!isAdmin" class="tip-title" style="margin-top: 0px;">
					<view v-if="record.isExpert && !tip.fake" class="tip-image-container">
						<image class="tip-item-image" mode="aspectFill"
							src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/intro/zhong_rect.jpg" />
					</view>
					<text v-if="record.isExpert && !tip.fake" class="tip-title-name"
						:style="`${isDefaultStyle ? '' : 'font-size: 15px'}`">钟医生：</text>
					<view v-if="record.isExpert && !tip.fake" class="tip-star-view" @click.stop="starChanged">
						<uni-icons v-if="star" type="star-filled" size="15" color="#4C5382" />
						<uni-icons v-else type="star" size="15" color="#A0A0A0" />
					</view>
					<view v-if="tip.fake" class="tip-progress">
						<uni-icons class="tip-progress-icon" type="checkbox-filled" size="18" color="#4C5382"
							style="opacity: 0.9;" />
						<text>报告上传</text>
						<view class="tip-progress-line" />
						<uni-icons class="tip-progress-icon" type="circle-filled" size="18" color="#4C5382"
							style="opacity: 0.8;" />
						<text style="opacity: 0.8;">{{record.isExpert ? '专家分析' : '健康分析'}}</text>
						<view class="tip-progress-line" style="border-bottom-color: #A0A0A0;" />
						<uni-icons class="tip-progress-icon" type="circle" size="18" color="#A0A0A0" />
						<text style="opacity: 0.7; margin-right: 3px;">解读完成</text>
					</view>
				</view>
				<view class="tip-item-lines">
					<text class="tip-item" :style="`${isDefaultStyle ? '' : 'font-size: 15px;'}`"
						@longpress="copyContent(tip.content)">{{tip.content}}</text>
					<uni-icons v-if="isAdmin" class="tip-icon" @click="removeTips(tip, index)" type="minus-filled"
						size="20" color="indianred" />
				</view>
				<view class="tip-item-lines" v-if="tip.comments?.length > 0" v-for="(comment, cIndex) in tip.comments"
					:key="cIndex" v-bind:comment="comment" :id="cIndex">
					<text class="tip-comment-item"> {{tipCommentText}}{{comment}}</text>
				</view>
				<view v-if="!tip.fake && showAskMore" class="record-action-divider" />
				<view v-if="!tip.fake && showAskMore" class="tips-action-container" @click.stop.prevent>
					<input class="tips-input" v-model="tipComment" placeholder-class="tips-input-placeholder"
						placeholder="请输入咨询内容" cursor-color="#4C5382" />
					<view class="tips-question" @click="toChat(tip.content)">继续咨询 >></view>
				</view>
			</view>
		</view>
		<uni-popup ref="popupManual" type="bottom" @maskClick="closePopupManual">
			<popup-manual mode="base" @closePopup="closePopupManual" @pay="toPay" @exchange="toExchange" :index="id"
				:record="record" />
		</uni-popup>
		<uni-popup v-if="hasPDF" ref="popupPDF" type="bottom" @maskClick="closePopupPDF">
			<popupPDF mode="base" @closePopup="closePopupPDF" @request="requestPdfAiTips" @pay="toAiPay"
				@single-pay="payForOnePage" :index="id" :record="record" />
		</uni-popup>
		<uni-popup v-else ref="popupImage" type="bottom" @maskClick="closePopupImage">
			<popup-image mode="base" @closePopup="closePopupImage" @request="requestImgAiTips" @pay="payForOnePage"
				:record="record" />
		</uni-popup>
	</view>
</template>

<script>
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store.js';
	import uaMarkDown from '@/components/ua-markdown/ua-markdown.vue';
	import {
		generateOrderNumber,
	} from '@/common/utils/generateUUID.ts';
	import {
		formatTimestamp,
		getNowTime,
		traversalTime
	} from '@/common/utils/timestamp.js';
	import loadingDots from '@/components/loading-dots/loading-dots.vue';
	import popupManual from '@/components/popup/popup-manual-report.vue';
	import popupPDF from '@/components/popup/popup-pdf.vue';
	import popupImage from '@/components/popup/popup-image.vue';
	import {
		promptPdfCondition,
		promptImgCondition,
		promptImgEcg
	} from '@/common/utils/prompt';
	import {
		cloudNotify,
		exchangeForTips,
		imageAiTips,
		isPdf,
		payForAiTips,
		payForTips,
		tipActionText
	} from '@/common/js/record';
	const db = uniCloud.database();
	export default {
		data() {
			return {
				localTip: {
					content: "",
					cid: store.userInfo._id,
					uid: this.record.uid,
					nickname: this.record.nickname,
					rid: this.record._id,
					fileUrl: this.record.fileUrl
				},
				tipComment: "",
				lastQuestion: "",
				expanded: false,
				fee: 0,
				params: {},
				star: false
			}
		},
		components: {
			uaMarkDown,
			loadingDots,
			popupManual,
			popupPDF,
			popupImage
		},
		props: {
			id: {
				type: Number
			},
			from: {
				type: String
			},
			record: {
				type: Object
			},
		},
		computed: {
			hasPDF() {
				return isPdf(this.record.filename);
			},
			hasUrl() {
				const url = this.recordUrl;
				return url && url != "";
			},
			recordUrl() {
				return this.record.fileUrl ? this.record.fileUrl : this.record.filePath;
			},
			showAction() {
				return this.isAiAdmin || this.from != 'comment' && !this.hasTips;
			},
			recordLabel() {
				return this.record.label ? this.record.label : "检查报告";
			},
			isAdmin() {
				return this.from == 'comment' || this.from == 'commentai';
			},
			isAiAdmin() {
				return this.from == 'commentai';
			},
			hasBasicInfo() {
				return this.record.content;
			},
			hasTips() {
				return this.record.tips?.length > 0;
			},
			hasAiTips() {
				return this.record.aiTips?.length > 0;
			},
			aiTipUpdated() {
				return this.record.aiTipUpdate?.length > 0;
			},
			isAiWriting() {
				return this.record.aiTips == "分析中";
			},
			lastTip() {
				const tips = this.record.tips;
				const length = tips.length;
				return tips[length - 1];
			},
			infoTitleRight() {
				return this.isAdmin ? this.record.nickname : this.recordLabel;
			},
			tipActionText() {
				return tipActionText(this.record);
			},
			applyActionText() {
				if (this.record.isPaid) {
					return "试试AI解读：";
				} else if (this.hasAiTips) {
					return "您还可以试试深入解读：";
				} else if (this.record.isPaidForAI) {
					return "报告解读中（AI）...";
				} else {
					return "您有一份报告待解读：";
				}
			},
			tipCommentText() {
				return this.isAdmin ? " - 用户咨询：" : " - 我的咨询：";
			},
			isDefaultStyle() {
				return store.userConfig.fontStyle == 'normal';
			},
			tipPrice() {
				return this.record.isExpert ? '￥199' : '￥19.9';
			},
			aiTipPrice() {
				return this.record.aiTipPrice ? `￥${this.record.aiTipPrice}` : '';
			},
			showAiAskMore() {
				return !this.isAdmin && this.hasAiTips && !this.isAiWriting;
			},
			showAskMore() {
				return !this.isAdmin && this.hasTips && !this.isAiWriting;
			},
			starChanged: function() {
				this.star = !this.star
			},
		},
		mounted() {
			this.fetchTips();
		},
		methods: {
			aiTipCommentText(cIndex) {
				return cIndex % 2 == 1 ? " - AI 回答：" : (this.isAdmin ? " - 用户咨询：" : " - 我的咨询：");
			},
			showDetail: function() {
				this.expanded = !this.expanded;
			},
			removeTipsFromDB: function(tip, index) {
				db.collection('health-tips').where({
						_id: tip._id
					})
					.remove()
					.then((res) => {
						console.log("RecordItem, 健康建议删除成功");
						uni.showToast({
							icon: 'success',
							title: "删除成功",
							duration: 600
						});
						this.record.tips.splice(index, 1);
					}).catch((err) => {
						console.log("RecordItem, 健康建议删除失败, err: ", err);
						uni.showToast({
							icon: 'fail',
							title: "删除失败",
							content: err.errMsg,
							duration: 600
						});
					});
			},
			removeTips: function(tip, index) {
				const that = this;
				uni.showModal({
					title: "删除健康建议",
					content: "确定要删除该健康建议吗？",
					confirmColor: '#4C5382',
					showCancel: true,
					success: function(res) {
						if (res.confirm) {
							that.removeTipsFromDB(tip, index);
						}
					}
				});
			},
			updateProgress: function() {
				if (this.hasTips || !this.record.isPaid || !this.record.paymentTime) {
					// 没有正在解读中的报告，不需要计算进度
					return;
				}
				const duration = 12 * 60 * 60 * 1000;
				const start = Number(this.record.paymentTime);
				const now = new Date().getTime();
				const percent = (now - start) / duration;
				const leftHours = Math.max(1, Number((1 - percent) * duration / 1000 / 60 / 60)
					.toFixed(0));
				this.record.tips = [{
					fake: true,
					timestamp: start,
					percent: Number(percent * 100).toFixed(0),
					content: ` - 报告解读中, 预计 ${leftHours} 小时内解读完成。\n - 完成后会在小程序「心脉AI」的消息提醒中通知。`
				}];
			},
			fetchTips: function() {
				if (!this.record._id) {
					console.log("RecordItem, fetchTips abort, local record.")
					return;
				}
				db.collection('health-tips').where({
						rid: this.record._id
					})
					.orderBy("timestamp", "desc")
					.get()
					.then((res) => {
						this.record.tips = res.result?.data;
						this.updateProgress();
					}).catch((err) => {
						console.log("RecordItem, fetchTips failed, err: ", err);
					}).finally(() => {});
			},
			// 时间格式化
			timeFormat: function(timestamp) {
				return formatTimestamp(timestamp);
			},
			copyContent: function(content) {
				uni.setClipboardData({
					data: content
				});
			},
			toRecord: function() {
				if (this.isAdmin) {
					// 医生端处理健康建议的逻辑
				} else {
					store.setRecordIndex(this.id);
					uni.navigateTo({
						url: `/pages/records/newrecord`
					});
				}
			},
			onTipClick: function() {
				if (!this.isAdmin) {
					this.toRecord();
				}
			},
			onItemClick: function() {
				if (this.isAdmin) {
					this.hasPDF ? this.openFile() : this.previewImage();
				} else {
					this.toRecord();
				}
			},
			previewImage: function() {
				uni.previewImage({
					urls: [this.record.fileUrl]
				});
			},
			openFile: function() {
				if (this.record.filePath?.length > 0) {
					uni.openDocument({
						filePath: this.record.filePath,
						fileType: 'pdf',
						success: (res) => {},
						fail: (err) => {},
						complete: () => {}
					});
				} else if (this.record.fileUrl?.length > 0) {
					const that = this;
					uni.downloadFile({
						url: this.record.fileUrl,
						success: function(res) {
							uni.saveFile({
								tempFilePath: res.tempFilePath,
								success: function(res) {
									that.record.filePath = res.savedFilePath;
									uni.openDocument({
										filePath: that.record.filePath,
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
			submitTips: async function() {
				if (!this.localTip.content || this.localTip.content == "") {
					uni.showToast({
						icon: 'none',
						title: "请输入内容",
						duration: 600
					});
					return;
				}
				if (this.isAiAdmin) {
					db.collection('health-records').where({
							_id: this.record._id
						})
						.update({
							aiTipUpdate: this.localTip.content
						}).then((res) => {
							console.log("RecordItem, AI报告解读更新成功");
							uni.showToast({
								icon: 'success',
								title: "发送成功",
								duration: 600
							});
							cloudNotify(this.localTip.uid, "recordTips");
							this.localTip.content = "";
						}).catch((err) => {
							console.log("RecordItem, AI报告解读更新失败, err: ", err);
						}).finally(() => {});
				} else {
					db.collection('health-tips').add({
						...this.localTip,
						accept: false
					}).then(async (res) => {
						console.log("RecordItem, 报告解读成功");
						uni.showToast({
							icon: 'success',
							title: "发送成功",
							duration: 600
						});
						cloudNotify(this.localTip.uid, "recordTips");
						this.fetchTips();
						this.localTip.content = "";
					}).catch((err) => {
						console.log("RecordItem 健康建议失败， err: ", err);
						uni.showToast({
							icon: 'fail',
							title: "提醒失败",
							content: err.errMsg,
							duration: 600
						});
					}).finally(() => {});
				}
			},
			toExchange: function() {
				exchangeForTips(this.id);
			},
			toPay: function(isExpert = false) {
				payForTips(this.id, this.record, isExpert);
			},
			payForOnePage: function(params = {}) {
				this.params = params;
				this.toAiPay(2.9);
			},
			toAiPay: function(fee) {
				this.fee = fee;
				payForAiTips(this.id, this.record, fee);
			},
			toChat: function(tip) {
				// 对健康建议追问入口
				if (!this.tipComment || this.tipComment == '') {
					uni.showToast({
						icon: 'none',
						title: "请输入咨询内容",
						duration: 600
					});
					return;
				}
				console.log("RecordItem, toChat: ", tip);
				uni.switchTab({
					url: '/pages/chatai/dialog'
				});
				const isAsked = this.lastQuestion.length > 0;
				this.lastQuestion = this.tipComment;
				this.tipComment = "";
				uni.$emit('askMore', {
					index: this.id,
					isAsked: isAsked,
					content: tip,
					question: this.lastQuestion
				});
				uni.report('ask-more', {
					type: this.hasPDF ? 'pdf' : 'image',
					question: this.lastQuestion,
					rid: this.record._id,
					uid: store.userInfo._id,
					uname: store.userInfo.nickname
				});
			},
			// 在当前页面询问更多并展示，已废弃：跳转到问答页面替代。
			askMore: function() {
				if (!this.tipComment || this.tipComment == "") {
					uni.showToast({
						icon: 'none',
						title: "请输入咨询内容",
						duration: 600
					});
					return;
				}
				if (this.hasTips) {
					const tip = this.lastTip;
					db.collection('health-tips')
						.where({
							_id: tip._id
						})
						.field('comments')
						.get()
						.then(res => {
							console.log("RecordItem, tip comment fetch success");
							const comments = res.result.data[0].comments;
							comments.push(this.tipComment);
							this.addTipComment(tip, comments);
						}).catch(err => {
							console.log("RecordItem, tip comment fetch failed: ", err);
							this.addTipComment(tip, [this.tipComment]);
						});
				} else {
					const prompt = this.record.aiTips + this.tipComment;
					this.generateAiTips(prompt, false);
				}
			},
			submitAiTipComment: function(tipAnswer) {
				db.collection('health-records')
					.where({
						_id: this.record._id
					})
					.field('aiComments')
					.get()
					.then(res => {
						const comments = res.result?.data[0].aiComments || [];
						comments.push(this.tipComment);
						comments.push(tipAnswer);
						this.addAiTipComment(comments);
					}).catch(err => {
						console.log("RecordItem, tip comment fetch failed: ", err);
					});
			},
			addAiTipComment: function(comments) {
				db.collection('health-records')
					.where({
						_id: this.record._id
					})
					.update({
						aiComments: comments
					})
					.then(res => {
						console.log("RecordItem, ai tip comment add success");
						uni.showToast({
							icon: 'none',
							title: "发送成功",
							duration: 600
						});
						this.tipComment = "";
					}).catch(err => {
						console.log("RecordItem, ai tip comment add failed: ", err);
						uni.showToast({
							icon: 'none',
							title: "发送失败",
							duration: 600
						});
					});
			},
			addTipComment: function(tip, comments) {
				db.collection('health-tips')
					.where({
						_id: tip._id
					})
					.update({
						comments: comments
					})
					.then(res => {
						console.log("RecordItem, tip comment add success");
						uni.showToast({
							icon: 'none',
							title: "发送成功",
							duration: 600
						});
						this.tipComment = "";
					}).catch(err => {
						console.log("RecordItem, tip comment add failed: ", err);
						uni.showToast({
							icon: 'none',
							title: "发送失败",
							duration: 600
						});
					});
			},
			writing: function(content) {
				let index = 0;
				const that = this;
				const timer = setInterval(function() {
					if (index < content.length) {
						if (content.charAt(index)) {
							that.record.aiTips += content.charAt(index);
						}
					} else {
						clearInterval(timer);
					}
					index++;
				}, 50);
			},
			toReport: function(tips) {
				const reportTime = traversalTime(this.record.timestamp);
				uni.navigateTo({
					url: `/pages/records/report?id=${String(this.record._id).toUpperCase()}&fileUrl=${this.record.fileUrl}&reportTips=${tips}&isExpert=${this.record.isExpert}&reportTime=${reportTime}`
				});
			},
			updateAiTips: function() {
				if (this.aiTipUpdated) {
					this.record.aiTips = this.record.aiTipUpdate;
					this.record.aiTipUpdate = '';
					db.collection('health-records').where({
							_id: this.record._id
						})
						.update({
							aiTips: this.record.aiTips,
							aiTipUpdate: ''
						})
						.then((res) => {
							console.log("RecordItem, 更新AI报告解读成功");
						})
						.catch((err) => {
							console.log("RecordItem, 更新AI报告解读失败: ", err);
						});
				}
			},
			showPopupManual: function() {
				this.$refs.popupManual.open();
			},
			closePopupManual: function() {
				this.$refs.popupManual.close();
			},
			showPopupPDF: function() {
				this.$refs.popupPDF.open();
			},
			closePopupPDF: function() {
				this.$refs.popupPDF.close();
			},
			showPopupImage: function() {
				this.$refs.popupImage.open();
			},
			closePopupImage: function() {
				this.$refs.popupImage.close();
			},
			applyAiTips: function() {
				const that = this;
				if (this.hasAiTips) {
					uni.showModal({
						content: `AI报告解读已经生成，确认要重新生成吗？`,
						confirmColor: '#4C5382',
						confirmText: '确认',
						cancelText: '取消',
						cancelColor: '#808080',
						success(res) {
							if (res.confirm) {
								that.generateAiTips();
							}
						}
					});
				} else {
					this.generateAiTips();
				}
			},
			generateAiTips: function(prompt = "", refresh = true) {
				if (refresh) {
					this.hasPDF ? this.showPopupPDF() : this.showPopupImage();
				} else {
					this.getChatAiTips(prompt, refresh);
				}
				uni.report('ai-tips', {
					type: this.hasPDF ? 'pdf' : 'image',
					rid: this.record._id,
					uid: store.userInfo._id,
					uname: store.userInfo.nickname
				});
			},
			requestAiPaidTips: function() {
				this.record.aiTipPrice = this.fee;
				db.collection('health-records').where({
						_id: this.record._id
					})
					.update({
						aiTipPrice: this.record.aiTipPrice,
					})
					.then((res) => {
						console.log("RecordItem, 更新AI报告解读付费支付费用 success");
					})
					.catch((err) => {
						console.log("RecordItem, 更新AI报告解读付费支付费用 failed: ", err);
					});
				if (!this.hasPDF) {
					this.requestImgAiTips(this.record.fileUrl);
				} else if (this.fee == 99) {
					uni.navigateTo({
						url: `/modules/inquiry/pages/index?index=${this.index}`
					});
				} else {
					const requestUrl = `https:/chat.aicareme.cn/api/tencent/ocr${this.fee > 2.9 ?'/batch' :'' }`;
					this.requestPdfAiTips(requestUrl, this.params);
				}
			},
			getChatAiTips: function(prompt, refresh = true) {
				uni.request({
					url: 'https://www.aicareme.cn/medical/invoke', // 你的API接口地址
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
							if (refresh) {
								this.record.aiTips = "";
							}
							uni.showToast({
								title: "解析失败",
								icon: 'none',
								duration: 2000
							});
							return;
						}
						if (refresh) {
							this.record.aiTips = "    ";
							this.writing(content);
							console.log("RecordItem, PDF报告解读成功, content = \n" + content);
							db.collection('health-records').where({
									_id: this.record._id
								})
								.update({
									aiTips: content,
								})
								.then((res) => {
									console.log("RecordItem, 更新AI报告解读成功");
								})
								.catch((err) => {
									console.log("RecordItem, 更新AI报告解读失败: ", err);
								});
						} else {
							this.submitAiTipComment(content);
						}
					},
					complete: () => {
						// 请求结束的回调函数（无论成功或失败都会调用）
					}
				});
			},
			requestPdfAiTips: function(requestUrl, params = {}, prompt = "", refresh = true) {
				this.record.aiTips = "分析中";
				uni.request({
					url: requestUrl,
					method: 'POST',
					data: {
						...params,
						url: this.record.fileUrl
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
							if (this.record.content?.length > 0) {
								content += " | 病人自述：" + this.record.content;
							}
							if (prompt?.length == 0) {
								prompt = content + "\n以上内容是我的病历。" + promptPdfCondition;
							}
							console.log("RecordItem, PDF报告解读, prompt = \n" + prompt);
							this.getChatAiTips(prompt, refresh);
						} else {
							uni.showToast({
								title: 'PDF解析失败',
								icon: 'none',
								duration: 2000
							});
						}
					},
					fail: (err) => {
						console.log("RecordItem, PDF解读失败 failed: ", err);
						uni.showToast({
							title: 'PDF暂时无法识别',
							icon: 'none',
							duration: 2000
						});
					},
					complete: () => {
						// 请求结束的回调函数（无论成功或失败都会调用）
						this.params = {};
					}
				});
				this.record.isPaidForAI = true;
			},
			requestImgAiTips: function(url, prompt = "", refresh = true) {
				this.record.aiTips = "分析中";
				if (prompt?.length > 0) {
					prompt = "这是我的报告，告诉我，" + prompt;
				} else if (this.record.label == '心电报告') {
					prompt = promptImgEcg;
				} else {
					prompt = promptImgCondition;
				}
				if (this.record.content?.length > 0) {
					prompt = "病人自述：" + this.record.content + " | " + prompt;
				}
				console.log("RecordItem, 图片报告解读, prompt = \n" + prompt);
				const onSuccess = res => {
					const content = res.data.data;
					if (!content) {
						if (refresh) {
							this.record.aiTips = "";
						}
						uni.showToast({
							title: '识别错误',
							icon: 'none',
							duration: 2000
						});
						return;
					}
					if (refresh) {
						this.record.aiTips = "    ";
						this.writing(content);
						console.log("RecordItem, 图片报告解读成功, content = \n" + content);
						db.collection('health-records').where({
								_id: this.record._id
							})
							.update({
								aiTips: content,
							})
							.then((res) => {
								console.log("RecordItem, updateAiTips success: ", res);
							})
							.catch((err) => {
								console.log("RecordItem, updateAiTips failed: ", err);
							});
					} else {
						this.submitAiTipComment(content);
					}
				};
				imageAiTips(url, prompt, onSuccess);
				this.record.isPaidForAI = true;
			},
			applyHealthTips: function() {
				if (this.record.isPaid) {
					uni.showModal({
						title: this.tipActionText,
						content: "收到微信消息通知后，请在「我的/我的健康建议」查看",
						confirmColor: '#4C5382',
						showCancel: false
					});
				} else {
					this.showPopupManual();
				}
			}
		}
	}
</script>

<style>
	.record-info {
		display: flex;
		flex-direction: column;
		background-color: white;
		border-radius: 10px;
		margin: 10px 20px;
		overflow: hidden;
	}

	.info-title-content {
		display: flex;
		flex-direction: column;
		background: linear-gradient(145deg, rgba(76, 83, 130, 1) 50%, rgba(95, 158, 160, 1) 100%);
		padding: 13px 10px 12px;
	}

	.info-rid {
		font-size: 9px;
		font-weight: bold;
		margin-bottom: 3px;
		color: lightblue;
	}

	.info-title-container {
		display: flex;
		flex-direction: row;
	}

	.info-title {
		font-size: 13px;
		font-weight: bold;
		color: white;
		flex: 1;
	}


	.info-title-right-container {
		display: flex;
		flex-direction: row;
	}

	.info-title-right {
		flex: 1;
		font-size: 13px;
		font-weight: bold;
		color: white;
	}

	.info-title-right-highlight {
		flex: 1;
		font-size: 13px;
		font-weight: bold;
		color: white;
	}

	.info-title-icon {
		position: relative;
		align-self: flex-end;
		margin-left: 6px;
		width: 18px;
		height: 18px;
	}

	.info-list {
		display: flex;
		flex-direction: column;
		padding: 0px 10px;
		padding-bottom: 6px;
	}

	/*修改边线粗细示例*/
	/* #ifndef APP-NVUE */
	.info-list ::v-deep .uni-list--border:after {
		-webkit-transform: scaleY(0.2);
		transform: scaleY(0.2);
		margin-left: 80rpx;
	}

	.info-list ::v-deep .uni-list--border-top,
	.info-list ::v-deep .uni-list--border-bottom {
		display: none;
	}

	/* #endif */

	.record-pdf-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 40px 0px;

	}

	.record-pdf-filename {
		max-width: 240px;
		font-size: 14px;
		color: #4C5382;
		text-align: center;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.record-image-container {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.record-item-image {
		width: 100%;
	}

	.record-action-container {
		display: flex;
		flex-direction: column;
	}

	.record-action-divider {
		height: 1px;
		margin: 0px 20px;
		border-top: #4C5382 1px dashed;
	}

	.record-block-divider {
		height: 1px;
		margin: 0px 0px;
		border-top: #4C5382 1px solid;
	}

	.record-report-button {
		background-color: #4C5382;
		color: white;
		border-radius: 20px;
		font-size: 11px;
		padding: 0px 15px;
		margin: 5px 0px;
	}

	.record-report-button:active {
		opacity: 0.8;
	}

	.record-action-row {
		display: flex;
		flex-direction: row;
		align-items: center;
		min-height: 50px;
	}

	.record-action-icon {
		display: flex;
		flex-direction: row;
		width: 30px;
		height: 40px;
		justify-content: flex-start;
		align-items: center;
		margin-left: 10px;
	}

	.record-action-text {
		flex: 1;
		display: flex;
		flex-direction: row;
		color: #4C5382;
		font-weight: bold;
		font-size: 13px;
		white-space: nowrap;
		overflow: hidden;
	}

	.record-ai-button {
		width: auto;
		min-width: 45px;
		background-color: #4C5382;
		color: white;
		font-weight: bold;
		border-radius: 20px;
		font-size: 11px;
		margin: 5px 0px;
		margin-right: 10px;
	}

	.record-ai-button:active {
		opacity: 0.8;
	}

	.record-action-button {
		width: auto;
		min-width: 45px;
		background-color: #4C5382;
		color: white;
		font-weight: bold;
		border-radius: 20px;
		font-size: 11px;
		margin: 5px 10px;
	}

	.record-action-button:active {
		opacity: 0.8;
	}

	.info-area {
		display: flex;
		flex-direction: column;
		margin-top: 10px;
		margin-bottom: 3px;
	}

	.info-area-label {
		display: flex;
		flex-direction: row;
		font-size: 13px;
		color: #4C5382;
		font-weight: bold;
	}

	.info-label-text {
		flex: 1;
	}

	.info-label-icon {
		margin-top: 2px;
		margin-left: 6px;
	}

	.input-container {
		margin-bottom: 3px;
	}

	.info-area-text {
		font-size: 12px;
		color: dimgray;
		padding: 0px 10px;
	}

	.tips-list {
		display: flex;
		flex-direction: column;
	}

	.tip-item-container {
		display: flex;
		flex-direction: column;
	}

	.tip-title {
		display: flex;
		flex-direction: row;
		align-items: center;
		margin: 6px 10px;
	}

	.tip-image-container {
		display: flex;
		flex-direction: column;
		width: 24px;
		height: 24px;
		margin: 0px 6px 0px 10px;
		align-items: center;
		justify-content: center;
	}

	.tip-item-image {
		width: 24px;
		height: 24px;
		border-radius: 6px;
	}

	.tip-title-text {
		line-height: 20px;
		font-size: 13px;
		font-weight: bold;
		color: #4C5382;
	}

	.tip-title-name {
		flex: 1;
		font-size: 12px;
		font-weight: bold;
		color: #4C5382;
		line-height: 20px;
		opacity: 0.8;
	}

	.tip-progress {
		flex: 1;
		display: flex;
		flex-direction: row;
		align-items: center;
		font-size: 12px;
		font-weight: normal;
		color: #484848;
		margin: 6px 3px;
	}

	.tip-progress-icon {
		margin: 0px 3px;
	}

	.tip-progress-line {
		flex: 1;
		width: auto;
		border-bottom: #4C5382 dashed 1px;
		margin: 0px 6px;
	}

	.item-progress-container {
		flex: 1;
		margin: 0px 6px;
		border-radius: 20px;
		overflow: hidden;
		opacity: 0.8;
	}

	.item-progress {}

	.tip-star-view {
		display: flex;
		flex-direction: row;
		padding: 6px;
	}

	.tip-time {
		font-size: 10px;
		color: dimgray;
		line-height: 20px;
	}

	.tip-ai-price {
		flex: 1;
		font-size: 12px;
		justify-content: center;
		color: indianred;
		font-weight: bold;
		line-height: 20px;
		margin-right: 8px;
	}

	.tip-price {
		flex: 1;
		font-size: 12px;
		justify-content: center;
		color: indianred;
		font-weight: bold;
		line-height: 20px;
		margin-right: 8px;
	}

	.tip-item-lines {
		display: flex;
		flex-direction: row;
		color: dimgray;
		align-items: center;
		margin-bottom: 8px;
		margin-left: 10px;
		margin-right: 10px;
	}

	.tip-item {
		flex: 1;
		font-size: 12px;
		line-height: 20px;
		min-height: 20px;
		margin-left: 10px;
		margin-right: 3px;
	}

	.tip-comment-item {
		flex: 1;
		font-size: 11px;
		color: dimgray;
		line-height: 20px;
		min-height: 20px;
		margin-left: 15px;
	}

	.tip-icon {
		position: relative;
		align-self: flex-end;
		margin-left: 6px;
	}

	.tip-text {
		position: relative;
		align-self: flex-end;
		margin-left: 6px;
		font-size: 13px;
		color: indianred;
		font-weight: bold;
	}

	.tips-area {
		display: flex;
		flex-direction: column;
	}

	.tips-textarea {
		flex: 1;
		min-height: 100px;
		font-size: 13px;
		color: black;
		line-height: 20px;
		margin: 10px 10px;
		margin-top: 0px;
		padding: 10px 0px;
	}

	.tips-textarea-placeholder {
		font-size: 13px;
		color: gray
	}

	.tips-action-container {
		display: flex;
		flex-direction: row;
		align-items: center;
		margin: 3px 0px;
	}

	.tips-ai-container {
		display: flex;
		flex-direction: column;
		margin-top: 5px;
		margin-bottom: 3px;
	}

	.tip-ai-title {
		display: flex;
		flex-direction: row;
		font-size: 13px;
		font-weight: bold;
		color: #4C5382;
		margin: 6px 10px;
		align-items: center;
	}

	.tip-ai-title-text {}

	.tip-ai-refresh {}

	.tip-ai {
		display: flex;
		flex-direction: row;
		font-size: 12px;
		line-height: 20px;
		margin-left: 10px;
		margin-right: 10px;
		margin-bottom: 10px;
		color: #4C5382;
		align-items: center;
		white-space: pre-wrap;
	}

	.tip-ai-text {
		margin-left: 10px;
		margin-right: 3px;
	}

	.tip-text-clamp {
		line-height: 21px;
		word-break: break-all;
		text-overflow: ellipsis;
		overflow: hidden;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 10;
	}

	.writing-dots {
		margin-left: 10px;
		margin-top: 6px;
	}

	.tips-input {
		flex: 1;
		font-size: 12px;
		color: #0C0C0C);
		margin: 0px 15px;
		padding: 10px 0px;
	}

	.tips-input-placeholder {
		font-size: 12px;
		color: #C0C0C0;
	}

	.tips-question {
		color: #4C5382;
		border-radius: 5px;
		border: 1px solid #4C5382;
		font-size: 11px;
		padding: 3px 10px;
		margin-right: 10px;
	}

	.tips-question:active {
		opacity: 0.8;
	}

	.tips-commit {
		background-color: #4C5382;
		color: white;
		border-radius: 20px;
		font-size: 13px;
		line-height: 27px;
		padding: 0px 20px;
		margin: 10px 10px;
		position: relative;
		align-self: flex-end;
	}

	.tips-commit:active {
		opacity: 0.8;
	}
</style>