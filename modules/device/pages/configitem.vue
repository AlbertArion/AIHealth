<template>
	<view class="item-row">
		<view class="item-unit shadow" :class="`${isCurrentLeft ? 'item-border' : ''}`" @click="clickLeft"
			@longpress="edit(productLeft)">
			<view class="image-row">
				<view style="flex: 1;">
					<image class="product-image" mode="widthFix" :src="imageSrcLeft" />
				</view>
				<view class="router-container">
					<image v-if="connectedLeft == 1" class="router-icon-on" mode="heightFix"
						src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/device/router_white.png" />
					<image v-else-if="connectedLeft == 0" class="router-icon breathing-animation" mode="heightFix"
						src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/device/router.png" />
					<image v-else class="router-icon" mode="heightFix"
						src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/device/router.png" />
					<text class="router-state">{{connectionStateLeft}}</text>
				</view>
			</view>
			<text class="item-name">{{productNameLeft}}</text>
			<text class="item-desc">{{productDescLeft}}</text>
		</view>
		<view v-if="hasRight" class="item-unit shadow" :class="`${isCurrentRight ? 'item-border' : ''}`"
			style="margin-left: 20px;" @click="clickRight" @longpress="edit(productRight)">
			<view class="image-row">
				<view style="flex: 1;">
					<image class="product-image" mode="widthFix" :src="imageSrcRight" />
				</view>
				<view class="router-container">
					<image v-if="connectedRight == 1" class="router-icon-on" mode="heightFix"
						src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/device/router_white.png" />
					<image v-else-if="connectedRight == 0" class="router-icon breathing-animation" mode="heightFix"
						src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/device/router.png" />
					<image v-else class="router-icon" mode="heightFix"
						src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/device/router.png" />
					<text class="router-state">{{connectionStateRight}}</text>
				</view>
			</view>
			<text class="item-name">{{productNameRight}}</text>
			<text class="item-desc">{{productDescRight}}</text>
		</view>
		<view v-else class="item-unit" style="margin-left: 20px; visibility: hidden;"></view>
	</view>
</template>

<script>
	import {
		getServiceDuration
	} from '@/common/js/productorder';
	import {
		imageMap,
		updateUserInfo
	} from '@/common/js/device';
	import {
		getNowTime
	} from '@/common/utils/timestamp';
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store';

	export default {
		data() {
			return {
				currentIndex: this.current,
				productLeft: this.products[0],
				productRight: this.products.length > 1 ? this.products[1] : undefined
			}
		},
		props: {
			id: {
				type: Number
			},
			products: {
				type: Object
			},
			current: {
				type: Number
			}
		},
		computed: {
			hasRight() {
				return this.products.length > 1;
			},
			isCurrentLeft() {
				return this.id * 2 == this.currentIndex;
			},
			isCurrentRight() {
				return this.id * 2 + 1 == this.currentIndex;
			},
			hasNicknameLeft() {
				return this.productLeft.nickname?.length > 0;
			},
			hasNicknameRight() {
				return this.productRight?.nickname?.length > 0;
			},
			productNameLeft() {
				return this.hasNicknameLeft ? this.productLeft.nickname : this.productLeft.name;
			},
			productNameRight() {
				return this.hasNicknameRight ? this.productRight?.nickname : this.productRight?.name;
			},
			productDescLeft() {
				return 'ES 6 | 智能健康管理 ' + getServiceDuration(this.productLeft.price);
			},
			productDescRight() {
				if (this.productRight) {
					return 'ES 6 | 智能健康管理 ' + getServiceDuration(this.productRight.price);
				} else {
					return '';
				}
			},
			imageSrcLeft() {
				return imageMap[this.productLeft.type];
			},
			imageSrcRight() {
				return imageMap[this.productRight?.type];
			},
			connectedLeft() {
				return this.productLeft.wifi?.connected;
			},
			connectedRight() {
				return this.productRight?.wifi?.connected;
			},
			connectionStateLeft() {
				return this.connectedLeft == 1 ? '已连接' : (this.connectedLeft == 0 ? '连接中...' : '未连接');
			},
			connectionStateRight() {
				return this.connectedRight == 1 ? '已连接' : (this.connectedRight == 0 ? '连接中...' : '未连接');
			}
		},
		methods: {
			clickLeft: function() {
				const ci = this.id * 2;
				if (this.isCurrentLeft) {
					this.currentIndex = -1;
				} else {
					this.currentIndex = ci;
				}
				this.$emit('itemClick', ci);
			},
			clickRight: function() {
				const ci = this.id * 2 + 1;
				if (this.isCurrentRight) {
					this.currentIndex = -1;
				} else {
					this.currentIndex = ci;
				}
				this.$emit('itemClick', ci);
			},
			edit: function(product) {
				const that = this;
				uni.showModal({
					title: `请输入设备名称：`,
					content: product.nickname || '',
					confirmColor: '#4C5382',
					confirmText: "确定",
					showCancel: true,
					cancelText: "取消",
					cancelColor: '#808080',
					editable: true,
					placeholderText: '如：我|妈妈的睡眠带',
					success(res) {
						if (!res.confirm) {
							// 取消弹窗
							return;
						}
						if (res.content?.trim()?.length > 0) {
							product.nickname = res.content;
							const data = {
								products: store.userInfo.products
							};
							// 更新我绑定的产品信息
							updateUserInfo(store.userInfo._id, data);
						} else {
							uni.showToast({
								icon: 'none',
								title: '设备名称不能为空',
								duration: 2000
							});
						}
					}
				});
			}
		}
	}
</script>

<style>
	.item-row {
		display: flex;
		flex-direction: row;
		align-items: center;
		padding: 10px 0px;
	}

	.item-unit {
		flex: 1;
		display: flex;
		flex-direction: column;
		background-color: white;
		border-radius: 20px;
		padding: 20px 20px;
	}

	.item-border {
		background-color: rgba(76, 83, 130, 0.1);
	}

	.image-row {
		display: flex;
		flex-direction: row;
		margin-bottom: 15px;
	}

	.image-container {
		display: flex;
		flex-direction: column;
	}

	.product-image {
		width: 40px;
		height: 40px;
		border-radius: 6px;
		overflow: hidden;
	}

	@keyframes breathing {
		0% {
			background-color: lightgray;
		}

		50% {
			background-color: #4C5382;
		}

		100% {
			background-color: lightgray;
		}
	}

	.breathing-animation {
		animation: breathing 2s linear infinite;
		/* 设置动画持续时间为2秒，线性变化无限次 */
	}

	.router-container {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.router-icon {
		width: 17px;
		height: 17px;
		padding: 5px;
		border-radius: 50%;
		overflow: hidden;
		background-color: lightgray;
	}

	.router-icon-on {
		width: 17px;
		height: 17px;
		padding: 5px;
		border-radius: 50%;
		overflow: hidden;
		background-color: #4C5382;
	}

	.router-state {
		font-size: 9px;
		color: #808080;
		margin-top: 3px;
	}

	.item-name {
		font-size: 13px;
		color: #606060;
		font-weight: bold;
	}

	.item-desc {
		font-size: 10px;
		color: #808080;
		margin-top: 2px;
	}
</style>