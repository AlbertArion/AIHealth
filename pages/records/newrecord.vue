<template>
	<view class="new-record-content">
		<view class="record-info">
			<view class="info-title" style="padding: 0px 5px 0px 0px; margin-bottom: 0px;">
				<text style="flex: 1; padding: 10px;">病情描述</text>
				<view v-if="hasPDF" class="new-record-action-btn" @click="chooseFile">
					<image class="new-record-action-icon" style="width: 20px;" mode="widthFix"
						src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/static/record/icon_record_pdf.png" />
				</view>
				<view v-else-if="hasImage" class="new-record-action-btn" @click="chooseImage">
					<image class="new-record-action-icon" style="width: 20px;" mode="widthFix"
						src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/static/record/icon_record_image.png" />
				</view>
				<view v-if="filePath" class="new-record-action-btn" @click="removeFile">
					<image class="new-record-action-icon" style="width: 20px;" mode="widthFix"
						src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/static/record/icon_file_remove.png" />
				</view>
			</view>
			<view class="new-record-add-container">
				<view v-if="hasPDF" class="top-actions" @click="openFile">
					<image style="width: 40px;" mode="widthFix"
						src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/static/record/icon_record_pdf_active.png" />
					<text class="action-text">{{record.filename}}</text>
				</view>
				<view v-else-if="hasImage" class="record-image-container" @click="previewImage">
					<image class="record-image" :src="filePath" mode="widthFix" />
				</view>
				<view v-else class="top-actions-container">
					<view class="top-actions" @click="chooseImage">
						<image style="width: 20px;" mode="widthFix"
							src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/static/record/icon_record_image_active.png" />
						<text class="action-text">上传图片</text>
					</view>
					<view class="top-actions" style="border-left: #4C5382 1px solid;" @click="chooseFile">
						<image style="width: 20px;" mode="widthFix"
							src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/static/record/icon_record_pdf_active.png" />
						<text class="action-text">上传报告</text>
					</view>
				</view>
			</view>
			<view class="input-container">
				<textarea class="info-area-text" v-model="record.content" maxlength="500" cursor-color="#4C5382"
					placeholder-class="info-area-text-placeholder" :placeholder="`${recording?'':'请详细描述您的病情'}`" />
				<view class="recording-area"
					:class="`${ this.recording ? (this.expanding ? 'anim-expand' : 'anim-shrink') : ''}`"
					@longpress="startRecord" @touchend="endRecord">
					<uni-icons class="mic-icon" :type="`${recording?'mic-filled':'mic'}`" size="24"
						:color="`${recording?'white':'#4C5382'}`" />
				</view>
			</view>
		</view>
		<view v-if="hasIndex" class="record-info">
			<view class="info-title" style="margin-bottom: 0px; padding: 0px 10px;">
				<text class="record-tips">健康建议</text>
				<button class="record-action-button" @click="applyHealthTips">{{tipActionText}}</button>
			</view>
			<view class="tips-list">
				<view class="tip-item-container" v-if="hasTips" v-for="(tip, index) in record.tips" :key="index"
					v-bind:tip="tip" :id="index">
					<view class="tip-title">
						<text class="tip-title-text">{{record.isExpert ? '专家建议：' : '建议内容：'}}</text>
						<text class="tip-price">{{tipPrice}}</text>
						<text class="tip-time">{{timeFormat(tip.timestamp)}}</text>
					</view>
					<view class="tip-item-lines">
						<text class="tip-item">{{tip.content}}</text>
						<uni-icons class="tip-icon" @click="removeTips(tip, index)" type="minus-filled" size="20"
							color="indianred" />
					</view>
					<view class="tip-item-lines" v-if="tip.comments?.length > 0"
						v-for="(comment, cIndex) in tip.comments" :key="cIndex" v-bind:comment="comment" :id="cIndex">
						<text class="tip-comment-item"> {{tipCommentText}}{{comment}}</text>
					</view>
				</view>
				<view v-else class="tip-item-empty">
					<text class="tip-item-empty-text">{{emptyTipText}}</text>
				</view>
			</view>
		</view>
		<view class="record-info">
			<view class="info-title" style="margin-bottom: 0px;">筛选标签</view>
			<view class="info-labels">
				<view :class="`${record.label == '门诊病历' ?'label-item-selected' :'label-item'}`"
					@click="onLabelClick('门诊病历')">门诊病历</view>
				<view :class="`${record.label == '心电报告' ?'label-item-selected' :'label-item'}`"
					@click="onLabelClick('心电报告')">心电报告</view>
				<view :class="`${record.label == '检查报告' ?'label-item-selected' :'label-item'}`"
					@click="onLabelClick('检查报告')">检查报告</view>
			</view>
			<view class="info-labels">
				<view :class="`${record.label == '睡眠报告' ?'label-item-selected' :'label-item'}`"
					@click="onLabelClick('睡眠报告')">睡眠报告</view>
				<view :class="`${record.label == '体检报告' ?'label-item-selected' :'label-item'}`"
					@click="onLabelClick('体检报告')">体检报告</view>
				<view :class="`${record.label == '心理咨询' ?'label-item-selected' :'label-item'}`"
					@click="onLabelClick('心理咨询')">心理咨询</view>
			</view>
			<view style="width: 100%; height: 10px;"></view>
		</view>
		<view class="record-info">
			<view class="info-title">基础信息</view>
			<view class="info-list">
				<view class="info-item">
					<text class="info-item-label">姓名：</text>
					<input class="info-item-text" v-model="record.name" placeholder-class="info-item-text-placeholder"
						placeholder="请输入您的姓名" cursor-color="#4C5382" />
				</view>
				<view class="info-item">
					<text class="info-item-label">性别：</text>
					<!-- <input class="info-item-text" v-model="record.gender" placeholder-class="info-item-text-placeholder"
						placeholder="请输入您的性别" cursor-color="#4C5382"/> -->
					<view class="info-gender-container">
						<text :class="`${record.gender == '男' ? 'gender-item-selected-left' : 'gender-item-left'}`"
							@click="onGenderClick('男')">男</text>
						<view class="v-line"></view>
						<text :class="`${record.gender == '女' ? 'gender-item-selected-right' : 'gender-item-right'}`"
							@click="onGenderClick('女')">女</text>
					</view>
				</view>
				<view class="info-item">
					<text class="info-item-label">年龄：</text>
					<input class="info-item-text" v-model="record.age" placeholder-class="info-item-text-placeholder"
						placeholder="请输入您的年龄" type="number" cursor-color="#4C5382" />
					<!-- <picker class="info-item-picker" @change="onAgeChanged" mode="selector" :range="ageArray"
						range-key="name" :value="ageIndex">
						<view class="info-item-text">{{ageText}}</view>
					</picker> -->
				</view>
				<view class="info-item">
					<text class="info-item-label">医院：</text>
					<input class="info-item-text" v-model="record.hospital"
						placeholder-class="info-item-text-placeholder" placeholder="请输入所在医院" cursor-color="#4C5382" />
				</view>
			</view>
		</view>
		<view class="bottom-actions" style="margin-top: 20px;">
			<button class="bottom-action-button" @click="complete">完成添加</button>
		</view>
		<view v-if="hasIndex" class="bottom-actions">
			<button class="bottom-action-button" @click="removeRecord"
				style="background-color: indianred;">删除记录</button>
		</view>
		<view style="height: 20px;" />
		<uni-popup ref="popupManual" type="bottom" @maskClick="closePopupManual">
			<popup-manual mode="base" @closePopup="closePopupManual" @pay="toPay" @exchange="toExchange"
				:record="record" />
		</uni-popup>
	</view>
