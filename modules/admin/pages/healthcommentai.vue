<template>
	<scroll-view class="comment-content" scroll-y="true" @scrolltolower="scrolltolower">
		<record-item v-if="records.length > 0" v-for="(record, index) in records" :from="'commentai'"
			v-bind:record="record" :id="index" :key="index" />
		<view v-if="!isShowAllMessage" class="loading-view">
			<uni-icons class="rotate-animation" type="spinner-cycle" size="24" color="#A0A0A0" />
		</view>
		<view v-else style="height: 20px;" />
		<view v-if="!hasReports && isShowAllMessage" class="comment-empty">暂无记录</view>
	</scroll-view>
</template>

<script>
	import recordItem from '@/components/records/recorditem';
	const db = uniCloud.database();
	export default {
		data() {
			return {
				records: [],
				pageNo: 1,
				pageSize: 10,
				totalCount: -1,
				isShowAllMessage: false,
				isInQuery: false,
			}
		},
		components: {
			recordItem
		},
		computed: {
			hasReports: function() {
				return this.records.length > 0;
			}
		},
		onLoad() {
			this.getQuery();
		},
		methods: {
			scrolltolower() {
				console.log("scrolltolower");
				if (!this.isInQuery && !this.isShowAllMessage) {
					this.getQuery();
				}
			},
			async getQuery() {
				const dbcmd = db.command;
				this.isInQuery = true;
				if (this.totalCount == -1) {
					let {
						result
					} = await db.collection('health-records').where({
						aiTips: dbcmd.exists(true).and(dbcmd.neq(''))
					}).count();
					this.totalCount = result.total;
					// 如果为0，就代表获取完毕
					if (this.totalCount === 0) {
						this.isShowAllMessage = true;
						this.isInQuery = false;
						return;
					}
				}
				const offset = (this.pageNo - 1) * this.pageSize;
				db.collection('health-records')
					.where({
						aiTips: dbcmd.exists(true).and(dbcmd.neq(''))
					})
					.skip(offset)
					.limit(this.pageSize)
					.orderBy("timestamp", "desc")
					.get()
					.then((res) => {
						if (res?.result?.data?.length > 0) {
							this.records = this.records.concat(res?.result?.data);
							if (this.totalCount > this.pageNo * this.pageSize) {
								this.pageNo = this.pageNo + 1;
							} else {
								this.isShowAllMessage = true;
							}
						}
					}).catch((err) => {
						console.log("Records, 获取电子病历失败, err = ", err);
					}).finally(() => {
						this.isInQuery = false;
					});
			}
		}
	}
</script>

<style>
	page {
		background-color: #F6F6F6;
	}

	.comment-content {
		display: flex;
		flex-direction: column;
		max-height: 100vh;
	}

	.comment-empty {
		flex: 1;
		text-align: center;
		margin-top: 50px;
		font-size: 14px;
		color: dimgray;
		font-weight: normal;
	}
</style>