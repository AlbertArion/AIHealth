<template>
	<view class="footer">
		<div class="textarea-container">
			<textarea class="textarea" :style="`height: ${textAreaMinHeight}; border-color: ${color};`"
				placeholder="请输入您的问题" @linechange="inputLineChanged" always-embed="true" adjust-position="true"
				cursor-spacing="30" cursor-color="#4C5382" maxlength="1000" type="text" v-model="inputValue"
				confirm-type="send" @confirm="sendMessage" @touchstart="$emit('closePopup')" />
			<uni-icons v-if="hasLogin" class="icon fas fa-search" @click="sendMessage" type="paperplane-filled"
				size="24" :color="color" />
			<button v-else class="send-btn" open-type="getPhoneNumber" @getphonenumber="quickLogin">发送</button>
		</div>
		<view class="footer-right" @click="chooseFile" @touchstart="uploadTouchStart" @touchend="uploadTouchEnd">
			<uni-icons class="action-icon" :type="`${uploadTouching ? 'cloud-upload-filled' : 'cloud-upload'}`"
				size="24" :color="color" />
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
	export default {
		name: "chat-input",
		data() {
			return {
				inputValue: '',
				textAreaMinHeight: '35px',
				footSideWidth: '32px',
				uploadTouching: false,
				onShow: false,
				oldPath: '',
				record: {
					fileUrl: '',
					filename: '',
					filePath: '',
				}
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
			}
		},
		components: {
			wave
		},
		computed: {
			hasLogin: function() {
				return store.hasLogin;
			},
		},
		methods: {
			load: function() {},
			show: function() {
				this.onShow = true;
			},
			hide: function() {
				this.onShow = false;
			},
			uploadTouchStart: function() {
				this.uploadTouching = true;
			},
			uploadTouchEnd: function() {
				this.uploadTouching = false;
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
							uni.showLoading({
								title: "上传中...",
								mask: true
							});
							that.record.fileUrl = "";
							that.record.filename = res.tempFiles[0].name;
							that.record.filePath = res.tempFiles[0].path;
							this.uploadFile();
						}
					},
					fail: (err) => {},
					complete: () => {},
				});
			},
			uploadFile: function() {
				const that = this;
				const filePath = that.record.filePath;
				// 上传到云端
				if (filePath && filePath != that.oldPath) {
					that.oldPath = "";
					const cloudPath = '/upload/records/pdf/' + that.record.filename;
					uniCloud.uploadFile({
						filePath: filePath, //要上传的文件对象
						cloudPath: cloudPath, //保存在云端的文件名
						cloudPathAsRealPath: true,
						success(res) {
							that.record.fileUrl = res.fileID;
							that.sendPDF();
						},
						fail(err) {
							console.log("UploadFile 失败, err: ", err);
							uni.showToast({
								icon: 'fail',
								title: "上传文件失败",
								content: err.errMsg,
								duration: 600
							});
							uni.hideLoading();
						}
					});
				} else {
					that.sendPDF();
				}
			},
			inputLineChanged: function(e) {
				this.textAreaMinHeight = (e.detail.height + 18) + 'px';
				if (this.footSideWidth == '32px') {
					this.footSideWidth = (e.detail.height + 15) + 'px';
				}
			},
			sendPDF: function() {
				this.$emit('sendMessage', {
					message_type: 2,
					record: this.record
				});
			},
			sendMessage: function() {
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
</style>