</template>

<script>
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store';
	import {
		generateOrderNumber,
	} from '@/common/utils/generateUUID.ts';
	import popupManual from '@/components/popup/popup-manual-report.vue';
	import {
		exchangeForTips,
		payForTips,
		tipActionText
	} from '@/common/js/record';
	import {
		formatTimestamp
	} from '@/common/utils/timestamp';
	const db = uniCloud.database();
	var plugin = requirePlugin("WechatSI");
	let manager = plugin.getRecordRecognitionManager();
	export default {
		data() {
			return {
				record: {
					name: "",
					gender: "",
					age: "",
					hospital: "",
					content: "",
					label: ""
				},
				oldPath: "",
				ageArray: [{
					name: '请输入您的年龄'
				}],
				ageIndex: -1,
				recording: false,
				expanding: true,
				dotCount: 0,
				voiceState: "点击录音开始",
				voicePath: '',
				endOne: '',
			}
		},
		components: {
			popupManual
		},
		computed: {
			// 用户昵称
			nickname() {
				return store.userInfo ? store.userInfo.nickname : "";
			},
			avatar() {
				return store.userInfo?.avatar_file?.url;
			},
			hasIndex() {
				return store.currentRecordIndex >= 0;
			},
			hasTips() {
				return this.record.tips?.length > 0;
			},
			hasPDF() {
				return String(this.record.filename?.substr(this.record.filename.length - 4)).toLowerCase() == ".pdf";;
			},
			hasImage() {
				return this.filePath;
			},
			filePath() {
				return (this.hasIndex && this.record.fileUrl && this.record.fileUrl != "") ? this.record.fileUrl : this
					.record.filePath;
			},
			ageText() {
				return this.ageIndex == -1 ? "请输入您的年龄" : this.ageArray[this.ageIndex].name;
			},
			recordLabel() {
				return this.record.label ? this.record.label : "检查报告";
			},
			tipPrice() {
				return this.record.isExpert ? '￥199' : '￥19.9';
			},
			tipActionText() {
				return tipActionText(this.record);
			},
			emptyTipText() {
				return this.record.isPaid ? `您申请的${this.record.isExpert ? '专家建议' : '健康解读'}还在生成中，完成后会在这里展示 ~` :
					'还没有建议内容，点击上方「解读」试试吧 ~';
			},
		},
		mounted() {
			this.ageArray = [];
			for (let i = 60; i >= 10; i--) {
				this.ageArray.push({
					name: i + " 岁"
				});
			}
			if (this.record.age && this.record.age != "") {
				this.ageIndex = 60 - Number(this.record.age.split(" ")[0]);
			}
			this.initRecord();
		},
		onLoad() {
			this.configRecord();
		},
		onUnload() {
			console.log("NewRecord, onUnload");
			store.resetRecordIndex();
		},
		methods: {
			// 时间格式化
			timeFormat: function(timestamp) {
				return formatTimestamp(timestamp);
			},
			// 初始化录音事件
			initRecord: function() {
				const that = this;
				manager.onStart = function(res) {
					that.voiceState = "onStart:" + res.msg + "正在录音";
					console.log("NewRecord, start record: " + that.voiceState);
				};
				//有新的识别内容返回，则会调用此事件  
				manager.onRecognize = (res) => {
					this.voiceState = res.result;
					console.log("NewRecord, recognized: " + this.voiceState);
				}
				// 识别结束事件  
				manager.onStop = (res) => {
					this.voicePath = res.tempFilePath;
					this.voiceState = res.result;
					if (this.voiceState == '') {
						console.log('NewRecord, 没有说话')
						this.endOne = '周围太安静啦，再试试~';
					}
					this.record.content += res.result;
					console.log("NewRecord, inputValue = " + this.record.content);
				}

				// 识别错误事件  
				manager.onError = (res) => {
					this.voiceState = '';
					console.log("NewRecord, voice manager onError: ", res);
				}
			},
			startAnim: function() {
				setTimeout(() => {
					this.expanding = !this.expanding;
					if (this.dotCount >= 4) {
						this.dotCount = 0;
						this.record.content = this.record.content.substring(0, this.record.content.length - 4);
					}
					this.dotCount += 1;
					this.record.content += '.';
					if (this.recording) {
						this.startAnim();
					} else {
						this.record.content = this.record.content.substring(0, this.record.content.length -
							this.dotCount);
						this.dotCount = 0;
					}
				}, 500);
			},
			startRecord: function() {
				console.log('NewRecord, 开始录音');
				this.recording = true;
				manager.start({
					duration: 60000,
					lang: "zh_CN"
				});
				this.startAnim();
			},
			endRecord: function() {
				console.log('NewRecord, 录音结束');
				manager.stop();
				this.recording = false;
			},
			onAgeChanged: function(e) {
				this.ageIndex = e.detail.value;
				this.record.age = this.ageArray[this.ageIndex].name;
			},
			onGenderClick: function(gender) {
				if (this.record.gender != gender) {
					this.record.gender = gender;
				}
			},
			onLabelClick: function(label) {
				if (this.record.label == label) {
					this.record.label = "";
				} else {
					this.record.label = label;
				}
			},
			// 初始化信息
			configRecord: function() {
				if (this.hasIndex) {
					const storeRecord = store.getHealthRecord();
					this.record = {
						...this.record,
						...storeRecord,
					};
				}
			},
			complete: function() {
				if (this.filePath) {
					this.uploadFile();
				} else if (this.record?.content) {
					this.record.timestamp = Date.now();
					this.updateDBRecord(this.nickname, this.avatar, this.record);
				} else {
					uni.showToast({
						icon: 'none',
						title: "请上传资料或者填写病情描述",
						duration: 1000
					});
				}
			},
			uploadFile: function() {

				// 图片报告必须要筛选标签
				if (!this.hasPDF && (!this.record.label || this.record.label == '')) {
					uni.showToast({
						icon: 'none',
						title: "请选择筛选标签",
						duration: 1000
					});
					return;
				}

				// 加载Loading
				const that = this;
				const filePath = that.record.filePath;
				uni.showLoading({
					title: "添加中...",
					mask: true
				});

				// 上传到云端
				if (filePath && filePath != that.oldPath) {
					that.oldPath = "";
					const cloudPath = that.hasPDF ? ('/upload/records/pdf/' + that.record.filename) :
						('/upload/records/image/' + Date.now() + '.jpg');
					uniCloud.uploadFile({
						filePath: filePath, //要上传的文件对象
						cloudPath: cloudPath, //保存在云端的文件名
						cloudPathAsRealPath: true,
						success(res) {
							console.log("NewRecord, 上传文件成功: " + res.fileID);
							that.record.fileUrl = res.fileID;
							that.updateDBRecord(that.nickname, that.avatar, that.record);
						},
						fail(err) {
							console.log("UploadFile 失败, err: ", err);
							uni.showToast({
								icon: 'fail',
								title: "上传图片失败",
								content: err.errMsg,
								duration: 600
							});
							uni.hideLoading();
						}
					});
				} else {
					that.updateDBRecord(that.nickname, that.avatar, that.record);
				}
			},
			updateDBRecord: function(nickname, avatar, record) {
				if (this.hasIndex) {
					if (!record || !record._id) {
						console.log("NewRecord, 更新失败， record: ", record);
						return;
					}
					db.collection('health-records').where({
						_id: record._id
					}).update({
						nickname: nickname,
						avatar: avatar,
						filename: record.filename,
						fileUrl: record.fileUrl,
						name: record.name,
						gender: record.gender,
						age: record.age,
						hospital: record.hospital,
						content: record.content,
						label: record.label
					}).then((res) => {
						store.updateHealthRecord(this.record); // 更新到本地缓存
						uni.hideLoading();
						uni.navigateBack();
					}).catch((err) => {
						console.log("NewRecord 更新失败， err: ", err);
						uni.showToast({
							icon: 'fail',
							title: "更新失败",
							content: err.errMsg,
							duration: 600
						});
						uni.hideLoading();
					}).finally(() => {});
				} else {
					db.collection('health-records').add({
						uid: store.userInfo._id,
						nickname: nickname,
						avatar: avatar,
						filename: record.filename,
						fileUrl: record.fileUrl,
						name: record.name,
						gender: record.gender,
						age: record.age,
						hospital: record.hospital,
						content: record.content,
						label: record.label
					}).then((res) => {
						console.log("NewRecord 添加成功");
						this.record._id = res.result.id;
						store.unshiftHealthRecord(this.record); // 添加到本地缓存
						uni.hideLoading();
						uni.navigateBack();
					}).catch((err) => {
						console.log("NewRecord 添加失败， err = ", err);
						uni.showToast({
							icon: 'fail',
							title: "添加失败",
							content: err.errMsg,
							duration: 600
						});
						uni.hideLoading();
					}).finally(() => {});
				}
			},
			previewImage: function() {
				uni.previewImage({
					urls: [this.filePath]
				});
			},
			chooseImage: function() {
				const that = this;
				uni.chooseImage({
					count: 1,
					success(res) {
						that.oldPath = that.record.filePath;
						if (res.tempFilePaths.length > 0) {
							that.record.nickname = that.nickname;
							that.record.fileUrl = "";
							that.record.filePath = res.tempFilePaths[0];
							that.record.timestamp = Date.now();
						}
						console.log("NewRecord, chooseImage success, filePath= " + that.record.filePath);
					}
				});
			},
			openFile: function() {
				console.log("NewRecord, openFile, filePath = " + this.record.filePath + ", fileUrl = " + this.record
					.fileUrl);
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
			removeFile: function() {
				this.record.filePath = "";
				this.record.fileUrl = "";
				this.record.filename = "";
			},
			chooseFile: function() {
				const that = this;
				uni.chooseMessageFile({
					count: 1,
					type: 'file',
					extension: ['pdf'],
					success: (res) => {
						that.oldPath = that.record.filePath;
						if (res.tempFiles.length > 0) {
							that.record.nickname = that.nickname;
							that.record.fileUrl = "";
							that.record.filename = res.tempFiles[0].name;
							that.record.filePath = res.tempFiles[0].path;
							that.record.timestamp = Date.now();
						}
					},
					fail: (err) => {},
					complete: () => {},
				});
			},
			removeRecordFromDB: function() {
				if (this.record.fileUrl?.length > 0) {
					uniCloud.callFunction({
						name: 'removefile',
						data: {
							data: {
								fileList: [this.record.fileUrl]
							}
						},
						success: (res) => {
							console.log("NewRecord, 删除文件结果: ", res);
						}
					});
				}
				db.collection('health-records').where({
						_id: this.record._id
					}).remove()
					.then((res) => {
						store.removeHealthRecord();
						uni.showToast({
							title: '删除成功',
							icon: 'success',
							duration: 600,
							success: () => {
								setTimeout(() => {
									uni.navigateBack();
								}, 600)
							}
						});
					})
					.catch((err) => {
						console.log("NewRecord, 删除失败：" + err.message);
					});
			},
			removeRecord: function() {
				if (!this.record || !this.record._id) {
					console.log("NewRecord, 删除失败， record id 为空 ");
					return;
				}
				const that = this;
				uni.showModal({
					title: "删除记录",
					content: "确定要删除该记录吗？",
					confirmColor: '#4C5382',
					showCancel: true,
					success: function(res) {
						if (res.confirm) {
							that.removeRecordFromDB();
						}
					}
				});
			},
			removeTipsFromDB: function(tip, index) {
				db.collection('health-tips').where({
						_id: tip._id
					})
					.remove()
					.then((res) => {
						console.log("NewRecord, 健康建议删除成功, res = ", res);
						uni.showToast({
							icon: 'success',
							title: "删除成功",
							duration: 600
						});
						this.record.tips.splice(index, 1);
					}).catch((err) => {
						console.log("NewRecord, 健康建议删除失败, err = ", err);
						uni.showToast({
							icon: 'fail',
							title: "删除失败",
							content: err.errMsg,
							duration: 600
						});
					})
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
			applyHealthTips: function() {
				if (this.record.isPaid) {
					uni.showModal({
						title: this.tipActionText,
						content: "收到微信消息通知后，请在「我的/我的健康建议」查看",
						confirmColor: '#4C5382',
						showCancel: false,
					});
				} else {
					this.showPopupManual();
				}
			},
			toExchange: function() {
				exchangeForTips(store.currentRecordIndex);
			},
			toPay: function(isExpert = false) {
				payForTips(store.currentRecordIndex, this.record, isExpert);
			},
			showPopupManual: function() {
				this.$refs.popupManual.open();
			},
			closePopupManual: function() {
				this.$refs.popupManual.close();
			},
		}
	}
</script>

<style>
	.new-record-content {
		display: flex;
		flex-direction: column;
		width: 100%;
	}

	.new-record-action-btn {
		display: flex;
		flex-direction: row;
		width: 30px;
		height: 40px;
		justify-content: center;
		align-items: center;
	}

	.new-record-action-icon {
		/* margin: 5px; */
	}

	.new-record-add-container {
		justify-content: center;
		align-items: center;
		width: 100%;
	}

	.record-image-container {
		overflow: hidden;
	}

	.record-image {
		width: 100%;
	}

	.top-actions-container {
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
	}

	.top-actions {
		flex: 1;
		display: flex;
		flex-direction: column;
		margin-bottom: 10px;
		padding: 36px 0;
		background-color: white;
		border-bottom: solid 1px #4C5382;
		align-items: center;
	}

	.action-remove-file-btn {
		position: fixed;
		z-index: 10;
		top: 38px;
		right: 10px;
		padding: 10px 10px;
	}

	.action-text {
		font-size: 14px;
		color: #4C5382;
		text-align: center;
	}

	.apply-container {
		display: flex;
		flex-direction: row;
		justify-content: center;
		padding: 0px 6px;
	}

	.record-action-button {
		width: auto;
		min-width: 45px;
		height: 24px;
		line-height: 24px;
		text-align: center;
		background-color: transparent;
		color: white;
		border-radius: 20px;
		border: 1px white solid;
		font-size: 11px;
	}

	.record-action-button:active {
		opacity: 0.8;
	}

	.record-info {
		background-color: aliceblue;
		border-radius: 10px;
		margin: 10px 20px;
		display: flex;
		flex-direction: column;
		border: solid 1px #4C5382;
		overflow: hidden;
	}

	.info-title {
		display: flex;
		flex-direction: row;
		align-items: center;
		font-size: 14px;
		font-weight: bold;
		color: white;
		margin-bottom: 10px;
		padding: 10px 10px;
		background-color: #4C5382;
	}

	.record-tips {
		flex: 1;
		margin: 10px 0px;
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

	.info-list {
		display: flex;
		flex-direction: column;
		padding: 0px 15px;
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

	.info-item {
		display: flex;
		flex-direction: row;
		margin-bottom: 3px;
		padding: 3px 0px;
	}

	.info-item-label {
		font-size: 13px;
		color: dimgray;
		width: 60px;
		height: 20px;
		align-self: center;
	}

	.info-item-picker {
		flex: 1;
	}

	.info-item-text {
		font-size: 13px;
		background-color: white;
		height: 20px;
		flex: 1;
		color: dimgray;
		border: solid 1px #a9a9a9;
		border-radius: 20px;
		padding: 3px 10px;
	}

	.info-item-text-placeholder {
		font-size: 13px;
		color: darkgray;
	}

	.info-area {
		display: flex;
		flex-direction: column;
		margin-top: 3px;
		margin-bottom: 12px;
		padding: 3px 1px;
		padding-right: 0px;
	}

	.info-area-label {
		font-size: 13px;
		color: dimgray;
		height: 20px;
		align-self: flex-start;
	}

	.input-container {
		display: flex;
		flex-direction: column;
		padding: 10px 15px;
		padding-bottom: 0px;
	}

	.info-area-text {
		width: 100%;
		min-height: 270rpx;
		font-size: 13px;
		color: #4A4A4A;
		padding: 3px 0px;
		line-height: 20px;
	}

	.info-area-text-placeholder {
		font-size: 13px;
		color: darkgray;
		padding: 3px 0px;
	}

	.info-labels {
		display: flex;
		flex-direction: row;
		padding: 0px 5px;
		justify-content: center;
	}

	.label-item {
		color: dimgray;
		border-radius: 20px;
		border: solid 1px dimgray;
		text-align: center;
		height: 20px;
		line-height: 20px;
		width: 60px;
		margin: 10px 7px 0px 7px;
		padding: 3px 14px;
		font-size: 12px;
	}

	.label-item-selected {
		color: #4C5382;
		border-radius: 20px;
		font-weight: bold;
		border: solid 1px #4C5382;
		text-align: center;
		height: 20px;
		line-height: 20px;
		width: 60px;
		margin: 10px 7px 0px 7px;
		padding: 3px 14px;
		font-size: 12px;
	}

	.info-gender-container {
		display: flex;
		flex-direction: row;
		font-size: 13px;
		flex: 1;
		border: solid 1px #a9a9a9;
		border-radius: 20px;
	}

	.v-line {
		width: 1px;
		background-color: #a9a9a9;
	}

	.gender-item-left {
		flex: 1;
		height: 26px;
		line-height: 26px;
		color: dimgray;
		text-align: center;
		background-color: white;
		border-top-left-radius: 20px;
		border-bottom-left-radius: 20px;
	}

	.gender-item-selected-left {
		flex: 1;
		height: 26px;
		line-height: 26px;
		color: white;
		text-align: center;
		background-color: #4C5382;
		border-top-left-radius: 20px;
		border-bottom-left-radius: 20px;
	}

	.gender-item-right {
		flex: 1;
		height: 26px;
		line-height: 26px;
		color: dimgray;
		text-align: center;
		background-color: white;
		border-top-right-radius: 20px;
		border-bottom-right-radius: 20px;
	}

	.gender-item-selected-right {
		flex: 1;
		height: 26px;
		line-height: 26px;
		color: white;
		text-align: center;
		background-color: #4C5382;
		border-top-right-radius: 20px;
		border-bottom-right-radius: 20px;
	}

	.bottom-actions {
		width: 100%;
		margin-top: 10px;
	}

	.bottom-action-button {
		background-color: #4C5382;
		border-radius: 20px;
		color: white;
		font-size: 14px;
		display: flex;
		width: 90%;
		margin-left: 5%;
		align-items: center;
		justify-content: center;
	}

	.bottom-action-button:active {
		opacity: 0.8;
	}

	.recording-area {
		display: flex;
		flex-direction: row;
		position: relative;
		align-self: flex-end;
		width: 40px;
		height: 40px;
		margin-bottom: 10px;
		justify-content: center;
		align-items: center;
		vertical-align: middle;
		border: 2px solid #4C5382;
		border-radius: 10px;
	}

	.recording-pressed {
		background-color: #4C5382;
	}

	.mic-icon {
		color: #ccc;
		cursor: pointer;
	}

	@keyframes shrink {
		from {
			transform: scale(1.2);
		}

		to {
			transform: scale(1);
		}
	}

	@keyframes expand {
		from {
			transform: scale(1);
		}

		to {
			transform: scale(1.2);
		}
	}

	.anim-expand {
		background-color: #4C5382;
		animation: expand 0.5s ease-in forwards;
	}

	.anim-shrink {
		background-color: #4C5382;
		animation: shrink 0.5s ease-in forwards;
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
		font-size: 13px;
		font-weight: bold;
		color: #4C5382;
		margin: 6px 10px;
	}

	.tip-title-text {
		line-height: 20px;
	}

	.tip-time {
		font-size: 10px;
		color: dimgray;
		line-height: 20px;
	}

	.tip-item-lines {
		display: flex;
		flex-direction: row;
		align-items: center;
		margin-bottom: 8px;
		margin-left: 10px;
		margin-right: 10px;
	}

	.tip-item-empty {
		display: flex;
		flex-direction: row;
		align-items: center;
		margin: 30px 10px 40px;
	}

	.tip-item-empty-text {
		flex: 1;
		font-size: 12px;
		color: darkgray;
		line-height: 20px;
		min-height: 20px;
		text-align: center;
	}

	.tip-item {
		flex: 1;
		font-size: 12px;
		color: dimgray;
		line-height: 20px;
		min-height: 20px;
		margin-left: 9px;
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
</style>