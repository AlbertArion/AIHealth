<template>
	<scroll-view class="report-list" :scroll-y="true" :enable-flex="true" @scrolltolower="scrolltolower">
		<report-item v-if="hasReports" v-for="(report, index) in reports" :ref="setRef" v-bind:data="report" :id="index"
			:key="index" :product="product" :update="onReportUpdated" @report-expand="closeLastReport"
			@service-pay="showPopupService" @oldest-report="getOldestReport" />
		<view v-if="!isShowAllMessage" class="loading-view" style="padding-top: 10px;">
			<uni-icons class="rotate-animation" type="spinner-cycle" size="24" color="#A0A0A0" />
		</view>
		<view v-else style="height: 20px;" />
		<view v-if="!hasReports && isShowAllMessage" class="report-empty">暂无数据</view>
		<uni-popup v-if="product && product.state == 3" ref="popupService" type="bottom" @maskClick="closePopupService">
			<popup-service mode="base" :product="product" @closePopup="closePopupService" />
		</uni-popup>
	</scroll-view>
</template>

<script>
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store';
	import reportItem from './reportitem.vue';
	import popupService from '@/components/popup/popup-service.vue';
	import {
		getMillisNow,
		monthInMillis,
		yearInMillis
	} from '@/common/utils/timestamp';
	import {
		requestDeviceReport
	} from '@/common/js/monitor';
	const db = uniCloud.database();
	const emptyDash = '--';
	export default {
		data() {
			return {
				isNeedEmit: false,
				lastExpandIndex: store.userConfig.reportIndex,
				product: undefined,
				reportItems: [],
				reports: [],
				pageNo: 1,
				pageSize: 10,
				isInQuery: false,
				isShowAllMessage: false
			}
		},
		components: {
			reportItem,
			popupService
		},
		computed: {
			hasReports() {
				return this.reports?.length > 0;
			}
		},
		onLoad() {
			uni.$on('servicePaid', this.onServicePaid);
			this.initReport();
		},
		onUnload() {
			uni.$off('servicePaid');
		},
		methods: {
			initReport() {
				const products = store.userInfo.products;
				if (products?.length > 0) {
					this.product = products[store.userConfig.productIndex];
				}
				this.reports = store.getDeviceReports();
				if (this.hasReports) {
					this.pageNo += 1;
				} else {
					this.fetchReport();
				}
			},
			fetchReport() {
				if (store.isDeviceBound()) {
					this.isInQuery = true;
					const onSuccess = (dataList, today, totalCount) => {
						if (dataList.length > 0) {
							this.reports = this.reports.concat(dataList);
							store.setDeviceReports(this.reports);
							this.isNeedEmit = true;
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
					const extra = {
						pageNo: this.pageNo,
						pageSize: this.pageSize
					};
					requestDeviceReport(onSuccess, onFail, extra);
				} else {
					this.isInQuery = false;
				}
			},
			scrolltolower() {
				if (!this.isInQuery && !this.isShowAllMessage) {
					this.fetchReport();
				}
			},
			setRef(el) {
				if (el) {
					this.reportItems.push(el);
				}
			},
			closeLastReport(index) {
				if (this.lastExpandIndex > -1) {
					this.reportItems[this.lastExpandIndex].close();
				}
				this.lastExpandIndex = index;
			},
			getOldestReport(payload) {
				const lastIndex = this.reports.length - 1;
				if (lastIndex > payload.index) {
					payload.oldestReport = this.reports[lastIndex].businessData;
				}
				console.log("getOldestReport, index: " + payload.index + ", lastIndex: " + lastIndex + ", oldestReport: ",
					payload.oldestReport);
			},
			onServicePaid: function(fee) {
				if (this.lastExpandIndex > -1) {
					this.reportItems[this.lastExpandIndex].onServicePaid(fee);
				}
			},
			onReportUpdated: function(dailyReport) {
				if (this.isNeedEmit) {
					this.isNeedEmit = false;
					uni.$emit('dailyReport', dailyReport);
				}
			},
			showPopupService: function() {
				this.$refs.popupService.open();
			},
			closePopupService: function() {
				this.$refs.popupService.close();
			}
		}
	}
</script>

<style>
	page {
		background-color: #f6f6f6;
	}

	.report-list {
		display: flex;
		flex-direction: column;
		max-height: 100vh;
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