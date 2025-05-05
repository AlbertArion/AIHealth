<template>
	<view class="item-root shadow">
		<report-data v-if="showDetail" :report="report" />
		<view v-if="showDetail" class="report-tips-container">
			<view class="item-row" style="margin: 0px;">
				<text class="item-report-text"
					style="flex: 1; color: #484848; font-size: 13px; font-weight: bold; margin-left: 3px;">智能健康管理：</text>
				<button class="report-detail-button" :style="`${loading ? 'visibility: hidden;' : ''}`"
					@click="onAction">{{isInService ? '查看详情' : '续费解读'}}</button>
			</view>
			<view v-if="loading" class="loading-view">
				<uni-icons class="rotate-animation" type="spinner-cycle" size="24" color="#A0A0A0" />
			</view>
			<view v-else class="item-row" style="margin: 10px 15px 3px; white-space: pre-wrap;">
				<uaMarkDown v-if="isInService" :source="reportTips"
					:outerStyle="`font-size: 11px; color: #808080; line-height: 18px;`" :showLine="false" />
				<text v-else class="item-report-text">{{outofService}}</text>
			</view>
		</view>
		<view v-else class="item-container" @click="expand">
			<view class="item-row" style="margin: 15px 15px 6px;">
				<image class="item-device-icon" mode="widthFix"
					src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/device/icon_health_p.png" />
				<text class="item-report-title" style="flex: 1;">健康数据：</text>
				<text class="item-report-text">{{report.StartTime}}</text>
				<view style="padding: 3px 3px;">
					<uni-icons type="down" size="16" color="#A0A0A0" />
				</view>
			</view>
			<view class="item-row" style="margin-left: 27px;">
				<text class="item-report-text" style="font-weight: bold;">平均心率：</text>
				<text class="item-report-text">{{heartRate}} 次/分钟</text>
			</view>
			<view class="item-row" style="margin-left: 27px;">
				<text class="item-report-text" style="font-weight: bold;">休息时长：</text>
				<text class="item-report-text">{{sleepTime}}</text>
			</view>
			<view class="item-row" style="margin-left: 27px; margin-bottom: 10px;">
				<text class="item-report-text" style="font-weight: bold;">呼吸频率：</text>
				<text class="item-report-text">{{breathingRate}} 次/分钟</text>
			</view>
		</view>
	</view>
</template>

