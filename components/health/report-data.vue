<template>
	<view :class="`report-container ${fromDevice ? (beating ? 'beatEffect' : 'reportEffect') : 'staticEffect'}`">
		<view v-if="fromDevice" class="report-item-title" @click="toReport">
			<image style="width: 16px;" mode="widthFix" src="/static/tabbar/icon_health.png" />
			<view style="flex: 1; margin-left: 6px; display: flex; flex-direction: row; align-items: center;">
				<text class="report-item-report-title"
					:style="`color: white; ${isDefaultStyle ? 'font-size: 13px' : 'font-size: 15px'}`">{{deviceReportTitle}}</text>
				<text class="report-item-report-tips">{{serviceDuration}}</text>
			</view>
			<!-- <image style="width: 16px;" mode="widthFix"
				src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/monitor/detail.png" /> -->
			<uni-icons type="right" size="16" color="#FFFFFF" style="margin-left: 3px; opacity: 0.8;" />
		</view>
		<view v-else class="report-item-title">
			<image class="report-item-title-icon" mode="widthFix" src="/static/tabbar/icon_health.png" />
			<text class="report-item-report-title"
				:style="`flex: 1; color: white; margin-left: 6px; ${isDefaultStyle?'font-size: 14px':'font-size: 15px'}`">{{itemReportTitle}}</text>
			<image v-if="!fromAdmin" class="report-item-title-icon" mode="widthFix"
				src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/monitor/detail.png" />
		</view>
		<view v-if="fromAdmin || reportDisplay" class="report-dashed-divider" style="margin: 10px 0px 6px;" />
		<view v-if="fromAdmin" class="report-item-column">
			<view class="report-item-row">
				<text class="report-item-text"
					:style="`color: white; ${isDefaultStyle?'':'font-size: 13px'}`">用户名：</text>
				<text class="report-item-text"
					:style="`color: white; ${isDefaultStyle?'':'font-size: 13px'}`">{{user.username}}</text>
			</view>
			<view class="report-item-row">
				<text class="report-item-text"
					:style="`color: white; ${isDefaultStyle?'':'font-size: 13px'}`">手机号码：</text>
				<text class="report-item-text"
					:style="`color: white; ${isDefaultStyle?'':'font-size: 13px'}`">{{user.telNumber}}</text>
			</view>
		</view>
		<view v-if="reportDisplay" class="report-item-column" @click="toReport">
			<view class="report-item-row">
				<text class="report-item-text"
					:style="`color: white; ${isDefaultStyle?'':'font-size: 13px'}`">监测时间：</text>
				<text class="report-item-text"
					:style="`color: white; ${isDefaultStyle?'':'font-size: 13px'}`">{{report.StartTime}}</text>
			</view>
			<view class="report-item-row" style="align-items: baseline;">
				<text class="report-item-text"
					:style="`color: white; ${isDefaultStyle?'':'font-size: 13px'}`">监测周期：</text>
				<text class="report-item-text"
					:style="`color: white; ${isDefaultStyle?'':'font-size: 13px'}`">{{report.MedicineSleepQuality.AsleepTime}}
					至 {{report.MedicineSleepQuality.WakeTime}}</text>
			</view>
			<view class="report-item-row">
				<text class="report-item-text"
					:style="`color: white; ${isDefaultStyle?'':'font-size: 13px'}`">平均心率：</text>
				<text class="report-item-text"
					:style="`color: white; ${isDefaultStyle?'':'font-size: 13px'}`">{{heartRate}} 次/分钟</text>
			</view>
			<view class="report-item-row">
				<text class="report-item-text"
					:style="`color: white; ${isDefaultStyle?'':'font-size: 13px'}`">最小心率：</text>
				<text class="report-item-text"
					:style="`color: white; ${isDefaultStyle?'':'font-size: 13px'}`">{{minRate}} 次/分钟</text>
			</view>
			<view class="report-item-row">
				<text class="report-item-text"
					:style="`color: white; ${isDefaultStyle?'':'font-size: 13px'}`">最大心率：</text>
				<text class="report-item-text"
					:style="`color: white; ${isDefaultStyle?'':'font-size: 13px'}`">{{maxRate}} 次/分钟</text>
			</view>
			<view v-if="report.isNightReport" class="report-item-row">
				<text class="report-item-text"
					:style="`color: white; ${isDefaultStyle?'':'font-size: 13px'}`">休息时长：</text>
				<text class="report-item-text"
					:style="`color: white; ${isDefaultStyle?'':'font-size: 13px'}`">{{sleepTime}}</text>
			</view>
			<view v-if="report.isNightReport && awakeningTimes" class="report-item-row">
				<text class="report-item-text"
					:style="`color: white; ${isDefaultStyle?'':'font-size: 13px'}`">醒来次数：</text>
				<text class="report-item-text"
					:style="`color: white; ${isDefaultStyle?'':'font-size: 13px'}`">{{awakeningTimes}} 次</text>
			</view>
			<view v-if="report.isNightReport" class="report-item-row">
				<text class="report-item-text"
					:style="`color: white; ${isDefaultStyle?'':'font-size: 13px'}`">深度睡眠：</text>
				<text class="report-item-text"
					:style="`color: white; ${isDefaultStyle?'':'font-size: 13px'}`">{{deepSleep}}</text>
			</view>
			<view v-if="report.isNightReport" class="report-item-row">
				<text class="report-item-text"
					:style="`color: white; ${isDefaultStyle?'':'font-size: 13px'}`">睡眠效率：</text>
				<text class="report-item-text"
					:style="`color: white; ${isDefaultStyle?'':'font-size: 13px'}`">{{effectiveRate}}</text>
			</view>
			<view class="report-item-row">
				<text class="report-item-text"
					:style="`color: white; ${isDefaultStyle?'':'font-size: 13px'}`">呼吸频率：</text>
				<text class="report-item-text"
					:style="`color: white; ${isDefaultStyle?'':'font-size: 13px'}`">{{Math.round(report.MedicineSleepQuality.BreathingRate)}}
					次/分钟</text>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store';
	import {
		averageRate,
		fetchMaxRate,
		fetchMinRate
	} from '@/common/js/monitor';
	import {
		getDateToday,
		getMillisNow
	} from '@/common/utils/timestamp';
	const db = uniCloud.database();
	export default {
		data() {
			return {
				beatInfo: {
					heartRate: 0,
					breathe: 0
				},
				isNightReport: false
			}
		},
		props: {
			user: {
				type: Object
			},
			report: {
				type: Object
			},
			product: {
				type: Object
			},
			from: {
				type: String,
				default: ''
			}
		},
		computed: {
			isDefaultStyle() {
				return store.userConfig.fontStyle == 'normal';
			},
			fromDevice: function() {
				return this.from == 'device';
			},
			fromAdmin: function() {
				return this.from == 'admin';
			},
			reportDisplay: function() {
				return !this.beating && this.report;
			},
			deviceReportTitle: function() {
				let title = '';
				if (this.beating) {
					title = '实时数据：';
				} else {
					title = this.product?.nickname?.length > 0 ? (this.product?.nickname + '数据') : '今日监测数据';
				}
				return title;
			},
			itemReportTitle: function() {
				if (this.fromAdmin) {
					return this.user.username + '的健康数据';
				} else {
					return (this.isReportToday ? '今日' : '最近') + '健康数据详情';
				}
			},
			serviceDuration: function() {
				let durationDesc = '';
				if (this.beating) {
					durationDesc = `[心率 ${this.beatInfo.heartRate}次/分 | 呼吸 ${this.beatInfo.breathe}次/分]`
				} else if (this.product?.serviceStart) {
					const millis = getMillisNow() - Number(this.product.serviceStart);
					const days = Math.max(Math.ceil(millis / (24 * 60 * 60 * 1000)), 1);
					durationDesc = `（守护您的健康第${days}天）`;
				} else {
					durationDesc = '（您还没有购买服务）';
				}
				return durationDesc;
			},
			isReportToday() {
				const reportDate = String(this.report.MedicineSleepQuality.WakeTime).slice(0, 10);
				return getDateToday() == reportDate;
			},
			heartRate() {
				return averageRate(this.report);
			},
			maxRate() {
				return fetchMaxRate(this.report);
			},
			minRate() {
				return fetchMinRate(this.report);
			},
			sleepTime() {
				const seconds = this.report.MedicineSleepQuality.TotalSleepTime;
				const hours = Math.floor(seconds / 3600);
				const minutes = ((seconds - hours * 3600) / 60).toFixed(0);
				const result = `${hours > 0 ? hours + ' 小时 ':''}${minutes} 分钟`;
				return `${hours > 0 ? hours + ' 小时 ':''}${minutes} 分钟`;
			},
			awakeningTimes() {
				const times = this.report.MedicineSleepQuality.AwakeningTimes;
				return times;
			},
			deepSleep() {
				const quality = this.report.MedicineSleepQuality;
				const deepSeconds = quality.DeepSleepRate * quality.TotalSleepTime;
				const hours = Math.floor(deepSeconds / 3600);
				const minutes = ((deepSeconds - hours * 3600) / 60).toFixed(0);
				const score = Math.min(20, Math.max(0, 10 + (quality.DeepSleepRate - 0.3) * 100));
				const scoreText = score > 10 ? '不错' : (score > 5 ? '一般' : '较差');
				return `${hours > 0 ? hours + ' 小时 ':''}${minutes} 分钟(${scoreText})`;
			},
			effectiveRate() {
				const quality = this.report.MedicineSleepQuality;
				const rate = quality.TotalEffectiveSleepTime / quality.TotalOnBedTime;
				return `${Math.round(rate * 100)}%`;
			},
			beating() {
				return store.userConfig.beating;
			}
		},
		methods: {
			onBeating: function(beating, beatInfo) {
				this.beatInfo = beatInfo;
			},
			toReport: function() {
				if (this.fromDevice) {
					this.$emit('to-report');
				}
			}
		}
	}
