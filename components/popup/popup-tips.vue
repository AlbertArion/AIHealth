<template>
	<view class="uni-popup-dialog">
		<view class="uni-dialog-title">
			<text class="uni-dialog-title-text" :class="['uni-popup__'+dialogType]">{{titleText}}</text>
		</view>
		<view v-if="mode === 'base'" class="uni-dialog-content">
			<slot>
				<!-- <text class="uni-dialog-content-text">{{content}}</text> -->
				<view class="uni-dialog-content-text">
					<text>感谢您信任并使用心脉AI。\n1、为了便于您更详细了解您的权利和义务，请您仔细阅读心脉AI</text>
					<text class="text-link" @click="toAgreeMent">《用户协议》</text>
					与
					<text class="text-link" @click="toPrivacyPolicy">《隐私政策》</text>
					<text>并做出是否同意授权的决定。\n2、心脉AI团队重视用户隐私并严格按照相关法律法规的要求以及心脉AI</text>
					<text class="text-link" @click="toAgreeMent">《用户协议》</text>
					与
					<text class="text-link" @click="toPrivacyPolicy">《隐私政策》</text>
					<text>所约定的方式进行内容收集、使用用户信息。\n3、据您使用服务的具体功能，需要收集使用信息，可能使用您的一下权限：\n（1）存储权限、相册权限：健康模块上传病历。\n（2）麦克风权限、音频播放权限：智能问答和反馈语音录入，智能问答语音播报。\n4、您根据指引注册登录并继续使用我们的各项服务时，需同意我们的</text>
					<text class="text-link" @click="toAgreeMent">《用户协议》</text>
					与
					<text class="text-link" @click="toPrivacyPolicy">《隐私政策》</text>
					<text>，否则您只能浏览部分内容和使用部分服务。</text>
				</view>
			</slot>
		</view>
		<view v-else class="uni-dialog-content">
			<slot>
				<input v-if="setNicknameIng" class="uni-dialog-input" :maxlength="maxlength" v-model="val"
					type="nickname" :placeholder="placeholderText" :focus="focus" cursor-color="#4C5382">
				<input v-else class="uni-dialog-input" :maxlength="maxlength" v-model="val" type="text"
					:placeholder="placeholderText" :focus="focus" cursor-color="#4C5382">
			</slot>
		</view>
		<view class="uni-dialog-button-group">
			<view class="uni-dialog-button" v-if="showClose" @click="closeDialog">
				<text class="uni-dialog-button-text">{{closeText}}</text>
			</view>
			<view class="uni-dialog-button uni-border-left" @click="onOk">
				<text class="uni-dialog-button-text uni-button-color">{{okText}}</text>
			</view>
		</view>

	</view>
</template>

