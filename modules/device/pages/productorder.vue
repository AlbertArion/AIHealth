<template>
	<view class="order-list">
		<view v-if="showInput">
			<textarea class="info-area-text" v-model="inputText" maxlength="-1" cursor-color="#4C5382"
				placeholder-class="info-area-text-placeholder" placeholder="请在这里粘贴复制的内容：" />
		</view>
		<view style="display: flex; flex-direction: row; margin: 0px 20px;">
			<button class="item-action-button" style="margin-left: 0px;" @click="copyToJson">复制发货</button>
			<view style="flex: 1;" />
			<button class="item-action-button" @click="inputChanged">{{inputBtn}}</button>
			<view v-if="isSuperAdmin" class="filter-trigger">
				<text :class="`${showPurchased ? 'trigger-item-selected-left' : 'trigger-item-left'}`"
					@click="filterChanged">未收货</text>
				<text :class="`${showPurchased ? 'trigger-item-right' : 'trigger-item-selected-right'}`"
					@click="filterChanged">全部</text>
			</view>
		</view>
		<order-item v-if="showPurchased && hasPurchased" v-for="(order, index) in purchased" from="orderAdmin"
			v-bind:order="order" :id="index" :key="index" @refund="refund" />
		<order-item v-else-if="!showPurchased && hasOrder" v-for="(order, index) in orders" from="orderAdmin"
			v-bind:order="order" :id="index" :key="index" @refund="refund" />
		<view v-else class="order-empty">暂无订单</view>
		<uni-pay ref="pay"
			logo="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/static/xinmai_logo_288.png" />
	</view>
</template>

<script>
	import {
		oAdmin,
		sAdmin
	} from '@/common/js/admin';
	import orderItem from './orderitem.vue';
	const db = uniCloud.database();
	export default {
		data() {
			return {
				orders: [],
				purchased: [],
				inputText: '',
				showInput: false,
				showPurchased: true
			}
		},
		components: {
			orderItem,
		},
		computed: {
			isSuperAdmin() {
				return sAdmin();
			},
			isOperator() {
				return oAdmin();
			},
			inputBtn() {
				return this.showInput ? (this.inputText?.length > 0 ? '提交' : '收起') : '输入';
			},
			hasOrder() {
				return this.orders?.length > 0;
			},
			hasPurchased() {
				return this.purchased?.length > 0;
			}
		},
		onLoad() {
			db.collection('health-product-order')
				.orderBy("createDate", "desc")
				.get()
				.then(res => {
					if (res.result?.data?.length > 0) {
						this.orders = res.result.data;
						this.purchased = [];
						this.orders.forEach((order) => {
							if (order.state <= 0 || order.freightId?.length > 0) {
								// 未支付或者已发货
							} else {
								order.freightId = "";
								this.purchased.push(order);
							}
						});
						this.showPurchased = this.isOperator || this.hasPurchased;
					}
				}).catch((err) => {
					console.log("ProductOrder, 获取产品订单失败, err = ", err);
				}).finally(() => {});
		},
		methods: {
			filterChanged: function() {
				this.showPurchased = !this.showPurchased;
			},
			updateOrder: function(orderList) {
				for (let i = 0; i < orderList.length; i++) {
					const item = orderList[i];
					db.collection('health-product-order').where({
						orderId: item.orderId
					}).update({
						freightId: item.freightId
					}).then(res => {
						console.log("ProductOrder, 产品订单快递更新成功 order = " + item.orderId +
							", freightId = " + item.freightId);
					}).catch((err) => {
						console.log("ProductOrder, 产品订单快递更新失败: ", err);
					}).finally(() => {
						if (i == orderList.length - 1) {
							uni.hideLoading();
							uni.showToast({
								icon: 'none',
								title: '更新成功',
								duration: 2000
							});
						}
					});
				}
			},
			parseInput: function() {
				const res = {
					dataList: undefined,
					errCode: 0,
					errMsg: ''
				};
				try {
					res.dataList = JSON.parse(this.inputText);
					if (res.dataList?.length > 0) {
						for (let i = 0; i < res.dataList.length; i++) {
							const item = res.dataList[i];
							const order = this.purchased[i];
							if (item.freightId?.length > 0 && item.orderId == order.orderId) {
								order.freightId = item.freightId;
								console.log("ProductOrder, 更新物流：", order);
							}
						}
					}
				} catch (e) {
					console.log("ProductOrder, parseInput err: " + e.message);
					res.errMsg = e.message;
					res.errCode = -1;
				}
				return res;
			},
			inputChanged: async function() {
				console.log("ProductOrder, inputChanged: ", this.inputText);
				if (this.showInput && this.inputText?.length > 0) {
					uni.showLoading({
						title: '解析中...',
						mask: true
					});
					const res = await this.parseInput();
					console.log("ProductOrder, parseInput: ", res);
					if (res.errCode == 0 && res.dataList?.length > 0) {
						this.showInput = false;
						this.updateOrder(res.dataList);
					} else {
						uni.hideLoading();
						uni.showToast({
							icon: 'none',
							title: '解析失败，输入的格式不是订单列表的JSON',
							duration: 2000
						});
					}
				} else {
					this.showInput = !this.showInput;
				}
			},
			refund: function(tradeNo, desc, onSuccess, onFail) {
				return this.$refs.pay.refund({
					out_trade_no: tradeNo, // 插件支付单号
					refund_desc: desc, // 退款描述
					success: (res) => {
						console.log('ProductOrder, 退款成功', res);
						onSuccess && onSuccess(res);
					},
					fail: (err) => {
						console.log('ProductOrder, 退款失败', err);
						onFail && onFail(err);
					}
				});
			},
			copyToJson: function() {
				if (this.hasPurchased) {
					const content = JSON.stringify(this.purchased);
					uni.setClipboardData({
						data: content
					});
				} else {
					uni.showToast({
						icon: 'none',
						title: '未收货的订单为空',
						duration: 2000
					});
				}
			}
		}
	}
