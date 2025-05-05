<template>
	<scroll-view class="order-list" scroll-y="true" @scrolltolower="scrolltolower">
		<order-item v-if="orders.length > 0" v-for="(order, index) in orders" from="orderUser" v-bind:order="order"
			:id="index" :key="index" />
		<view v-if="!isShowAllMessage" class="loading-view" style="padding-top: 10px;">
			<uni-icons class="rotate-animation" type="spinner-cycle" size="24" color="#A0A0A0" />
		</view>
		<view v-if="orders.length<=0 && isShowAllMessage" class="order-empty">暂无订单</view>
	</scroll-view>
</template>

<script>
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store';
	import orderItem from './orderitem.vue';
	const db = uniCloud.database();
	export default {
		data() {
			return {
				orders: [],
				pageNo: 1,
				pageSize: 20,
				totalCount: -1,
				isShowAllMessage: false,
			}
		},
		components: {
			orderItem,
		},
		onShow() {
			console.log("MyProducts, onShow");
			this.pageNo = 1;
			this.totalCount = -1;
			this.isShowAllMessage = false;
			this.fetchOrders();
		},
		methods: {
			scrolltolower() {
				if (!this.isInQuery && !this.isShowAllMessage) {
					this.fetchOrders();
				}
			},
			async fetchOrders() {
				// 先获取有多少条数据
				if (this.totalCount == -1) {
					let {
						result
					} = await db.collection('health-product-order').where({
						uid: store.userInfo._id
					}).count();
					this.totalCount = result.total;
					// 如果为0，就代表获取完毕
					if (this.totalCount === 0) {
						this.isShowAllMessage = true;
						return;
					} else {
						this.isInQuery = true;
					}
				} else {
					this.isInQuery = true;
				}
				const offset = (this.pageNo - 1) * this.pageSize;
				db.collection('health-product-order').where({
						uid: store.userInfo._id
					})
					.skip(offset) // 跳过前%条
					.limit(this.pageSize) // 获取%条
					.orderBy("createDate", "desc")
					.get()
					.then(res => {
						if (res.result?.data?.length > 0) {
							this.orders = this.orders.concat(res.result?.data);
							if (this.totalCount > this.pageNo * this.pageSize) {
								this.pageNo = this.pageNo + 1;
							} else {
								this.isShowAllMessage = true;
							}
						}
					}).catch((err) => {
						console.log("MyProducts, 获取产品订单失败, err = ", err);
					}).finally(() => {
						this.isInQuery = false;
					});
			}
		}
	}
</script>

<style>
	.order-list {
		display: flex;
		flex-direction: column;
		padding-bottom: 15px;
		max-height: 100vh;
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

	.order-empty {
		flex: 1;
		text-align: center;
		margin-top: 50px;
		font-size: 14px;
		color: dimgray;
		font-weight: normal;
	}
</style>