<script>
	import popup from '@/uni_modules/uni-popup/components/uni-popup/popup.js';
	import {
		initVueI18n
	} from '@dcloudio/uni-i18n';
	import messages from '@/uni_modules/uni-popup/components/uni-popup/i18n/index.js';
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store.js';
	const {
		t
	} = initVueI18n(messages);

	export default {
		name: "popupTips",
		mixins: [popup],
		emits: ['confirm', 'close'],
		props: {
			showClose: {
				type: Boolean,
				default: true
			},
			value: {
				type: [String, Number],
				default: ''
			},
			placeholder: {
				type: [String, Number],
				default: ''
			},
			type: {
				type: String,
				default: 'error'
			},
			mode: {
				type: String,
				default: 'base'
			},
			title: {
				type: String,
				default: ''
			},
			content: {
				type: String,
				default: ''
			},
			beforeClose: {
				type: Boolean,
				default: false
			},
			cancelText: {
				type: String,
				default: ''
			},
			confirmText: {
				type: String,
				default: ''
			},
			maxlength: {
				type: Number,
				default: -1,
			},
			focus: {
				type: Boolean,
				default: true,
			}
		},
		data() {
			return {
				dialogType: 'error',
				val: ""
			}
		},
		computed: {
			okText() {
				return this.confirmText || t("uni-popup.ok")
			},
			closeText() {
				return this.cancelText || t("uni-popup.cancel")
			},
			placeholderText() {
				return this.placeholder || t("uni-popup.placeholder")
			},
			titleText() {
				return this.title || t("uni-popup.title")
			},
			setNicknameIng() {
				return store.setNicknameIng
			},
			inputType() {
				return store.setNicknameIng ? "nickname" : "text";
			}
		},
		watch: {
			type(val) {
				this.dialogType = val
			},
			mode(val) {
				if (val === 'input') {
					this.dialogType = 'info'
				}
			},
			value(val) {
				if (this.maxlength != -1 && this.mode === 'input') {
					this.val = val.slice(0, this.maxlength);
				} else {
					this.val = val
				}
			}
		},
		created() {
			// 对话框遮罩不可点击
			this.popup.disableMask()
			// this.popup.closeMask()
			if (this.mode === 'input') {
				this.dialogType = 'info'
				this.val = this.value
			} else {
				this.dialogType = this.type
			}
		},
		methods: {
			/**
			 * 点击确认按钮
			 */
			onOk() {
				if (this.mode === 'input') {
					this.$emit('confirm', this.val)
				} else {
					this.$emit('confirm')
				}
				this.$emit("input", this.val);
				uniCloud.database().collection("uni-id-users")
					.where('"_id" == $env.uid')
					.update({
						agreed: true
					})
					.then(res => {
						console.log("PopupTips, user agreed = ", res);
						if (!this.beforeClose) {
							this.popup.close()
						}
					});
			},
			/**
			 * 点击取消按钮
			 */
			closeDialog() {
				this.$emit('close');
				if (this.beforeClose) return
				this.popup.close();
				uni.tool.exitMiniProgram();
			},
			close() {
				this.popup.close();
			},
			toAgreeMent() {
				uni.navigateTo({
					url: '/pages/uni-agree/useragreement'
				});
			},
			toPrivacyPolicy() {
				uni.navigateTo({
					url: '/pages/uni-agree/privatepolicy'
				});
			},
		}
	}
</script>

<style lang="scss">
	.uni-popup-dialog {
		margin: 0px 50px;
		border-radius: 11px;
		background-color: #fff;
	}

	.uni-dialog-title {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
		justify-content: center;
		padding-top: 25px;
	}

	.uni-dialog-title-text {
		font-size: 16px;
		font-weight: 500;
	}

	.uni-dialog-content {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
		justify-content: center;
		align-items: center;
		padding: 20px;
	}

	.uni-dialog-content-text {
		flex-wrap: wrap;
		flex-direction: row;
		font-size: 14px;
		max-height: 200px;
		overflow-y: scroll;
		line-height: 22px;
		color: #6C6C6C;
	}

	.text-link {
		display: inline-block;
		color: #4C5382;
	}

	.uni-dialog-button-group {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
		border-top-color: #f5f5f5;
		border-top-style: solid;
		border-top-width: 1px;
	}

	.uni-dialog-button {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */

		flex: 1;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		height: 45px;
	}

	.uni-border-left {
		border-left-color: #f0f0f0;
		border-left-style: solid;
		border-left-width: 1px;
	}

	.uni-dialog-button-text {
		font-size: 16px;
		color: #333;
	}

	.uni-button-color {
		color: #4C5382;
	}

	.uni-dialog-input {
		flex: 1;
		font-size: 14px;
		border: 1px #eee solid;
		height: 40px;
		padding: 0 10px;
		border-radius: 5px;
		color: #555;
	}

	.uni-popup__success {
		color: #4cd964;
	}

	.uni-popup__warn {
		color: #f0ad4e;
	}

	.uni-popup__error {
		color: #dd524d;
	}

	.uni-popup__info {
		color: #6C6C6C;
	}
</style>