</script>

<style>
	.order-list {
		display: flex;
		flex-direction: column;
		padding-bottom: 15px;
	}

	.order-empty {
		flex: 1;
		text-align: center;
		margin-top: 50px;
		font-size: 14px;
		color: dimgray;
		font-weight: normal;
	}

	.info-area-text {
		width: auto;
		min-height: 270rpx;
		font-size: 13px;
		color: #4A4A4A;
		padding: 12px 15px;
		margin: 10px 20px 6px;
		line-height: 20px;
		background-color: white;
		border-radius: 10px;
	}

	.info-area-text-placeholder {
		color: darkgray;
	}

	.filter-trigger {
		display: flex;
		flex-direction: row;
		align-items: center;
		font-size: 11px;
		margin: 0px 6px 0px 20px;
	}

	.trigger-item-left {
		line-height: 29px;
		padding: 0px 15px 0px 18px;
		color: dimgray;
		text-align: center;
		background-color: white;
		border-top-left-radius: 18px;
		border-bottom-left-radius: 18px;
		border-left: 1px solid #A0A0A0;
		border-top: 1px solid #A0A0A0;
		border-bottom: 1px solid #A0A0A0;
	}

	.trigger-item-selected-left {
		line-height: 29px;
		padding: 0px 15px 0px 18px;
		color: white;
		text-align: center;
		background-color: #4C5382;
		border-top-left-radius: 18px;
		border-bottom-left-radius: 18px;
		border-left: 1px solid #4C5382;
		border-top: 1px solid #4C5382;
		border-bottom: 1px solid #4C5382;
	}

	.trigger-item-right {
		line-height: 29px;
		padding: 0px 18px 0px 15px;
		color: #A0A0A0;
		text-align: center;
		background-color: white;
		border-top-right-radius: 18px;
		border-bottom-right-radius: 18px;
		border-right: 1px solid #A0A0A0;
		border-top: 1px solid #A0A0A0;
		border-bottom: 1px solid #A0A0A0;
	}

	.trigger-item-selected-right {
		line-height: 29px;
		padding: 0px 18px 0px 15px;
		color: white;
		text-align: center;
		background-color: #4C5382;
		border-top-right-radius: 18px;
		border-bottom-right-radius: 18px;
		border-right: 1px solid #4C5382;
		border-top: 1px solid #4C5382;
		border-bottom: 1px solid #4C5382;
	}

	.item-action-button {
		background-color: #4C5382;
		color: white;
		line-height: 30px;
		border-radius: 20px;
		font-size: 12px;
		padding: 0px 20px;
		margin: 10px 0px 10px 10px;
	}

	.item-action-button:active {
		opacity: 0.8;
	}
</style>