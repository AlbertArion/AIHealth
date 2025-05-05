<template>
	<view style="padding-bottom: 40px;">
		<view class="item-container shadow">
			<report-data v-if="report" :report="report" :user="user" from="admin" />
			<view v-if="data" class="report-advice-container">
				<textarea v-if="isEditMode" maxlength="-1" class="advice-textarea" v-model="expertAdvice"
					cursor-color="#4C5382" placeholder-class="advice-textarea-placeholder"
					placeholder="请查阅后, 输入合理的健康风险提醒：" />
				<text v-else class="advice-textarea">{{adviceText}}</text>
				<button class="advice-commit" @click="submitAdvice">{{isEditMode ? '提交': '编辑'}}</button>
				<view class="report-divider-dotted" />
				<view class="item-action-container">
					<text class="item-report-title">心率趋势图</text>
					<view style="flex: 1;" />
					<view class="level-item-text"
						:style="`color: ${trendIndex == -1? '#4C5382':levelArray[trendIndex].color};`">
						<text style="margin-right: 6px;">{{trendText}}</text>
						<image style="width: 15px;" mode="widthFix"
							src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/monitor/detail_p.png" />
					</view>
				</view>
				<pulse-trend style="margin: -45px 0px -20px -5px;" :report="data" from="admin"
					@onChartClick="showPicker('trend')" />
				<view class="item-action-container">
					<text class="item-report-title">心率分布图</text>
					<view style="flex: 1;" />
					<view class="level-item-text"
						:style="`color: ${distIndex == -1? '#4C5382':levelArray[distIndex].color};`">
						<text style="margin-right: 6px;">{{distText}}</text>
						<image style="width: 15px;" mode="widthFix"
							src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/monitor/detail_p.png" />
					</view>
				</view>
				<pulse-dist style=" margin: -24px 0px 0px -2px;" :report="data" from="admin"
					@onChartClick="showPicker('dist')" />
				<view class="item-action-container">
					<text class="item-report-title">心率散点图</text>
					<view style="flex: 1;" />
					<view class="level-item-text"
						:style="`color: ${scatterIndex == -1? '#4C5382':levelArray[scatterIndex].color};`">
						<text style="margin-right: 6px;">{{scatterText}}</text>
						<image style="width: 15px;" mode="widthFix"
							src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/monitor/detail_p.png" />
					</view>
				</view>
				<scatter-chart style="margin: -20px 0px 0px 0px" :report="data" from="admin"
					@onChartClick="showPicker('scatter')" />
			</view>
			<view v-else class="loading-view">
				<uni-icons class="rotate-animation" type="spinner-cycle" size="24" color="#A0A0A0" />
			</view>
		</view>
	</view>
