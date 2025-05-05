<template>
	<view class="item-container">
		<view class="item-row" style="margin: 10px 15px;">
			<image class="item-device-icon" mode="widthFix"
				src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/device/icon_health_p.png" />
			<text class="item-product-name">{{productName}}</text>
			<text class="item-product-time">{{createTime}}</text>
			<text class="item-product-state">{{state}}</text>
		</view>
		<view class="item-row">
			<view class="product-image-container">
				<image class="product-image" mode="widthFix" :src="productImage" />
			</view>
			<view class="item-product-info">
				<text class="item-product-desc" style="margin-bottom: 5px;">{{productDesc}}</text>
				<text v-if="isProduct" class="item-product-desc" style="margin-left: 3px; font-size: 12px;">
					{{order.amount}} 件</text>
				<view v-else v-for="(desc,di) in ['AI健康监测', '专家健康管理']" :key="`service-desc-${di}`"
					class="service-desc-text">
					<uni-icons type="checkmarkempty" size="13" color="#4C5382" style="margin: 1px 5px 0px" />
					<text>{{desc}}</text>
				</view>
			</view>
			<text class="item-product-price">￥{{order.price * order.amount}}</text>
		</view>
		<view v-if="isProduct" class="product-address">
			<view class="item-text-row">
				<text class="item-label" style="width: 51px;">收件人</text>
				<text class="item-label" style="width: 18px;">：</text>
				<text class="item-text">{{order.address.username}}</text>
			</view>
			<view class="item-text-row">
				<text class="item-label" style="width: 51px;">联系电话</text>
				<text class="item-label" style="width: 18px;">：</text>
				<text class="item-text">{{order.address.telNumber}}</text>
			</view>
			<view class="item-text-row">
				<text class="item-label" style="width: 51px;">收件地址</text>
				<text class="item-label" style="width: 18px;">：</text>
				<text class="item-text">{{addressText}}</text>
			</view>
		</view>
		<view v-if="(fromAdmin && order.state > 0) || (!fromAdmin && (isPurchased || isFinished))"
			class="item-text-row item-common-style" @longpress="copyContent(order.freightId)">
			<text class="item-freight-text" style="white-space: nowrap; text-overflow: ellipsis;">{{freightDesc}}</text>
			<text class="item-freight-text item-freight-id">{{isFreighted ? order.freightId : freightTime}}</text>
		</view>
		<view class="item-row" style="margin-top: 10px; margin-right: 10px;">
			<view class="item-service-chat" @click="toService">
				<uni-icons class="item-title-icon" type="headphones" size="15" color="#A0A0A0" />
				<text class="item-action-service">客服</text>
			</view>
			<view v-if="fromAdmin" class="item-action-group">
				<button v-if="isPurchased" class="item-action-button" @click="inputFreight">更新物流</button>
				<button v-if="isRefunding" class="item-action-button" @click="refundReject">驳回</button>
				<button v-if="isRefunding" class="item-action-button" @click="adminRefund">确认退款</button>
				<image class="router-icon-on" mode="heightFix" @click="copyAddress"
					src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/device/copy.png" />
			</view>
			<view v-else class="item-action-group">
				<button v-if="isPreorder || (isPurchased && !isFreighted)" class="item-action-button"
					@click="refund">申请退款</button>
				<!-- <button v-if="isPrivileged && isPurchased && isFreighted" class="item-action-button"
					@click="exchange">申请退货</button> -->
				<button v-if="isPreorder" class="item-action-button" @click="purchase">交付尾款</button>
				<!-- <button v-if="isPurchased" class="item-action-button" @click="freight">查看物流</button> -->
				<button v-if="isRefunding" class="item-action-button" @click="refundCancel">取消退款</button>
				<button v-if="isRefunded" class="item-action-button-disable">退款成功</button>
				<button v-if="isFinished" class="item-action-button-disable">订单完成</button>
				<button v-if="id == 0 && !isPreorder" class="item-action-button" @click="another">再来一单</button>
			</view>
		</view>
		<uni-popup ref="popupProduct" mask-background-color="rgba(0, 0, 0, 0.7)" type="bottom"
			@maskClick="closePopupProduct">
			<popup-product mode="base" @closePopup="closePopupProduct" />
		</uni-popup>
	</view>
