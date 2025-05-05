<template>
	<view class="ecenter-container">
		<view class="ecenter-main">
			<image class="ecenter-logo" mode="widthFix" :src="clogo" />
			<view class="ecenter-main-info">
				<text class="ecenter-main-title">{{cname}}</text>
				<view class="ecenter-info-row">
					<image class="xinmai-logo" mode="heightFix"
						src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/static/chat/chat_nav_logo.png" />
					<text class="ecenter-main-subtitle"> 已陪伴您 {{duration}} 天</text>
				</view>
			</view>
		</view>
		<view class="ecenter-info">
			<text class="ecenter-info-label">企业账户</text>
			<view class="ecenter-divider" />
			<view class="ecenter-info-row">
				<text class="ecenter-balance">账户余额(元)：</text>
				<text class="ecenter-balance-num">{{balance}}</text>
			</view>
			<view class="ecenter-info-row">
				<text class="ecenter-balance">当月预估应付(元)：</text>
				<text class="ecenter-balance-num">0.00</text>
			</view>
		</view>
		<view class="ecenter-info">
			<text class="ecenter-info-label">企业账单</text>
			<view class="ecenter-divider" />
			<view class="order-list-empty" v-if="orderList.length == 0">暂无消费记录</view>
			<order-item v-for="(item, index) in orderList" :key="index" :item="item" />
			<view class="ecenter-footer">
				<text class="ecenter-footer-text">由心脉AI提供</text>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store';
	import orderItem from './orderitem.vue';
	export default {
		data() {
			return {
				cid: '',
				cname: '心脉AI - 合作企业',
				clogo: '',
				duration: '_',
				balance: '0.00',
				orderList: []
			}
		},
		components: {
			orderItem
		},
		onLoad() {
			this.fetchData();
		},
		methods: {
			fetchOrder: function() {
				uni.request({
					url: "https://openapi.aicareme.cn/wechat/company/order/pdf",
					method: 'GET',
					header: {
						'X-Auth-Token': uni.getStorageSync('uni_id_token'),
					},
					data: {
						companyId: this.cid
					},
					success: (res) => {
						if (res.data.code === 200) {
							console.log("ECenter, order = ", res.data);
							this.orderList = [];
							const responseData = res.data.data;
							responseData.dataList.forEach((item, index) => {
								this.orderList.push({
									timestamp: item.createTime,
									amount: item.totalPrice,
									uname: item.name || '匿名用户',
									phone: item.phone || '未知号码',
									service: 'PDF报告解读'
								});
							});
						} else {
							uni.showToast({
								title: '企业流水获取失败',
								icon: 'none',
								duration: 2000
							});
						}
					},
					fail: (err) => {
						console.log("ECenter, 企业流水获取失败: ", err);
					},
					complete: () => {
						// 请求结束的回调函数（无论成功或失败都会调用）
					}
				});
			},
			fetchData: function() {
				uni.request({
					url: "https://openapi.aicareme.cn/wechat/company/check",
					method: 'GET',
					header: {
						'X-Auth-Token': uni.getStorageSync('uni_id_token'),
					},
					data: {
						phone: store.userInfo.mobile
					},
					success: (res) => {
						if (res.data.code === 200 && res.data.data) {
							const responseData = res.data.data;
							this.cid = responseData.companyId;
							this.cname = responseData.companyName;
							this.balance = Number(responseData.balance).toFixed(2);
							this.clogo = responseData.logo;
							const startTime = responseData.cooperationStartTime;
							if (startTime?.length > 0) {
								const startDate = new Date(responseData.cooperationStartTime);
								const now = new Date();
								this.duration = Math.ceil(
									(now.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
							}

							console.log("ECenter, 企业信息获取成功, responseData = ", responseData);
							this.fetchOrder();
						} else {
							uni.showToast({
								title: '您暂时没有管理的企业',
								icon: 'none',
								duration: 2000
							});
							setTimeout(() => {
								uni.navigateBack();
							}, 2000);
						}
					},
					fail: (err) => {
						console.log("ECenter, 企业信息获取失败: ", err);
						// uni.showToast({
						// 	title: '企业信息暂时无法获取',
						// 	icon: 'none',
						// 	duration: 2000
						// });
					},
					complete: () => {
						// 请求结束的回调函数（无论成功或失败都会调用）
					}
				});
			},
		}
	}
</script>

<style>
	page {
		background-color: #f6f6f6;
	}

	.ecenter-container {
		display: flex;
		flex-direction: column;
		padding-bottom: 10px;
	}

	.ecenter-main {
		display: flex;
		flex-direction: row;
		align-items: center;
		padding: 15px 20px 20px;
		margin-bottom: 10px;
		background: linear-gradient(0deg, rgba(76, 83, 130, 0.2) 0%, #ffffff 100%);
		box-shadow: 0px 2px 3px rgba(76, 83, 130, 0.1);
	}

	.ecenter-main-info {
		display: flex;
		flex-direction: column;
	}

	.ecenter-logo {
		width: 60px;
		height: 60px;
		border-radius: 100%;
		margin: 6px 15px 0px 0px;
		box-shadow: 1px 3px 2px rgba(0, 0, 0, 0.1);
	}

	.xinmai-logo {
		width: auto;
		height: 24px;
		border-radius: 100%;
		margin: 1px 2px 0px 0px;
	}

	.ecenter-main-title {
		font-size: 16px;
		font-weight: bold;
		color: #484848;
		margin: 6px 0px;
	}

	.ecenter-main-subtitle {
		height: 20px;
		line-height: 20px;
		font-size: 12px;
		color: #808080;
		text-align: center;
	}

	.ecenter-info {
		display: flex;
		flex-direction: column;
		padding: 10px 10px;
		margin: 10px 10px 30px;
		background-color: white;
		border-radius: 10px;
		box-shadow: 1px 2px 3px rgba(0, 0, 0, 0.1);
	}

	.ecenter-info-label {
		font-size: 15px;
		font-weight: bold;
		color: #808080;
		margin: 6px 0px;
	}

	.ecenter-info-row {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.ecenter-balance {
		font-size: 14px;
		color: #808080;
		margin: 0px 6px 0px 10px;
	}

	.ecenter-balance-num {
		font-size: 18px;
		font-weight: bold;
		color: #4C5382;
		margin: 6px 10px;
	}

	.ecenter-footer {
		display: flex;
		flex-direction: row;
	}

	.ecenter-footer-text {
		flex: 1;
		font-size: 8px;
		color: rgba(76, 83, 130, 0.5);
		text-align: right;
		padding: 10px 5px 0px;
	}

	.ecenter-divider {
		border-bottom: #F0F0F0 1px solid;
		margin: 6px 0px;
	}

	.order-list-empty {
		font-size: 12px;
		color: #A0A0A0;
		text-align: center;
		margin: 20px 0px;
	}
</style>