</template>
<script>
	import reportData from '@/components/health/report-data.vue';
	import pulseTrend from '@/components/smartchart/pulsetrend.vue';
	import pulseDist from '@/components/smartchart/pulsedist.vue';
	import scatterChart from '@/components/smartchart/scatterchart.vue';
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store';
	import {
		getDateToday
	} from '@/common/utils/timestamp';

	const db = uniCloud.database();

	export default {
		data() {
			return {
				data: undefined,
				report: undefined,
				date: undefined,
				user: undefined,
				trendIndex: -1,
				distIndex: -1,
				scatterIndex: -1,
				levelArray: [{
					text: '非常健康',
					color: '#4C5382'
				}, {
					text: '轻度风险',
					color: '#F1C96A'
				}, {
					text: '中度风险',
					color: '#FF8866'
				}],
				hasMonitor: false,
				expertAdvice: '',
				isEditMode: true
			}
		},
		components: {
			reportData,
			pulseTrend,
			pulseDist,
			scatterChart
		},
		computed: {
			fetchData: function() {
				const reportData = store.userConfig.reportTemp;
				store.userConfig.reportTemp = null;
				return reportData;
			},
			hasAdvice: function() {
				return this.expertAdvice.length > 0;
			},
			adviceText: function() {
				return this.hasAdvice ? this.expertAdvice : '';
			},
			trendText: function() {
				return this.trendIndex == -1 ? '请标注' : this.levelArray[this.trendIndex].text;
			},
			distText: function() {
				return this.distIndex == -1 ? '请标注' : this.levelArray[this.distIndex].text;
			},
			scatterText: function() {
				return this.scatterIndex == -1 ? '请标注' : this.levelArray[this.scatterIndex].text;
			}
		},
		onLoad() {
			this.data = this.fetchData;
			this.report = this.data.businessData;
			this.date = String(this.report.EndTime).slice(0, 10);
			this.user = {
				uid: this.data.uid,
				username: this.data.username,
				telNumber: this.data.telNumber
			};
			this.fetchMonitor();
			console.log("ReportDetail, report = ", this.report);
		},
		methods: {
			fetchMonitor: function() {
				const query = {
					uid: this.user.uid,
					date: this.date
				};
				db.collection('health-monitor')
					.where(query)
					.get({
						getOne: true
					})
					.then(res => {
						console.log("ReportDetail, 获取健康数据: ", res);
						const monitorData = res.result?.data;
						if (monitorData) {
							this.hasMonitor = true;
							this.expertAdvice = monitorData.advice || ''
							if (monitorData.trendRisk || monitorData.trendRisk == 0) {
								this.trendIndex = monitorData.trendRisk;
							}
							if (monitorData.distRisk || monitorData.distRisk == 0) {
								this.distIndex = monitorData.distRisk;
							}
							if (monitorData.scatterRisk || monitorData.scatterRisk == 0) {
								this.scatterIndex = monitorData.scatterRisk;
							}
						}
						if (this.hasAdvice) {
							this.isEditMode = false;
						}
					}).catch((err) => {
						console.log("ReportDetail, 获取健康数据失败: ", err);
					});
			},
			submitAdvice: function() {
				if (!this.isEditMode) {
					this.isEditMode = true;
				} else if (this.hasAdvice) {
					const data = {
						advice: this.expertAdvice
					};
					this.updateDb(data);
					this.isEditMode = false;
				} else {
					uni.showToast({
						icon: 'none',
						title: '请输入健康风险提醒',
						duration: 1000,
					});
				}
			},
			showPicker: function(type) {
				const that = this;
				uni.showActionSheet({
					itemList: [
						'非常健康',
						'轻度风险',
						'中度风险'
					],
					success: function(res) {
						if (type == 'trend') {
							that.trendIndex = res.tapIndex;
						} else if (type == 'dist') {
							that.distIndex = res.tapIndex;
						} else {
							that.scatterIndex = res.tapIndex;
						}
						that.updateRisks(type, res.tapIndex);
					}
				});
			},
			updateRisks: function(type, risk) {
				const data = {};
				if (type == 'trend') {
					data.trendRisk = risk;
				} else if (type == 'dist') {
					data.distRisk = risk;
				} else {
					data.scatterRisk = risk;
				}
				this.updateDb(data);
			},
			updateDb: function(data) {
				const collection = db.collection('health-monitor');
				if (this.hasMonitor) {
					const query = {
						uid: this.user.uid,
						date: this.date
					};
					collection.where(query).update(data).then(res => {
						console.log("ReportDetail, 更新健康状态: ", res);
						uni.showToast({
							icon: 'none',
							title: '更新成功',
							duration: 600
						});
					}).catch((err) => {
						console.log("ReportDetail, 更新健康状态失败: ", err);
					});
				} else {
					data.uid = this.user.uid;
					data.date = this.date;
					data.dataSource = 1;
					collection.add(data).then(res => {
						console.log("ReportDetail, 新增健康状态记录: ", res);
						uni.showToast({
							icon: 'none',
							title: '更新成功',
							duration: 600
						});
					}).catch((err) => {
						console.log("ReportDetail, 新增健康状态记录失败: ", err);
					});
				}
			}
		}
	}
</script>

<style>
	page {
		background-color: #F6F6F6;
	}

	.item-container {
		display: flex;
		flex-direction: column;
		margin: 0px 20px;
		border-radius: 10px;
		overflow: hidden;
		background-color: white;
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
	}

	.level-item-text {
		display: flex;
		flex-direction: row;
		align-items: center;
		font-size: 12px;
		font-weight: bold;
	}

	.level-item-text:active {
		opacity: 0.8;
	}

	.item-action-container {
		display: flex;
		flex-direction: row;
		align-items: center;
		margin: 10px 15px 0px 15px;
	}

	.report-advice-container {
		display: flex;
		flex-direction: column;
		padding: 6px 0px;
		border-bottom-left-radius: 10px;
		border-bottom-right-radius: 10px;
		background-color: white;
	}

	.advice-textarea {
		flex: 1;
		min-height: 100px;
		font-size: 13px;
		color: #282828;
		line-height: 20px;
		padding: 10px 15px;
	}

	.advice-textarea-placeholder {
		font-size: 13px;
		color: gray
	}

	.advice-commit {
		background-color: #4C5382;
		color: white;
		border-radius: 20px;
		font-size: 13px;
		line-height: 27px;
		padding: 0px 20px;
		margin: 0px 10px 15px;
		position: relative;
		align-self: flex-end;
	}

	.advice-commit:active {
		opacity: 0.8;
	}

	.report-divider-dotted {
		border-top: 1px dashed #B8BDCC;
		margin: 0px 10px;
	}
</style>