</template>

<script>
	import {
		descMap,
		imageMap,
		payForProduct,
		productMap,
		stateMap,
		updateUserInfo
	} from '@/common/js/device';
	import {
		getDateFrom,
		getFreightTime
	} from '@/common/utils/timestamp';
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store';
	import popupProduct from '@/components/popup/popup-product.vue';
	import {
		PRODUCT_TYPE_SLEEP_BELT,
		SERVICE_TYPE_CARDIO_CARE,
		getServiceDuration,
		getServiceType,
		getServiceVersion,
		toCustomService,
		updateProductOrder
	} from '@/common/js/productorder';
	import {
		cloudNotify
	} from '@/common/js/record';
	import {
		privileged
	} from '@/common/js/admin';

	const db = uniCloud.database();
	export default {
		data() {
			return {

			}
		},
		components: {
			popupProduct
		},
		props: {
			id: {
				type: Number
			},
			from: {
				type: String // orderAdmin, orderUser
			},
			order: {
				type: Object
			}
		},
		computed: {
			isProduct: function() {
				return this.order.type == PRODUCT_TYPE_SLEEP_BELT;
			},
			isPrivileged: function() {
				return privileged();
			},
			isRefunded: function() {
				return this.order.state == -1;
			},
			isPreorder: function() {
				return this.order.state == 0;
			},
			isPurchased: function() {
				return this.order.state == 1;
			},
			isFreighted: function() {
				return this.order.freightId?.length > 0;
			},
			freightDesc: function() {
				let desc = '京东快递';
				if (this.isFinished) {
					desc += '（已收货）：';
				} else if (this.isFreighted) {
					desc += '（长按复制单号）：';
				} else {
					desc += '：';
				}
				return desc;
			},
			freightTime: function() {
				return `预计${getFreightTime(this.order.timestamp)}发货`;
			},
			isRefunding: function() {
				return this.order.state == 2;
			},
			isFinished: function() {
				return this.order.state == 3;
			},
			productName() {
				return productMap[this.order.type] + (this.isProduct ? '' : ` ${getServiceVersion(this.order.price)}`);
			},
			createTime() {
				return getDateFrom(this.order.createDate);
			},
			productImage() {
				return imageMap[this.order.type];
			},
			state() {
				return stateMap[String(this.order.state)];
			},
			fromAdmin() {
				return this.from === "orderAdmin";
			},
			addressText: function() {
				const address = this.order.address;
				return `${address.provinceName}${address.cityname}${address.countyName}${address.detailInfo}`;
			},
			productDesc: function() {
				return this.isProduct ? descMap[this.order.type] + ` ${getServiceDuration(this.order.price)}` :
					descMap[this.order.type];
			}
		},
		methods: {
			showPopupProduct: function() {
				this.$refs.popupProduct.open();
			},
			closePopupProduct: function() {
				this.$refs.popupProduct.close();
			},
			previewImage: function() {
				uni.previewImage({
					urls: [this.productImage]
				});
			},
			copyJson: function(content) {
				uni.setClipboardData({
					data: JSON.stringify(content),
				});
			},
			copyAddress: function() {
				const username = '收件人：' + this.order.address.username;
				const telNumber = '联系电话：' + this.order.address.telNumber;
				const address = '收件地址：' + this.addressText;
				uni.setClipboardData({
					data: `${username}\n${telNumber}\n${address}`,
				});
			},
			copyContent: function(content) {
				if (content?.length > 0) {
					uni.setClipboardData({
						data: content
					});
				}
			},
			purchase: function() {
				const that = this;
				uni.showModal({
					title: '购前须知：',
					content: `分享到朋友圈邀请好友注册，可获得积分优惠；每成功邀请一位获得 20 积分（抵扣 2 元)。`,
					confirmColor: '#4C5382',
					confirmText: "确定购买",
					showCancel: true,
					cancelText: "知道了",
					cancelColor: '#808080',
					success(res) {
						if (res.confirm) {
							if (!that.order.amount) {
								that.order.amount = 1;
							}
							const totalPrice = that.order.price * that.order.amount;
							const fee = that.isPreorder ? totalPrice - 100 : totalPrice;
							const desc =
								`${that.productName}${that.order.amount}件：${that.isPreorder ? '尾款' : '购买'}`;
							payForProduct(that.order.price, that.order.amount, fee, desc, 1,
								that.order.type, that.order._id);
						}
					}
				});
			},
			refund: function() {
				console.log("OrderItem, 申请退款: ", this.order);
				const that = this;
				uni.showModal({
					content: `确定要退款吗？`,
					confirmColor: '#4C5382',
					confirmText: "确定",
					showCancel: true,
					cancelText: "取消",
					cancelColor: '#808080',
					success(res) {
						if (res.confirm) {
							that.order.state = 2;
							updateProductOrder({
								_id: that.order._id
							}, {
								state: 2
							}, (res) => {
								that.updateMyProducts();
							});
						}
					}
				});
			},
			refundCancel: function() {
				const totalFee = this.order.price * this.order.amount;
				this.order.state = (this.order.fee < totalFee) ? 0 : 1;
				updateProductOrder({
					_id: this.order._id
				}, {
					state: this.order.state
				}, (res) => {
					this.updateMyProducts();
				});
			},
			inputFreight: function() {
				const that = this;
				uni.showModal({
					title: `京东物流信息同步`,
					confirmColor: '#4C5382',
					confirmText: "确定",
					showCancel: true,
					cancelText: "取消",
					cancelColor: '#808080',
					editable: true,
					placeholderText: '请输入快递编号',
					success(res) {
						if (!res.confirm) {
							// 取消弹窗
							return;
						}
						if (res.content?.trim()?.length > 0) {
							that.order.freightId = res.content;
							// 更新产品订单信息
							updateProductOrder({
								_id: that.order._id
							}, {
								freightId: that.order.freightId
							}, (res) => {
								cloudNotify(that.order.uid, "orderFreight", {
									freightId: that.order.freightId
								});
								uni.showToast({
									icon: 'none',
									title: '更新成功',
									duration: 1000
								});
							});
						} else {
							uni.showToast({
								icon: 'none',
								title: '快递编号不能为空',
								duration: 2000
							});
						}
					}
				});
			},
			adminRefund: function() {
				const that = this;
				uni.showModal({
					content: `确认要给用户退款吗？`,
					confirmColor: '#4C5382',
					confirmText: "确定",
					showCancel: true,
					cancelText: "取消",
					cancelColor: '#808080',
					success(res) {
						if (res.confirm) {
							that.refundConfirm();
						}
					}
				});
			},
			refundReject: function() {
				const that = this;
				uni.showModal({
					content: `确认要驳回退款吗？`,
					confirmColor: '#4C5382',
					confirmText: "确定",
					showCancel: true,
					cancelText: "取消",
					cancelColor: '#808080',
					success(res) {
						if (!res.confirm) {
							return;
						}
						const totalFee = that.order.price * that.order.amount;
						that.order.state = (that.order.fee < totalFee) ? 0 : 1;
						// 更新产品订单信息
						updateProductOrder({
							_id: that.order._id
						}, {
							state: that.order.state
						}, (res) => {
							if (that.order.uid == store.userInfo._id) {
								that.updateMyProducts();
							} else {
								that.updateOthersProducts(that.order.uid);
							}
						});
					}
				});
			},
			refundConfirm: function() {
				let out_trade_desc = '';
				if (this.order.finalOrderId?.length > 0) {
					const final_order_no = this.order.finalOrderId;
					const final_out_trade_no = `${final_order_no}`;
					const final_out_trade_desc = `${this.productName}${this.order.amount}件：尾款(退款)`;
					out_trade_desc = `${this.productName}${this.order.amount}件：购买(退款)`;
					this.$emit('refund', final_out_trade_no, final_out_trade_desc, (res) => {
						console.log("OrderItem, " + final_out_trade_desc + " success: ", res);
					}, (err) => {
						console.log("OrderItem, " + final_out_trade_desc + " fail: ", err);
					});
				} else {
					out_trade_desc = `${this.productName}${this.order.amount}件：预订(退款)`;
				}
				const order_no = this.order.orderId;
				const out_trade_no = `${order_no}`;
				this.$emit('refund', out_trade_no, out_trade_desc, (res) => {
					console.log("OrderItem, " + out_trade_desc + " success: ", res);
					this.order.state = -1;
					const query = {
						_id: this.order._id
					};
					const data = {
						fee: 0,
						state: -1 // 已退款状态
					};
					const hasDiscount = (this.order.scoreCost && this.order.scoreCost > 0);
					if (hasDiscount) {
						data.scoreCost = 0;
					}
					// 更新产品订单信息
					updateProductOrder(query, data, (res) => {
						if (hasDiscount) {
							this.refundScore(this.order.uid, this.order.scoreCost);
						}
						if (this.order.uid == store.userInfo._id) {
							this.updateMyProducts();
						} else {
							this.updateOthersProducts(this.order.uid);
						}
					});
					// 更新支付订单信息
					db.collection('health-record-pay-info').where({
						orderId: this.order.orderId
					}).update({
						status: 0
					});
				}, (err) => {
					console.log("OrderItem, " + out_trade_desc + " fail: ", err);
				});
			},
			refundScore: function(uid, scoreCost) {
				if (uid == store.userInfo._id) {
					store.userInfo.score += scoreCost;
					this.updateScore(uid, store.userInfo.score, scoreCost);
				} else {
					// 更新用户积分信息
					db.collection('uni-id-users').doc(uid).field('score').get().then((res) => {
						const score = res.result.data[0].score + scoreCost;
						this.updateScore(uid, score, scoreCost);
					});
				}
			},
			updateScore(uid, score, scoreCost) {
				// 更新用户积分信息
				db.collection('uni-id-users').doc(uid).update({
					score: score
				}).then((res) => {
					console.log("OrderItem, 积分退还成功：" + scoreCost);
				});
				// 更新积分变化记录
				db.collection('uni-id-scores').add({
					user_id: uid,
					balance: score,
					score: scoreCost,
					type: 1,
					comment: `积分抵扣智能产品购买(退款)POID:' ${this.poid}`,
				});
			},
			// 监听事件 - 支付订单创建成功（此时用户还未支付）
			onCreate(res) {
				console.log('OrderItem, pay onCreate: ', res);
				// 如果只是想生成支付二维码，不需要组件自带的弹窗，则在这里可以获取到支付二维码 qr_code_image
			},
			updateOthersProducts: function(uid) {
				console.log("OrderItem, 刷新用户的产品列表");
				// 更新用户设备信息
				db.collection('uni-id-users').where({
					_id: uid
				}).field('products').get().then((res) => {
					const products = res.result.data[0].products;
					let targetIndex = -1;
					for (let i = 0; i < products.length; i++) {
						const product = products[i];
						if (product.poid == this.order._id) {
							targetIndex = i;
							product.state = this.order.state;
							break;
						}
					}
					if (targetIndex > -1) {
						if (this.isRefunded) {
							// 退款成功，删除产品信息
							products.splice(targetIndex, 1);
						}
						// 更新用户产品信息
						updateUserInfo(uid, {
							products: products
						}, res => {
							if (this.isRefunded) {
								uni.showToast({
									icon: 'none',
									title: '退款成功',
									duration: 600
								});
							}
						});
					}
				});
			},
			productUpdated: function(product = undefined) {
				if (this.isRefunded) {
					uni.showToast({
						icon: 'none',
						title: '退款成功',
						duration: 1000
					});
				}
				uni.$emit('productUpdate', product);
			},
			updateMyProducts: function() {
				console.log("OrderItem, 刷新我的产品列表");
				const products = store.userInfo.products;
				if (products?.length > 0) {
					let targetIndex = -1;
					for (let i = 0; i < products.length; i++) {
						const product = products[i];
						if (product.poid == this.order._id) {
							targetIndex = i;
							product.state = this.order.state;
							store.currentProductState = product.state;
							break;
						}
					}
					if (targetIndex > -1) {
						const product = products[targetIndex];
						if (this.isRefunded) {
							// 退款成功，删除产品信息
							products.splice(targetIndex, 1);
							store.refreshUser();
						}
						// 更新用户产品信息
						updateUserInfo(store.userInfo._id, {
							products: products
						}, res => {
							this.productUpdated(product);
						});
					}
				} else {
					this.productUpdated();
				}
			},
			freight: function() {
				uni.showToast({
					icon: 'none',
					title: '京东物流同步功能即将开放，敬请期待...',
					duration: 2000
				});
			},
			another: function() {
				this.showPopupProduct();
			},
			toService: function() {
				toCustomService();
			}
		}
	}
