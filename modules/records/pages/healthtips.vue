<template>
	<view class="tips-content">
		<view style="height: 1px; background-color: aliceblue; margin: 0px 20px; margin-bottom: 0px;"></view>
		<tip-item v-if="tips.length > 0" v-for="(tip,index) in tips" :key="index" v-bind:tip="tip" :id="index" />
		<view v-else class="tips-empty">暂无建议</view>
	</view>
</template>

<script>
	import tipItem from './tipitem.vue';
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store.js';
	const db = uniCloud.database();
	export default {
		data() {
			return {}
		},
		components: {
			tipItem,
		},
		computed: {
			tips() {
				return store.healthTips;
			},
		},
		mounted() {
			this.getTips();
		},
		methods: {
			getTips: function() {
				if (!store.userInfo._id) {
					console.log("HealthTips, uid为空");
					return;
				}
				db.collection('health-tips').where({
						uid: store.userInfo._id
					})
					.orderBy("timestamp", "desc")
					.get()
					.then((res) => {
						if (res?.result?.data?.length > 0) {
							store.healthTips = [];
							res?.result?.data.forEach(item => {
								if (item.content) {
									store.healthTips.push(item);
								}
							})
							this.tips = tips;
						}
					}).catch((err) => {
						console.log("HealthTips, 健康建议查询失败, err = " + JSON.stringify(err));
					}).finally(() => {});
			},
		}
	}
</script>

<style>
	.tips-content {
		display: flex;
		flex-direction: column;
		padding-bottom: 10px;
	}

	.tips-empty {
		flex: 1;
		text-align: center;
		margin-top: 50px;
		font-size: 14px;
		color: dimgray;
		font-weight: normal;
	}
</style>