</script>

<style>
	.report-container {
		display: flex;
		flex-direction: column;
		padding: 15px 10px 10px;
		border-top-left-radius: 10px;
		border-top-right-radius: 10px;
	}

	.report-item-title {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.staticEffect {
		background: linear-gradient(135deg, rgba(76, 83, 130, 1) 0%, rgba(95, 158, 160, 1) 85%);
	}

	.reportEffect {
		background: linear-gradient(135deg, rgba(76, 83, 130, 1) 0%, rgba(95, 158, 160, 1) 85%);
	}

	.reportEffect:active {
		opacity: 0.9;
	}

	.beatEffect {
		background: linear-gradient(135deg, rgba(219, 84, 92, 1) 0%, rgba(76, 83, 130, 1) 85%);
	}

	.beatEffect:active {
		opacity: 0.9;
	}

	.report-item-column {
		display: flex;
		flex-direction: column;
	}

	.report-item-title-icon {
		width: 18px;
	}

	.report-item-report-title {
		font-size: 12px;
		color: #4C5382;
		font-weight: bold;
	}

	.report-item-report-tips {
		font-size: 11px;
		color: rgba(255, 255, 255, 0.7);
	}

	.report-dashed-divider {
		height: 1px;
		border-top: white 1px dashed;
		opacity: 0.8;
	}

	.report-item-row {
		display: flex;
		flex-direction: row;
		align-items: center;
		margin: 0px 15px;
	}

	.report-item-text {
		flex: 1;
		font-size: 11px;
		color: #808080;
		line-height: 24px;
	}
</style>