</script>

<style>
	page {
		background-color: #f6f6f6;
	}

	.item-container {
		display: flex;
		flex-direction: column;
		background-color: white;
		margin: 15px 20px 0px;
		border-radius: 10px;
		border: 1px solid #EFEFF4;
	}

	.item-row {
		display: flex;
		flex-direction: row;
		align-items: center;
		margin: 0px 15px;
	}

	.item-title-icon {
		margin-right: 6px;
	}

	.item-device-icon {
		width: 18px;
		margin-right: 6px;
	}

	.item-product-name {
		font-size: 14px;
		color: #4C5382;
		line-height: 24px;
		font-weight: bold;
	}

	.item-product-time {
		flex: 1;
		font-size: 11px;
		color: #A0A0A0;
		line-height: 24px;
		margin-left: 10px;
	}

	.item-product-state {
		font-size: 11px;
		color: #A0A0A0;
		line-height: 24px;
		margin-left: 10px;
	}

	.product-image-container {
		display: flex;
		flex-direction: column;
	}

	.product-image {
		width: 60px;
		height: 60px;
		border-radius: 10px;
		overflow: hidden;
	}

	.service-image {
		width: 24px;
		height: 24px;
		border-radius: 6px;
		overflow: hidden;
	}

	.item-product-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		margin: 0px 10px;
	}

	.item-product-desc {
		font-size: 13px;
		color: #A0A0A0;
		line-height: 22px;
	}

	.item-product-price {
		font-size: 14px;
		color: #A0A0A0;
		line-height: 24px;
	}

	.product-address {
		display: flex;
		flex-direction: column;
		margin: 20px 15px 10px;
	}

	.item-text-row {
		display: flex;
		flex-direction: row;
	}

	.item-label {
		font-size: 12px;
		color: #A0A0A0;
		line-height: 24px;
		vertical-align: middle;
	}

	.item-text {
		flex: 1;
		font-size: 12px;
		color: #A0A0A0;
		line-height: 24px;
		vertical-align: middle;
		white-space: pre-wrap;
	}

	.item-common-style {
		margin: 6px 10px 0px;
		padding: 10px 6px 0px 6px;
		align-items: center;
	}

	.item-action-group {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.item-freight-id {
		flex: 1;
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.item-freight-text {
		font-size: 12px;
		color: #A0A0A0;
		line-height: 24px;
	}

	.item-freight-id {
		margin-left: 3px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.item-service-chat {
		flex: 1;
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.item-action-service {
		color: #A0A0A0;
		font-size: 12px;
	}

	.item-action-button-disable {
		background-color: #4C5382;
		color: white;
		line-height: 30px;
		border-radius: 20px;
		font-size: 12px;
		padding: 0px 20px;
		margin: 10px 0px 10px 10px;
		opacity: 0.8;
	}

	.router-icon-on {
		width: 15px;
		height: 15px;
		padding: 8px;
		margin: 10px 0px 10px 10px;
		border-radius: 50%;
		overflow: hidden;
		background-color: #4C5382;
	}

	.router-icon-on:active {
		opacity: 0.8;
	}

	.service-desc-text {
		display: flex;
		flex-direction: row;
		font-size: 12px;
		color: #A0A0A0;
		line-height: 24px;
	}
</style>