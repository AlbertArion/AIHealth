<template>
	<view class="popup-pdf-container" :style="popupStyle">
		<view class="popup-pdf-title">
			<text class="popup-title-text">选择解读方式</text>
			<text class="popup-item-price-text"
				style="flex: 1; color: #A0A0A0; font-size: 12px;">{{isFreeTrial ? '（免费试用）' : ''}}</text>
			<view class="popup-close-btn" @click="closePopup">
				<uni-icons class="close-icon" type="closeempty" size="20" color="#808080" />
			</view>
		</view>
		<view class="popup-title-divider" />
		<!-- <view class="popup-item" @click="requestPdfAiTips('firstPage')">
			<view class="popup-item-left">
				<image class="popup-item-icon" mode="widthFix"
					src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/record/pageone.png" />
			</view>
			<view class="popup-item-column">
				<view class="popup-item-flex-row">
					<text class="popup-item-text">首页解读：</text>
				</view>
				<view>
					<text class="popup-item-price-text">限时免费</text>
					<text class="popup-item-price-text"
						style="text-decoration-line: line-through; color: #A0A0A0; ">￥2.9</text>
				</view>
				<text class="popup-item-subtitle">解读PDF文件的第一页，完成后会在「分析结果」中给出。</text>
			</view>
			<view class="popup-item-right">
				<uni-icons class="close-icon" type="right" size="20" color="#A0A0A0" />
			</view>
		</view>
		<view class="popup-divider" />
		<view class="popup-item" @click="requestPdfAiTips('singlePage', page)">
			<view class="popup-item-left">
				<image class="popup-item-icon" mode="widthFix"
					src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/record/singlepage.png" />
			</view>
			<view class="popup-item-column">
				<view class="popup-item-flex-row">
					<text class="popup-item-text">单页解读：</text>
					<text class="popup-item-section-text" style="margin-left: 1px;">第</text>
					<input class="popup-input" @click.stop.prevent v-model="page" type="number"
						cursor-color="#4C5382" />
					<text class="popup-item-section-text">页</text>
					<text class="popup-item-section-text" style="color: #A0A0A0;">（共{{totalPages}}页）</text>
					<button class="popup-action-button" @click.stop="openFile">预览</button>
				</view>
				<view>
					<text class="popup-item-price-text">限时免费</text>
					<text class="popup-item-price-text"
						style="text-decoration-line: line-through; color: #A0A0A0; ">￥2.9</text>
				</view>
				<text class="popup-item-subtitle">指定页码，解读PDF文件的该页，完成后会在「分析结果」中给出。</text>
			</view>
			<view class="popup-item-right">
				<uni-icons class="close-icon" type="right" size="20" color="#A0A0A0" />
			</view>
		</view>
		<view class="popup-divider" /> -->
		<view class="popup-item" @click="requestPdfAiTips('allPages')">
			<view class="popup-item-left">
				<image class="popup-item-icon" mode="widthFix"
					src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/record/allpages.png" />
			</view>
			<view class="popup-item-column">
				<view class="popup-item-flex-row">
					<text class="popup-item-text">全文解读：</text>
					<text class="popup-item-subtitle">共{{totalPages}}页</text>
				</view>
				<view>
					<text class="popup-item-price-text">限时免费</text>
					<text class="popup-item-price-text" v-if="totalPrice"
						style="text-decoration-line: line-through; color: #A0A0A0; ">{{'￥' + totalPrice}}</text>
					<uni-icons v-else class="rotate-animation" type="spinner-cycle" size="20" color="#A0A0A0" />
				</view>
				<text class="popup-item-subtitle">解读PDF文件的所有页面，耗时约1-5秒，完成后会在「分析结果」中给出。</text>
			</view>
			<view class="popup-item-right">
				<uni-icons class="close-icon" type="right" size="20" color="#A0A0A0" />
			</view>
		</view>
		<view class="popup-divider" />
		<view class="popup-item" @click="toInquiry">
			<view class="popup-item-left">
				<image class="popup-item-icon" mode="widthFix"
					src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/record/hospital.png" />
			</view>
			<view class="popup-item-column">
				<view class="popup-item-flex-row">
					<text class="popup-item-text">综合解读：</text>
				</view>
				<view v-if="isFreeTrial">
					<text class="popup-item-price-text">￥0</text>
					<text class="popup-item-price-text" v-if="totalPrice"
						style="text-decoration-line: line-through; color: #A0A0A0; ">￥199</text>
				</view>
				<view v-else>
					<text class="popup-item-price-text">￥99</text>
					<text class="popup-item-price-text"
						style="text-decoration-line: line-through; color: #A0A0A0; ">￥199</text>
				</view>
				<text class="popup-item-subtitle">根据报告初步了解用户身体状况，通过对话的形式与用户沟通，支持补传多份报告，最后对用户的健康做全面解读。</text>
			</view>
			<view class="popup-item-right">
				<uni-icons class="close-icon" type="right" size="20" color="#A0A0A0" />
			</view>
		</view>
	</view>
