<template>
	<view class="drawer-history-list">
		<uni-section title="查看历史记录" type="line">
			<uni-list>
				<uni-list-item v-for="(item, index) in listData" :key="item._id"
					:title="item.title ? item.title : '未设置'" :note="formatTimestamp(item.create_date)" showArrow
					clickable @click="onClickHandler(item)" />
			</uni-list>
		</uni-section>
	</view>
</template>

<script>
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store.js'
	const db = uniCloud.database();
	export default {
		data() {
			return {
				listData: []
			}
		},
		methods: {
			formatTimestamp: function(timestamp) {
				const date = new Date(timestamp);
				const now = new Date();
				const diff = now - date;
				const days = Math.floor(diff / (1000 * 60 * 60 * 24));
				const hours = date.getHours().toString().padStart(2, '0');
				const minutes = date.getMinutes().toString().padStart(2, '0');
				const seconds = date.getSeconds().toString().padStart(2, '0');
				if (days === 0) {
					return `今天 ${hours}:${minutes}:${seconds}`;
				}
				if (days === 1) {
					return `昨天 ${hours}:${minutes}:${seconds}`;
				}
				const year = date.getFullYear();
				const month = (date.getMonth() + 1).toString().padStart(2, '0');
				const day = date.getDate().toString().padStart(2, '0');
				return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
			},
			onClickHandler: function(item) {
				this.$emit('loadHistory', item)
			},
			getQuery: function() {
				const query = store.userInfo?._id ? {
					// 登录用户
					uid: store.userInfo._id,
					is_del: 0,
					chat_type: 1,
				} : {
					// 未登录用户
					did: store.userConfig.deviceID,
					is_del: 0,
					chat_type: 1,
				};
				uniCloud.database().collection('chatai-dialog-list').where(query)
					.orderBy('create_date desc')
					.limit(10)
					.get()
					.then((res) => {
						const data = res.result.data;
						if (data?.length > 0) {
							this.listData = data;
						}
					})
			},
		},

		mounted() {
			console.log('History, mounted');
			this.getQuery();
		},
	}
</script>

<style>
	.drawer-history-list {
		padding-top: 80rpx;
	}
</style>