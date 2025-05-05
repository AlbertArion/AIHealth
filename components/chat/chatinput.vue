<template>
	<view class="footer">
		<view v-if="fromDialog && !fromCheckIn" class="footer-left" @click="$emit('show-history')">
			<uni-icons class="action-icon" type="list" size="24" :color="color" />
		</view>
		<div class="textarea-container">
			<textarea class="textarea" :style="`height: ${textAreaMinHeight}; border-color: ${color};`"
				:placeholder="`${recording?'':'请输入您的问题'}`" :show-confirm-bar="false" always-embed="true"
				adjust-position="true" cursor-spacing="30" cursor-color="#4C5382" maxlength="1000" inputmode="text"
				v-model="inputValue" confirm-type="send" @linechange="inputLineChanged"
				@touchstart="$emit('closePopup')" @confirm="sendMessage" />
			<view class="record-loading" v-if="recording" style="width: 80px;">
				<view class="m-content-head m-content-head-home" style="padding-left: 20px;padding-top: 15px;">
					<loading-dots class="recording-dots" :color="color" />
				</view>
			</view>
			<uni-icons v-if="hasLogin" class="icon fas fa-search" @click="sendMessage" type="paperplane-filled"
				size="24" :color="color" />
			<button v-else class="send-btn" open-type="getPhoneNumber" @getphonenumber="quickLogin">发送</button>
		</div>
		<!-- <view class="footer-right" @click="startCall" @touchstart="callTouchStart" @touchend="callTouchEnd"
			:style="`width: ${footSideWidth}; height: ${footSideWidth};`">
			<uni-icons class="action-icon" :type="`${callTouching?'phone-filled':'phone'}`" size="24" :color="color" />
		</view> -->
		<view class="footer-right" @touchstart="startRecord" @touchend="endRecord">
			<uni-icons class="action-icon" :type="`${recording?'mic-filled':'mic'}`" size="24" :color="color" />
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
				recording: false,
				callTouching: false,
				textAreaMinHeight: '35px',
				footSideWidth: '32px'
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
			}
		},
		methods: {
			load: function() {},
			startRecord: function() {
				this.recording = true;
				this.$emit('start-record');
			},
			endRecord: function() {
				if (this.recording) {
					this.$emit('end-record');
					this.recording = false;
				}
			},
			startCall: function() {
				this.$emit('start-call');
			},
			callTouchStart: function() {
				this.callTouching = true;
				this.$emit("call-touch-start");
			},
			callTouchEnd: function() {
				this.callTouching = false;
				this.$emit("call-touch-end");
			},
			inputLineChanged: function(e) {
				this.textAreaMinHeight = (e.detail.height + 18) + 'px';
				if (this.footSideWidth == '32px') {
					this.footSideWidth = (e.detail.height + 15) + 'px';
				}
			},
			inputSend: function(message) {
				this.inputValue = message.content;
				setTimeout(() => {
					this.sendMessage();
				}, 300);
			},
			sendMessage: function(event) {
				if (this.inputValue.trim() == '') {
					this.inputValue = '';
					store.userConfig.inputValue = '';
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
					store.userConfig.inputValue = '';
				}
			},
			quickLogin: function(e) {
				if (e.detail?.errMsg != "getPhoneNumber:ok") {
					console.log("ChatInput, quickLogin, failed: ", e.detail?.errMsg)
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
	@import "../../common/icon.css";

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
		line-height: 10px;
		border: solid 1px white;
		font-family: verdana !important;
		overflow: hidden;
		border-radius: 10px;
		font-size: 15px;
		box-sizing: border-box;
		padding: 8px 27px 8px 10px;
		margin: 0px 5px;
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

	.send-btn:active {
		opacity: 0.8;
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

	.icon:active {
		opacity: 0.8;
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
</style>