</template>
<script>
	import popup from '@/uni_modules/uni-popup/components/uni-popup/popup.js';
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store.js';
	import {
		eAdmin
	} from '@/common/js/admin';

	export default {
		name: "popupPDF",
		mixins: [popup],
		emits: ['confirm', 'close', 'closePopup', 'request', 'pay'],
		data() {
			return {
				popupStyle: {},
				page: 1,
				totalPages: 1,
				totalPrice: undefined
			}
		},
		props: {
			index: {
				type: Number,
				default: 0
			},
			record: {
				type: Object
			}
		},
		computed: {
			isFreeTrial() {
				return false && eAdmin();
			},
		},
		mounted() {
			const systemInfo = getApp().globalData.systemInfo;
			const screenWidth = systemInfo.windowWidth; // 注意：这里可能是窗口宽度，如果需要全屏宽度请使用 screenWidth  
			this.popupStyle.width = `${screenWidth}px`;
		},
		created() {
			this.requestPdfPages();
		},
		methods: {
			actionIntercept() {
				// 拦截事件，防止冲突
			},
			close() {
				this.popup.close();
			},
			closePopup() {
				this.$emit('closePopup')
			},
			requestPdfPages: function() {
				uni.request({
					url: 'https://chat.aicareme.cn/api/tencent/getPdfUrl',
					method: 'POST',
					data: {
						url: this.record.fileUrl
					},
					success: (res) => {
						if (res.data.code === 200) {
							this.totalPages = res.data.data;
							this.totalPrice = Math.max(Number(this.totalPages), 2.9);
						}
					}
				});
			},
			requestPdfAiTips: function(type, page = 0) {
				if (type == 'singlePage') {
					// 单页解读
					if (page > this.totalPages || page < 1) {
						uni.showToast({
							title: '请输入正确的页码',
							icon: 'none',
							duration: 2000
						});
					} else {
						const params = {
							num: page
						};
						// if (this.isFreeTrial) {
						this.$emit('request', 'https://chat.aicareme.cn/api/tencent/ocr', params);
						// } else {
						// 	this.$emit('singlePay', params);
						// }
						this.close();
					}
				} else if (type == 'allPages') {
					// 全文解读
					// if (this.isFreeTrial) {
					this.$emit('request', 'https:/chat.aicareme.cn/api/tencent/ocr/batch');
					// } else {
					// 	this.$emit('pay', this.totalPrice);
					// }
					this.close();
				} else {
					// 首页解读
					// if (this.isFreeTrial) {
					this.$emit('request', 'https://chat.aicareme.cn/api/tencent/ocr');
					// } else {
					// 	this.$emit('singlePay');
					// }
					this.close();
				}
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
			toInquiry: function() {
				if (this.isFreeTrial) {
					uni.navigateTo({
						url: `/modules/inquiry/pages/index?index=${this.index}`
					});
				} else {
					this.$emit('pay', 99);
				}
				this.close();
			},
		}
	}
</script>

<style lang="scss">
	.popup-pdf-container {
		display: flex;
		flex-direction: column;
		bottom: 0px;
		padding: 8px 0px 0px;
		background-color: white;
		border-radius: 10px;
		border-bottom-left-radius: 0px;
		border-bottom-right-radius: 0px;
		overflow: hidden;
	}

	.popup-pdf-title {
		display: flex;
		flex-direction: row;
		align-items: center;
		padding: 8px 20px;
	}

	.popup-title-text {
		font-size: 15px;
		font-weight: bold;
		color: #484848;
		text-align: left;
		vertical-align: middle;
	}

	.popup-close-btn {
		display: flex;
		flex-direction: row;
		width: 30px;
		height: 30px;
		align-items: center;
		justify-content: center;
	}

	.popup-close-btn:active {
		opacity: 0.8;
	}

	.close-icon {}

	.close-icon:active {
		opacity: 0.8;
	}

	.popup-item {
		display: flex;
		flex-direction: row;
		padding: 8px 20px;
	}

	.popup-item-left {
		display: flex;
		flex-direction: column;
		width: 36px;
		height: 36px;
		margin-top: 6px;
		margin-right: 10px;
		align-items: center;
		justify-content: center;
	}

	.popup-item-icon {
		width: 36px;
		height: 36px;
		border-radius: 10px;
	}

	.popup-item-column {
		flex: 1;
		display: flex;
		flex-direction: column;
		margin: 5px 0px;
	}

	.popup-item-flex-row {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.popup-item-text {
		font-size: 15px;
		font-weight: bold;
		color: #484848;
	}

	.popup-action-button {
		height: 20px;
		min-width: 45px;
		line-height: 20px;
		background-color: #4C5382;
		color: white;
		border-radius: 20px;
		font-size: 9px;
		margin-left: 5px;
		text-align: center;
		vertical-align: middle;
	}

	.popup-action-button:active {
		opacity: 0.8;
	}

	.popup-item-section {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.popup-item-price-text {
		font-size: 13px;
		color: #4C5382;
		font-weight: bold;
		padding: 3px 3px;
	}

	.popup-item-section-text {
		font-size: 10px;
		font-weight: bold;
		color: #4C5382;
		padding: 3px 0px;
	}

	.popup-input {
		flex: 1;
		max-width: 21px;
		height: 15px;
		font-weight: bold;
		font-size: 11px;
		text-align: center;
		margin: 0px 3px;
		color: #4C5382;
		background-color: #F0F0F0;
		border-radius: 3px;
	}

	.popup-item-subtitle {
		font-size: 10px;
		color: #A0A0A0;
		padding: 3px 0px;
	}

	.popup-item-right {
		width: 36px;
		display: flex;
		flex-direction: column;
		padding-right: 4px;
		margin-left: 10px;
		align-items: flex-end;
		justify-content: center;
	}

	.popup-title-divider {
		height: 1px;
		margin: 0px 20px;
		border-top: lightgray 1px solid;
	}

	.popup-divider {
		height: 1px;
		margin: 0px 20px;
		border-top: lightgray 1px dashed;
	}
</style>