<script>
	import reportData from '@/components/health/report-data.vue';
	import uaMarkDown from '@/components/ua-markdown/ua-markdown.vue';
	import {
		updateUserInfo
	} from '@/common/js/device';
	import {
		getDateFrom,
		getMillisNow,
		monthInMillis,
		yearInMillis
	} from '@/common/utils/timestamp';
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store';
	import {
		SERVICE_PRICE_YEAR
	} from '@/common/js/productorder';
	import {
		averageRate,
		fetchReportTips,
		getSleepQualityScore,
		parseReportHRs
	} from '@/common/js/monitor';
	import {
		tipContent
	} from '@/common/js/record';
	export default {
		data() {
			return {
				report: this.data?.businessData,
				inService: -1,
				showDetail: this.id == store.userConfig.reportIndex,
				loading: false
			}
		},
		props: {
			id: {
				type: Number
			},
			data: {
				type: Object
			},
			product: {
				type: Object
			}
		},
		components: {
			reportData,
			uaMarkDown
		},
		computed: {
			heartRate: function() {
				return averageRate(this.report);
			},
			breathingRate: function() {
				return Math.round(this.report.MedicineSleepQuality.BreathingRate);
			},
			sleepTime() {
				const seconds = this.report.MedicineSleepQuality.TotalSleepTime;
				const hours = Math.floor(seconds / 3600);
				const minutes = ((seconds - hours * 3600) / 60).toFixed(0);
				return `${hours > 0 ? hours + ' 小时 ':''}${minutes} 分钟`;
			},
			hasService: function() {
				return this.product?.serviceEnd;
			},
			isInService: function() {
				if (this.inService != -1) {
					return this.inService;
				}
				this.inService = this.hasService && (getMillisNow() < Number(this.product.serviceEnd));
				return this.inService;
			},
			reportTips: function() {
				const tips = this.report.reportTips;
				return tips ? tipContent(tips) : "正在解读中...";
			},
			outofService: function() {
				return `${this.hasService ? ('您的智能健康管理服务已于' + getDateFrom(Number(this.product.serviceEnd)) + '到期') : '您还没有购买智能健康管理服务'}`;
			}
		},
		mounted() {
			if (this.showDetail) {
				this.parseReport();
			}
		},
		methods: {
			expand() {
				this.showDetail = true;
				this.$emit('report-expand', this.id);
				this.parseReport();
			},
			close() {
				this.showDetail = false;
			},
			parseReport: function() {
				parseReportHRs(this.report);
				this.getReportTips();
			},
			getReportTips: function() {
				if (!this.isInService) {
					// 服务到期，需要续费
					console.log("ReportItem, 服务到期需要续费");
					return;
				}
				if (this.report.reportTips) {
					// 解读已完成
					return;
				}
				const onSuccess = (dailyReport) => {
					if (dailyReport) {
						this.$emit('update', dailyReport);
					}
					this.loading = false;
				};
				const onFail = (err) => {
					uni.showToast({
						title: "解析失败",
						icon: 'none',
						duration: 2000
					});
					this.loading = false;
				};
				this.loading = true;
				const qualityData = this.report.MedicineSleepQuality;
				const sleepQuality = {
					effectiveTime: qualityData.TotalSleepTime,
					awakeningRate: qualityData.AwakeningRate,
					remRate: qualityData.REMRate,
					lightSleepRate: qualityData.LightSleepRate,
					deepSleepRate: qualityData.DeepSleepRate
				};
				const sleepScore = getSleepQualityScore(sleepQuality);
				// 反写数据
				this.report.Grade = sleepScore;
				const payload = {
					index: this.id
				};
				this.$emit('oldest-report', payload);
				console.log("ReportItem, payload = ", payload);
				fetchReportTips(this.report, onSuccess, onFail, payload.oldestReport);
			},
			onAction: function() {
				if (this.isInService) {
					this.toReportPdf();
				} else {
					this.payForService();
				}
			},
			toReportPdf: function() {
				const tips = this.report.reportTips;
				if (tips) {
					uni.navigateTo({
						url: `/pages/records/report?id=${String(this.report.BasicReportID).toUpperCase()}&reportIndex=${this.id}&reportTips=${tips}&reportTime=${this.report.EndTime}&from=healthReport`
					});
				} else {
					uni.showToast({
						icon: 'none',
						title: '正在解读中...',
						duration: 1000
					});
				}
			},
			payForService: function() {
				this.$emit('service-pay');
			},
			onServicePaid: function(fee) {
				this.inService = true;
				this.parseReport();
				const serviceMillis = Number(this.product.serviceEnd);
				this.product.serviceEnd = String(serviceMillis + (fee == SERVICE_PRICE_YEAR ? yearInMillis() :
					monthInMillis()));
				updateUserInfo(store.userInfo._id, {
					products: store.userInfo.products
				});
			}
		}
	}
</script>

<style>
	.item-root {
		display: flex;
		flex-direction: column;
		margin: 20px 20px 0px;
		border-radius: 10px;
		overflow: hidden;
	}

	.item-container {
		display: flex;
		flex-direction: column;
		background-color: white;
		border-radius: 10px;
	}

	.item-row {
		display: flex;
		flex-direction: row;
		align-items: center;
		margin: 0px 15px;
	}

	.item-device-icon {
		width: 16px;
		margin-right: 6px;
	}

	.item-report-title {
		font-size: 12px;
		color: #4C5382;
		line-height: 24px;
		font-weight: bold;
	}

	.item-report-text {
		flex: 1;
		font-size: 11px;
		color: #808080;
		line-height: 18px;
	}

	.text-ellipsis {
		line-height: 18px;
		max-height: 200px;
		word-break: break-all;
		text-overflow: ellipsis;
		overflow: hidden;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 10;
	}

	.report-tips-container {
		display: flex;
		flex-direction: column;
		padding: 15px 10px;
		background-color: white;
	}

	.report-detail-button {
		background-color: #468294;
		color: white;
		border-radius: 20px;
		font-size: 11px;
		padding: 0px 15px;
		line-height: 24px;
	}

	.report-detail-button:active {
		opacity: 0.8;
	}
</style>