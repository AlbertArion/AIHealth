<template>
	<scroll-view class="report-list" scroll-y="true" @scrolltolower="scrolltolower">
		<uni-section title="请选择用户" type="line" class="report-select">
			<uni-data-select class="select" v-model="value" :localdata="range" @change="change" label="应用选择" />
		</uni-section>
		<report-item v-if="hasReports" v-for="(report, index) in reports" v-bind:data="report" :id="index"
			:key="index" />
		<view v-if="isInQuery || !isShowAllMessage" class="loading-view" style="padding-top: 10px;">
			<uni-icons class="rotate-animation" type="spinner-cycle" size="24" color="#A0A0A0" />
		</view>
		<view v-if="hasReports" style="height: 20px;" />
		<view v-else-if="!isInQuery && isShowAllMessage" class="report-empty">今日暂无数据</view>
	</scroll-view>
</template>

<script>
	import reportItem from './adminreportitem.vue';
	import {
		requestAllReports
	} from '@/common/js/monitor';
	const db = uniCloud.database();
	const emptyDash = '--';
	export default {
		data() {
			return {
				reports: [],
				mapping: {},
				pageNo: 1,
				pageSize: 10,
				isInQuery: true,
				isShowAllMessage: false,
				value: "",
				range: [],
			}
		},
		components: {
			reportItem
		},
		computed: {
			hasReports() {
				return this.reports?.length > 0;
			}
		},
		onLoad() {
			this.requestReport();
		},
		methods: {
			requestReport() {
				const query = {
					state: 3
				};
				const uids = [];
				this.mapping = {};
				db.collection('health-product-order').where(query).field('uid, sid, name, address').get().then(res => {
					const orders = res.result.data;
					if (orders?.length > 0) {
						this.range = orders.map(item => {
							return {
								value: item.sid,
								text: item.address.username
							}
						});
						for (let i = 0; i < orders.length; i++) {
							const item = orders[i];
							if (item.sid?.length > 0) {
								uids.push(item.uid);
								this.mapping[item.sid] = item;
							}
						}
						this.fetchReport();
					}
				}).catch(err => {
					this.isInQuery = false;
					console.log('AdminHealthReport, 获取所有健康报告失败: ', err);
				});
			},
			fetchReport(sid = null) {
				this.isInQuery = true;
				const onSuccess = (dataList, totalCount) => {
					if (dataList?.length > 0) {
						this.reports = this.reports.concat(dataList);
					}
					if (totalCount > this.pageNo * this.pageSize) {
						this.pageNo = this.pageNo + 1;
					} else {
						this.isShowAllMessage = true;
					}
					this.isInQuery = false;
				};
				const onFail = (err) => {
					this.isInQuery = false;
				};
				const params = {
					pageNo: this.pageNo,
					pageSize: this.pageSize
				};
				if (sid) {
					params.sensorId = sid;
				}
				requestAllReports(this.mapping, params, onSuccess, onFail);
			},
			change(e) {
				this.pageNo = 1;
				this.reports = [];
				this.isShowAllMessage = false;
				this.fetchReport(e);
			},
			scrolltolower() {
				if (!this.isShowAllMessage) {
					this.fetchReport(this.value);
				}
			}
		}
	}
</script>

<style>
	page {
		background-color: #F6F6F6;
	}

	/* 	.report-select{
		position: fixed;
		top: 0;
		width:100%;
		z-index: 9999;
	} */

	.report-list {
		/* margin-top: 80px; */
		display: flex;
		flex-direction: column;
		max-height: 100vh;
	}

	@keyframes rotate {
		0% {
			transform: rotate(0deg);
		}

		100% {
			transform: rotate(360deg);
		}
	}

	.report-empty {
		flex: 1;
		text-align: center;
		margin-top: 50px;
		font-size: 14px;
		color: dimgray;
		font-weight: normal;
	}
</style>