<template>
	<view class="uni-popup-dialog" @click="$emit('closePopup')" :style="popupStyle">
		<view class="popup-row-top">
			<view class="popup-column">
				<text class="popup-text-product">「心脉AI」</text>
				<view class="popup-logo-container">
					<image class="popup-image-logo"
						src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/cloudstorage/aiavatar.jpg"
						mode="widthFix" />
				</view>
			</view>
			<text class="popup-text">由钟幼民医生通过奇绩创坛平台带领的创业团队精心打造，专注于AI+心血管健康/医疗领域，致力于呵护每一个人的心血管健康。团队主要由清北技术背景的成员构成。</text>
		</view>
		<view style="height: 6px;"></view>
		<view class="popup-row-bottom">
			<text class="popup-text-cover">北京大学医学博士、心血管医生、美国Texas Heart Institute
				博士后；曾出任北京和睦家医院顾问医生、 心血管专家，北京朝阳疾病预防和控制中 心临床专家等。有着二十多年的临床经验，擅长心律失常、心力衰竭、心肌病和高血压等各种心血管病及危险因素的诊疗。
			</text>
			<view class="popup-column">
				<view class="popup-image-cover-container">
					<image class="popup-image-ceo-cover"
						src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/cloudstorage/popup_ceo_cover.png"
						mode="widthFix">
					</image>
				</view>
				<text class="popup-text-ceo">钟幼民</text>
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

	/**
	 * PopUp 弹出层-对话框样式
	 * @description 弹出层-对话框样式
	 * @tutorial https://ext.dcloud.net.cn/plugin?id=329
	 * @property {String} value input 模式下的默认值
	 * @property {String} placeholder input 模式下输入提示
	 * @property {Boolean} focus input模式下是否自动聚焦，默认为true
	 * @property {String} type = [success|warning|info|error] 主题样式
	 *  @value success 成功
	 * 	@value warning 提示
	 * 	@value info 消息
	 * 	@value error 错误
	 * @property {String} mode = [base|input] 模式、
	 * 	@value base 基础对话框
	 * 	@value input 可输入对话框
	 * @showClose {Boolean} 是否显示关闭按钮
	 * @property {String} content 对话框内容
	 * @property {Boolean} beforeClose 是否拦截取消事件
	 * @property {Number} maxlength 输入
	 * @event {Function} confirm 点击确认按钮触发
	 * @event {Function} close 点击取消按钮触发
	 */
	export default {
		name: "popupIntro",
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
				val: "",
				popupStyle: {}
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
		mounted() {
			const systemInfo = getApp().globalData.systemInfo;
			const screenWidth = systemInfo.windowWidth; // 注意：这里可能是窗口宽度，如果需要全屏宽度请使用 screenWidth
			this.popupStyle.width = `${screenWidth * 0.9}px`;
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
			// this.popup.disableMask()
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
			toprivacyPolicy() {
				uni.navigateTo({
					url: '/pages/uni-agree/privatepolicy'
				});
			},
		}
	}
</script>

<style lang="scss">
	.uni-popup-dialog {
		display: flex;
		flex-direction: column;
		padding: 10px 0px 30px;
		background-color: white;
		border-radius: 10px;
		overflow: hidden;
	}

	.popup-row-top {
		display: flex;
		flex-direction: row;
		// width: 240px;
		width: 99%;
		min-height: 120px;
		// align-items: start;
	}

	.popup-row-bottom {
		display: flex;
		flex-direction: row;
		// width: 360px;
		width: 99%;
		min-height: 120px;
		align-items: end;
	}

	.popup-column {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.popup-text-product {
		position: relative;
		align-self: flex-start;
		font-size: 32rpx;
		color: #4C5382;
		line-height: 24px;
		font-weight: bold;
		margin-left: 18px;
		margin-bottom: 10px;
		margin-top: 20px;
		font-family: ui-rounded;
	}

	.popup-text {
		font-size: 24rpx;
		color: #0c0c0c;
		line-height: 24px;
		padding: 20px 10px;
		font-family: ui-rounded;
	}

	.popup-text-cover {
		font-size: 24rpx;
		max-width: 60%;
		color: #0c0c0c;
		line-height: 24px;
		margin: 0px 20px;
		font-family: ui-rounded;
	}

	.popup-text-ceo {
		position: relative;
		align-self: center;
		font-size: 16px;
		color: #4C5382;
		font-weight: bold;
		margin-right: 20px;
		margin-top: 10px;
		font-family: ui-rounded;
	}

	.popup-logo-container {
		display: flex;
		border-radius: 10px;
		overflow: hidden;
		margin-left: 20px;
	}

	.popup-image-logo {
		width: 88px;
	}

	.popup-image-cover-container {
		display: flex;
		border-radius: 10px;
		overflow: hidden;
		margin: 20px 20px 0px 0px;
	}

	.popup-image-ceo-cover {
		width: 100px;
	}

	.text-link {
		display: inline-block;
		color: #4C5382;
	}
</style>