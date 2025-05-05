<template>
	<view class="monitor-container">
		<view class="monitor-gradient" :class="gradientColor" />
		<view style="height: 66px;" />
		<view class="monitor-top">
			<view class="monitor-evaluate-result" @longpress="toJson">
				<view class="monitor-title">
					<text class="monitor-title-text">{{healthTitle}}</text>
					<image class="monitor-device-icon" style="margin-left: 10px;" mode="widthFix"
						src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/device/phone.png" />
					<image v-if="isDeviceBound" class="monitor-device-icon" mode="widthFix"
						src="/static/tabbar/icon_health.png" />
					<text v-if="!isCacheValid" style="font-size: 12px; color: white; opacity: 0.8;"></text>
				</view>
				<text class="monitor-tips" :style="`${isDefaultStyle?'':'font-size: 14px;'}`">{{dailyTips}}</text>
				<view v-if="!isWriting && hasTips" style="opacity: 0.8;">
					<text v-if="!hasAuthorized" class="monitor-subtitle">授权过期，点击重新授权 -></text>
					<text v-else-if="isCacheValid" class="monitor-subtitle">{{reportText}}</text>
					<text v-else class="monitor-subtitle">今日数据有变化，点击更新 -></text>
				</view>
			</view>
			<view class="monitor-evaluate-container">
				<uni-icons v-if="isLoading" class="rotate-animation" style="margin: 20px 20px 15px 0px;"
					type="spinner-cycle" size="50" color="white" />
				<view v-else-if="isDeviceBound" class="monitor-device-score">
					<text :style="`color: ${textColor}; ${isAF ? 'font-size: 14px;' : ''}`">{{deviceScore}}</text>
					<text v-if="isAF" :style="`color: ${textColor}; font-size: 10px; opacity: 0.7;`">（{{afText}}）</text>
				</view>
				<text v-else class="monitor-score"
					:style="`${score == '暂无数据' ? 'font-size: 21px;' : ''}`">{{score}}</text>
				<text v-if="!isLoading" class="monitor-time" :style="`color: ${textColor}`">{{updateTime}}</text>
				<view v-if="hasAuthorized && !isLoading" class="monitor-evaluate"
					:style="`background-color: ${backgroundColor}`" @click="actionEvent">{{actionText}}</view>
				<button v-else-if="!isLoading" class="monitor-evaluate" :style="`background-color: ${backgroundColor}`"
					open-type="getPhoneNumber" @getphonenumber="authorize">授权同步</button>
			</view>
		</view>
		<view class="monitor-data-container shadow">
			<view class="monitor-item" :style="`${isDefaultStyle?'':'font-size: 13px;'}`" @click="toPulse">
				<image class="monitor-item-icon" mode="widthFix"
					src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/monitor/pulse.png" />
				<text class="monitor-item-label">心率：</text>
				<pulse-progress v-if="hasDevicePulse" style="flex: 1" :pulseData="fetchPulseData" />
				<view v-else class="monitor-progress-container">
					<progress class="monitor-progress" :percent="fetchPulsePercent" stroke-width="15"
						activeColor="#AA3311" active="true" duration="3" />
				</view>
				<view class="monitor-item-right">
					<view class="monitor-progress-desc">
						<text>{{pulseToday}}</text>
					</view>
					<view v-if="pulseToday == '--'">
						<text v-if="isDeviceBound" class="monitor-action-text">暂无数据</text>
						<text v-else class="monitor-action-btn">去记录</text>
					</view>
				</view>
			</view>
			<view class="monitor-item" :style="`${isDefaultStyle?'':'font-size: 13px;'}`" @click="toSleep">
				<image class="monitor-item-icon" mode="widthFix"
					src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/monitor/sleep.png" />
				<text class="monitor-item-label">睡眠：</text>
				<sleep-progress v-if="hasSleepQuality" style="flex: 1" :sleepQuality="fetchSleepQuality" />
				<view v-else class="monitor-progress-container">
					<progress class="monitor-progress" :percent="fetchSleepPercent" stroke-width="15"
						activeColor="#7C4B75" active="true" duration="3" />
				</view>
				<view class="monitor-item-right">
					<view class="monitor-progress-desc">
						<text>{{sleepToday}}</text>
					</view>
					<view v-if="sleepToday == '--'">
						<text v-if="isDeviceBound" class="monitor-action-text">暂无数据</text>
						<text v-else class="monitor-action-btn">去记录</text>
					</view>
				</view>
			</view>
			<view class="monitor-item" :style="`${isDefaultStyle?'':'font-size: 13px;'}`" @click="toSteps">
				<image class="monitor-item-icon" mode="widthFix"
					src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/monitor/steps.png" />
				<text class="monitor-item-label">步数：</text>
				<view class="monitor-progress-container">
					<progress class="monitor-progress" :percent="fetchStepPercent" stroke-width="15"
						activeColor="#0088BB" active="true" duration="3" />
				</view>
				<view class="monitor-item-right">
					<view class="monitor-progress-desc">
						<text>{{stepsToday}}</text>
						<text v-if="stepsToday < 10000" style="color: #c0c0c0;"> / 10000步</text>
						<text v-else>步</text>
					</view>
				</view>
			</view>
			<view class="monitor-item" :style="`${isDefaultStyle?'':'font-size: 13px;'}`" @click="toEat">
				<image class="monitor-item-icon" mode="widthFix"
					src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/monitor/eat.png" />
				<text class="monitor-item-label">饮食：</text>
				<view class="monitor-progress-container">
					<progress class="monitor-progress" :percent="fetchEatPercent" stroke-width="15"
						activeColor="#5EC29C" active="true" duration="3" />
				</view>
				<view class="monitor-item-right">
					<view class="monitor-progress-desc">
						<text>{{eatToday}}</text>
					</view>
					<view v-if="eatToday == '--'" class="monitor-action-btn">
						<text>去记录</text>
					</view>
				</view>
			</view>
			<view class="monitor-item" :style="`${isDefaultStyle?'':'font-size: 13px;'}`" @click="toFeelings">
				<image class="monitor-item-icon" mode="widthFix"
					src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/monitor/feelings.png" />
				<text class="monitor-item-label">心情：</text>
				<view class="monitor-progress-container">
					<progress class="monitor-progress" :percent="fetchFeelingPercent" stroke-width="15"
						activeColor="#F1C96A" active="true" duration="3" />
				</view>
				<view class="monitor-item-right">
					<view class="monitor-progress-desc">
						<text>{{feelingsToday}}</text>
					</view>
					<view v-if="feelingsToday == '--'" class="monitor-action-btn">
						<text>去记录</text>
					</view>
				</view>
			</view>
			<view v-if="hasOxygen" class="monitor-item">
				<image class="monitor-item-icon" mode="widthFix"
					src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/monitor/oxygen_b.png" />
				<text class="monitor-item-label">耐力：</text>
				<oxygen-progress style="flex: 1" :oxygenData="fetchOxygenData" />
				<view class="monitor-item-right">
					<view class="monitor-progress-desc">
						<text>{{oxygenToday}}</text>
					</view>
					<view class="monitor-action-btn" @click="fetchOxygen">
						<text>重新测量</text>
					</view>
				</view>
			</view>
		</view>
		<!-- 健康可视化区域 -->
		<view v-if="showChart" class="flex-column">
			<!-- <wave-chart  ref="wavechart" from="healthMonitor" class="chart-container shadow" /> -->
			<!-- <wave-chart  ref="ecgwavechart" from="ecg" class="chart-container shadow" /> -->
			<score-chart ref="scorechart" from="healthMonitor" :scoreObject="monitorData?.score" />
			<pulse-chart ref="pulsechart" from="healthMonitor" :pulseObject="monitorData?.pulse" />
			<pulse-trend v-if="isDeviceBound" ref="pulsetrend" from="healthMonitor" />
			<pulse-dist v-if="isDeviceBound" ref="pulsedist" :report="currentReport" from="healthMonitor"
				class="chart-container shadow" />
			<scatter-chart v-if="isDeviceBound" ref="scatterchart" from="healthMonitor"
				class="chart-container shadow" />
			<sleep-chart ref="sleepchart" from="healthMonitor" :sleepObject="monitorData?.sleep" />
			<step-chart ref="stepchart" from="healthMonitor" :stepObject="monitorData?.steps" />
			<eat-chart ref="eatchart" from="healthMonitor" :eatObject="monitorData?.eat" />
			<feeling-chart ref="feelingchart" from="healthMonitor" :feelingObject="monitorData?.feelings" />
		</view>
		<!-- 弹窗 -->
		<uni-popup ref="popupResult" type="dialog" mask-background-color="rgba(0, 0, 0, 0.7)" @maskClick="closePopup">
			<popup-result ref="resultContent" mode="base" @closePopup="closePopup" />
		</uni-popup>
		<!-- 快捷登录组件 -->
		<uni-id-pages-fab-login style="display: none;" ref="uniFabLogin" />
	</view>
</template>

<script>
	import {
		getDateToday,
		getNowTime,
		traversalTime
	} from '@/common/utils/timestamp.js';
	import pulseProgress from './pulseprogress.vue';
	import sleepProgress from './sleepprogress.vue';
	import oxygenProgress from './oxygenProgress.vue';
	import chart from '@/components/smartchart/chart.vue';
	import stepChart from '@/components/smartchart/stepchart.vue';
	import eatChart from '@/components/smartchart/eatchart.vue';
	import feelingChart from '@/components/smartchart/feelingchart.vue';
	import sleepChart from '@/components/smartchart/sleepchart.vue';
	import pulseChart from '@/components/smartchart/pulsechart.vue';
	import pulseTrend from '@/components/smartchart/pulsetrend.vue';
	import pulseDist from '@/components/smartchart/pulsedist.vue';
	import scatterChart from '@/components/smartchart/scatterchart.vue';
	import scoreChart from '@/components/smartchart/scorechart.vue';
	import waveChart from '@/components/smartchart/wavechart.vue';
	import popupResult from '@/components/popup/popup-result.vue';
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store.js';
	import {
		arrayBufferToString
	} from '@/common/utils/chat';
	import {
		getSleepFromScore,
		monitorUpdate,
		updateSleep,
		getWeChatSteps,
		updateDeviceReport,
		syncSleepData,
		getPulseScore,
		getSleepScore,
		getFeelingScore,
		getEatScore,
		getStepScore,
		getSoftScore,
		getDeviceScore,
		getDeviceHealth,
		LEVEL_RANGE,
		fetchMonitor,
		VO2_STANDARD,
		getHeartAge
	} from '@/common/js/monitor';
	import {
		updateUserInfo
	} from '@/common/js/device';
	export default {
		data() {
			return {
				//标志位
				showChart: true,
				showOxygen: true,
				isLoading: false,
				isWriting: false,
				isUpdated: false,
				isPopup: false, // 是否显示弹窗
				// 缓存数据
				score: store.userConfig.dailyTips?.score,
				dailyTips: store.userConfig.dailyTips?.tips,
				updateTime: store.userConfig.dailyTips?.updateTime,
				deviceReports: store.getDeviceReports(),
				// 显示数据
				monitorData: undefined,
				deviceData: undefined,
				reportToday: undefined,
				healthLevel: undefined,
				// 样式
				textColor: '#FFFFFF',
				backgroundColor: '#4C5382',
				gradientColor: 'monitor-purple'
			}
		},
		components: {
			sleepProgress,
			pulseProgress,
			oxygenProgress,
			chart,
			scoreChart,
			pulseChart,
			pulseTrend,
			pulseDist,
			scatterChart,
			sleepChart,
			stepChart,
			eatChart,
			feelingChart,
			waveChart,
			popupResult
		},
		computed: {
			hasSessionKey() {
				return store.sessionKey?.length > 0;
			},
			hasAuthorized() {
				return store.hasLogin && this.hasSessionKey;
			},
			isDefaultStyle() {
				return store.userConfig.fontStyle == 'normal';
			},
			healthTitle() {
				return this.isDeviceBound ? '今日心脏健康' : '今日健康指数';
			},
			isAF() {
				return this.reportToday?.afRisk?.classification == 'AF';
			},
			afText() {
				return this.reportToday?.afRisk?.confidence + '%';
			},
			deviceScore() {
				if (this.isAF) {
					this.healthLevel = 2;
					const level = LEVEL_RANGE[this.healthLevel];
					this.textColor = level.textColor;
					this.backgroundColor = level.backgroundColor;
					this.gradientColor = level.gradientColor;
					return '房颤风险';
				} else if (this.healthLevel) {
					const level = LEVEL_RANGE[this.healthLevel];
					this.textColor = level.textColor;
					this.backgroundColor = level.backgroundColor;
					this.gradientColor = level.gradientColor;
					return level.text;
				} else if (this.score && this.score != '暂无数据') {
					const scoreNumber = Number(this.score.substring(0, this.score.length - 1));
					const level = getDeviceHealth(scoreNumber);
					this.textColor = level.textColor;
					this.backgroundColor = level.backgroundColor;
					this.gradientColor = level.gradientColor;
					return level.text;
				} else {
					return '暂无数据';
				}
			},
			isCacheValid() {
				if (this.isLoading) {
					return true;
				} else if (this.isUpdated) {
					return false;
				} else {
					const currentTime = "更新于 " + getNowTime();
					const currentDate = currentTime.substring(0, 14);
					const updateDate = this.updateTime?.substring(0, 14);
					return currentDate == updateDate;
				}
			},
			isDeviceBound() {
				return store.isDeviceBound();
			},
			hasDeviceReports() {
				return this.deviceReports?.length > 0;
			},
			isNoNeedUpdate() {
				return this.hasDeviceReports && this.hasTips && this.isCacheValid;
			},
			currentReport() {
				return this.deviceReports[store.userConfig.reportIndex];
			},
			tipText() {
				return this.isUpdated ? '(有更新)' : '(已过期)';
			},
			reportText() {
				let text = '[ 由心脉AI评估 ]';
				if (this.hasDeviceReports) {
					const latestData = this.currentReport.businessData;
					if (this.showOxygen && !this.hasOxygen) {
						text = `心脉AI：运动健康新玩法 -> `;
					} else
					if (String(latestData.EndTime).slice(0, 10) == getDateToday()) {
						text = `今日数据已同步，点击查看报告 ->`;
					} else {
						text = `设备数据已同步，点击查看报告 ->`;
					}
				}
				return text;
			},
			actionText() {
				return this.isUpdated ? '点击更新' :
					(this.isCacheValid && this.hasDeviceReports ? (this.showOxygen && !this.hasOxygen ? '测测心脏年龄' :
						'查看报告') : '重新评估');
			},
			healthSeries() {
				return store.userConfig.monitor;
			},
			hasOxygen() {
				return store.userConfig.monitor[5].value > 0;
			},
			stepsToday() {
				return store.userConfig.monitor[0].value;
			},
			eatToday() {
				return store.userConfig.monitor[1].text;
			},
			feelingsToday() {
				return store.userConfig.monitor[2].text;
			},
			sleepToday() {
				return store.userConfig.monitor[3].text;
			},
			pulseToday() {
				return store.userConfig.monitor[4].text;
			},
			oxygenToday() {
				return store.userConfig.monitor[5].text;
			},
			fetchStepPercent: function() {
				return getStepScore();
			},
			fetchEatPercent: function() {
				return getEatScore();
			},
			fetchFeelingPercent: function() {
				return getFeelingScore();
			},
			fetchSleepPercent: function() {
				return getSleepScore();
			},
			fetchPulsePercent: function() {
				return getPulseScore();
			},
			hasSleepQuality: function() {
				const sleepData = store.userConfig.monitor[3];
				return sleepData?.date == getDateToday() && sleepData.quality?.effectiveTime > 0;
			},
			hasDevicePulse: function() {
				return this.isDeviceBound && store.userConfig.monitor[4].value > 0;
			},
			fetchSleepQuality: function() {
				return store.userConfig.monitor[3].quality;
			},
			fetchPulseData: function() {
				const pulse = store.userConfig.monitor[4].value;
				const rate = store.userConfig.monitor[4].data || 0;
				return {
					pulse: pulse,
					rate: rate
				};
			},
			fetchOxygenData: function() {
				const oxygenMonitor = store.userConfig.monitor[5];
				return {
					oxygen: oxygenMonitor.value,
					state: oxygenMonitor.text,
					rate: oxygenMonitor.data || 0
				};
			},
			hasTips: function() {
				return this.dailyTips?.length > 0;
			}
		},
		onLoad() {
			uni.$on('loginSuccess', this.refreshChart);
			uni.$on('monitorUpdate', (type) => {
				this.isUpdated = true;
			});
			if (store.hasLogin) {
				fetchMonitor(this.onFetched);
				this.getWechatData();
			}
		},
		onUnload() {
			uni.$off('loginSuccess');
			uni.$off('monitorUpdate');
		},
		onShareTimeline: function() {
			let query = "";
			if (store.hasInviteCode()) {
				query = `uniInvitationCode=${store.userInfo.inviteCode}`;
			}
			return {
				title: "心脉AI：持续守护您和家人的心血管健康",
				query: query
			};
		},
		onShareAppMessage: async function() {
			let path = 'pages/monitor/healthmonitor';
			if (store.hasInviteCode()) {
				path += `?uniInvitationCode=${store.userInfo.inviteCode}`;
			}
			return {
				title: "心脉AI：持续守护您和家人的心血管健康",
				path: path
			};
		},
		methods: {
			toJson: function() {
				const steps = this.stepsToday;
				const eat = store.userConfig.monitor[1].value;
				const feelings = store.userConfig.monitor[2].value;
				const pulse = store.userConfig.monitor[4].value;
				const sleep = store.userConfig.monitor[3].value;
				const question =
					`我今天走了${steps}步，饮食${eat == '--' ? '未记录' : eat}，心情${feelings == '--' ? '未记录' : feelings}，睡眠${sleep == '--' ? '未测量' : sleep}, 心率${pulse > 0 ? pulse + '次/分':'未测量'}。请按照如下格式输出，如果没有找到相关字段，则无需输出：{ "steps": "xx", "feelingScore": "xx", "sleepScore": "xx", "pulse": "xx" }`;
				uni.navigateTo({
					url: `/modules/health/pages/jsonization?question=${question}`
				});
			},
			toDual(number) {
				let output = number + '';
				if (output.length == 1) {
					output = '0' + output;
				}
				return output;
			},
			authorize: function(e) {
				if (e.detail?.errMsg != "getPhoneNumber:ok") {
					console.log("HealthMonitor, quickLogin, failed: ", e.detail?.errMsg)
					return;
				}
				let options = {}
				if (e.detail?.code) {
					options.phoneNumberCode = e.detail.code
				}
				store.isLoginToast = false;
				this.$refs.uniFabLogin.login_before('weixin', true, options)
			},
			onFetched: function(data) {
				this.monitorData = data;
				this.healthLevel = data.pulse.healthLevel;
				if (this.isDeviceBound) {
					const onSuccess = (deviceData, latestReport) => {
						const pulseRisk = store.userConfig.monitor[4].risk;
						latestReport.expert = {
							trendRisk: pulseRisk.trendRisk,
							distRisk: pulseRisk.distRisk,
							scatterRisk: pulseRisk.scatterRisk
						};
						this.reportToday = latestReport;
						this.isUpdated = true;
						syncSleepData(deviceData, () => {
							this.refreshChart();
							this.fetchTips();
						});
					};
					const onFail = () => {
						this.refreshChart();
						this.fetchTips();
					};
					updateDeviceReport(onSuccess, onFail);
				} else if (this.isCacheValid) {
					// 无需刷新：无设备数据，且缓存有效
				} else {
					this.refreshChart();
					this.fetchTips();
				}
			},
			refreshChart: function() {
				this.showChart = false;
				this.$nextTick(() => {
					this.showChart = true;
				});
			},
			updateDailyTips: function(writingContent) {
				store.userConfig.dailyTips = {
					score: this.score,
					tips: writingContent,
					updateTime: this.updateTime
				};
				uni.setStorage({
					key: 'dailyTips',
					data: store.userConfig.dailyTips
				});
			},
			onStepsUpdated() {
				this.isUpdated = true;
			},
			getWechatData() {
				store.sessionKey = uni.getStorageSync('sessionKey');
				if (this.hasSessionKey) {
					getWeChatSteps(this.onStepsUpdated);
				}
			},
			actionEvent: function() {
				if (this.isNoNeedUpdate) {
					if (this.showOxygen && !this.hasOxygen) {
						this.fetchOxygen();
					} else {
						uni.navigateTo({
							url: '/modules/health/pages/healthreport'
						});
					}
				} else {
					this.refreshChart();
					this.fetchTips();
				}
			},
			fetchScore: function() {
				this.isLoading = true;
				this.isWriting = false;
				const scoreNumber = this.isDeviceBound ? getDeviceScore(this.reportToday) : getSoftScore();
				this.score = scoreNumber == 0 ? '暂无数据' : (scoreNumber + '分');
				this.updateTime = "更新于 " + getNowTime();
				monitorUpdate({
					score: scoreNumber
				});
			},
			fetchTips: function() {
				this.fetchScore();
				const steps = this.stepsToday;
				const eat = store.userConfig.monitor[1].text;
				const feelings = store.userConfig.monitor[2].text;
				const sleep = store.userConfig.monitor[3].text;
				const pulse = store.userConfig.monitor[4].value;
				const id = Date.now();
				if (this.isDeviceBound) {
					let stepPrompt = `走了${steps}步，`;
					let eatPrompt = `饮食${eat == '--' ? '未录入' : eat}，`;
					let feelingPrompt = `心情${feelings == '--' ? '未录入' : feelings}，`;
					let sleepPrompt = `昨晚睡眠${sleep == '--' ? '未录入' : sleep}，`;
					const awakeningTimes = this.reportToday?.MedicineSleepQuality.AwakeningTimes;
					if (awakeningTimes && awakeningTimes > 0) {
						sleepPrompt += `中途醒来${awakeningTimes}次，`;
					}
					let pulsePrompt = `平均心率${pulse == 0 ? '未录入' : pulse + '次/分'}，`;
					const trendRisk = this.reportToday?.HeartRateVariability.TrendRisk;
					if (trendRisk && trendRisk > 0.05) {
						pulsePrompt += `心率趋势图中部分心率过高，`
					}
					const scatterRisk = this.reportToday?.HeartRateVariability.ScatterRisk;
					if (scatterRisk && scatterRisk > 0.05) {
						pulsePrompt += `心率散点图中有部分散点波动太大，`
					}
					const riskPrompt = pulse == 0 ? '' : `目前处于${this.deviceScore}状态，`;
					const question =
						`${stepPrompt}${eatPrompt}${feelingPrompt}${sleepPrompt}${pulsePrompt}${riskPrompt}请根据监测数据和提供的信息，用不超过80字描述我今天心脏健康状况与建议`;
					console.log("HealthMonitor, 心脏健康评估，question = \n" + question);
					this.requestDailyTips(question, id);
				} else {
					const question =
						`我今天走了${steps}步，饮食${eat == '--' ? '一般' : eat}，心情${feelings == '--' ? '一般' : feelings}，睡眠${sleep == '--' ? '未测量' : sleep}， 心率${pulse > 0 ? pulse + '次/分':'未测量'}。请用不超过80字，描述我今天的健康状况并激励`;
					console.log("HealthMonitor, 健康指数评估，question = \n" + question);
					this.requestDailyTips(question, id);
				}
			},
			fetchOxygen: function() {
				/**
				 * 最大摄氧量（心肺耐力）＝ 15 × 最大心率 ÷ 静息心率（夜间最低心率）
				 * 最大心率＝220-年龄
				 * 男性：50 ml/kg/min
				 * 女性：45 ml/kg/min
				 */
				if (store.userInfo.age && store.userInfo.age > 0) {
					this.oxygenReady();
				} else {
					this.oxygenInput();
				}
			},
			showAgeModal: function() {
				const that = this;
				uni.showModal({
					title: `请输入您的年龄：`,
					confirmColor: '#4C5382',
					confirmText: "确定",
					showCancel: true,
					cancelText: "取消",
					cancelColor: '#808080',
					editable: true,
					placeholderText: ' 年龄范围：20 ~ 90',
					success(res) {
						if (!res.confirm) {
							return;
						}
						const resInfo = {
							data: {
								age: -1,
								gender: store.userInfo.gender
							},
							errMsg: undefined
						};
						let ageStr = res.content?.trim();
						if (ageStr?.length > 0) {
							const isNumber = /^\d+$/.test(ageStr);
							if (isNumber) {
								resInfo.data.age = parseInt(ageStr);
								if (resInfo.data.age < 20 || resInfo.data.age > 90) {
									resInfo.errMsg = '超出了正常年龄范围';
								}
							} else {
								resInfo.errMsg = '输入的年龄不是数字';
							}
						} else {
							resInfo.errMsg = '年龄不能为空';
						}
						if (resInfo.errMsg?.length > 0) {
							uni.showToast({
								icon: 'none',
								title: resInfo.errMsg,
								duration: 2000
							});
						} else {
							store.userInfo.age = resInfo.data.age;
							that.oxygenReady();
							updateUserInfo(store.userInfo._id, resInfo.data);
						}
					}
				});
			},
			showGenderModal: function() {
				const that = this;
				uni.showModal({
					title: `请输入您的性别：`,
					confirmColor: '#4C5382',
					confirmText: "确定",
					showCancel: true,
					cancelText: "取消",
					cancelColor: '#808080',
					editable: true,
					placeholderText: ' 男 | 女',
					success(res) {
						if (!res.confirm) {
							return;
						}
						const resInfo = {
							data: {
								gender: 0
							},
							errMsg: undefined
						};
						let genderStr = res.content?.trim();
						if (genderStr?.length > 0) {
							if (genderStr == '男') {
								resInfo.data.gender = 1;
							} else if (genderStr == '女') {
								resInfo.data.gender = 2;
							} else {
								resInfo.errMsg = '输入的性别有误';
							}
						} else {
							resInfo.errMsg = '性别不能为空';
						}
						if (resInfo.errMsg?.length > 0) {
							uni.showToast({
								icon: 'none',
								title: resInfo.errMsg,
								duration: 2000
							});
						} else {
							store.userInfo.gender = resInfo.data.gender;
							if (store.userInfo.age && store.userInfo.age > 0) {
								that.oxygenReady();
								updateUserInfo(store.userInfo._id, resInfo.data);
							} else {
								that.showAgeModal();
							}
						}
					}
				});
			},
			oxygenInput: function() {
				this.showGenderModal();
			},
			oxygenReady: function() {
				const that = this;
				uni.showModal({
					title: '注意事项：',
					content: `①确保智能监测仪已绑定 \n②确认监测带连接至电源 \n③平躺在智能监测仪上方 \n④静卧一分钟，开始测量 `,
					confirmColor: '#4C5382',
					confirmText: "开始测量",
					showCancel: true,
					cancelText: "取消",
					cancelColor: '#808080',
					success(res) {
						if (res.confirm) {
							that.calcOxygen();
						}
					}
				});
			},
			calcOxygen: function() {
				uni.showLoading({
					title: '测量中...',
					mask: true
				});
				let oxygenValue = 0;
				let heartAge = store.userInfo.age;
				const onComplete = (beats) => {
					let minRate = 0;
					for (let i = 0; i < beats.length; i++) {
						const el = beats[i];
						if (el.heartRate != 0 && (minRate == 0 || el.heartRate < minRate)) {
							minRate = el.heartRate;
						}
					}
					const maxRate = 220 - store.userInfo.age;
					const oxygen = minRate > 0 ? 15 * maxRate / minRate : 0;
					heartAge = getHeartAge(oxygen, store.userInfo.gender);
					const standard = VO2_STANDARD;
					if (oxygen > standard.good) {
						store.userConfig.monitor[5].text = '不错';
					} else if (oxygen > standard.normal) {
						store.userConfig.monitor[5].text = '良好';
					} else if (oxygen > standard.bad) {
						store.userConfig.monitor[5].text = '一般';
					} else if (oxygen > 0) {
						store.userConfig.monitor[5].text = '较差';
					} else {
						store.userConfig.monitor[5].text = '--';
					}
					store.userConfig.monitor[5].data = Number(oxygen / standard.maxOxygen).toFixed(2);
					oxygenValue = Math.round(oxygen);
					console.log('HealthMonitor, calc oxygen complete: value = ' + oxygenValue);
					uni.hideLoading();
					this.oxygenModal(oxygenValue, heartAge);
				};
				const onFail = (err) => {
					console.log('HealthMonitor, calc oxygen failed: value = ' + oxygenValue);
				};
				uni.http.streamBeats(onComplete, onFail);
			},
			calcVo2Max: function() {
				const oxygen = store.userConfig.monitor[5].value;
				const standard = VO2_STANDARD;
				if (oxygen > standard.good) {
					store.userConfig.monitor[5].text = '不错';
				} else if (oxygen > standard.normal) {
					store.userConfig.monitor[5].text = '良好';
				} else if (oxygen > standard.bad) {
					store.userConfig.monitor[5].text = '一般';
				} else if (oxygen > 0) {
					store.userConfig.monitor[5].text = '较差';
				} else {
					store.userConfig.monitor[5].text = '--';
				}
				store.userConfig.monitor[5].data = Number(oxygen / standard.maxOxygen).toFixed(2);
			},
			oxygenModal: function(vo2max = 0, heartAge = 0) {
				if (vo2max > 0) {
					store.userConfig.monitor[5].value = vo2max;
					monitorUpdate({
						vo2max: vo2max
					});
					this.showPopup(vo2max, heartAge);
				} else {
					uni.showModal({
						content: `未采集到您的实时心率`,
						confirmColor: '#4C5382',
						confirmText: "知道了",
						showCancel: false
					});
				}
			},
			isTipDataValid: function(data) {
				return typeof data === 'object' && data !== null && typeof data.content === 'string' &&
					data.content.trim() !== '';
			},
			handleTipData: function(text) {
				const lines = text.split('\n');
				const data = [];
				const parseErrors = [];
				for (let i = 0; i < lines.length; i++) {
					let str = lines[i].trim();
					str = str.substring(str.indexOf('{'));
					if (str !== '') {
						try {
							const parsedData = JSON.parse(str);
							if (this.isTipDataValid(parsedData)) {
								data.push({
									...parsedData
								});
							} else {
								parseErrors.push(str);
							}
						} catch (error) {
							parseErrors.push(str);
						}
					}
				}
				return data;
			},
			requestDailyTips: function(question, id) {
				this.isWriting = true;
				const requestData = {
					input: {
						repo: "",
						question: question
					}
				};
				this.dailyTips = "评估中...";
				let writingIndex = 0;
				let writingContent = "";
				let writingTimer;
				let writingEnded = false;
				const stopWriting = () => {
					clearInterval(writingTimer);
					this.isWriting = false;
					writingIndex = 0;
					writingContent = "";
				};
				uni.http.streamWx('medical', id, requestData, // 注意，streamWx方法的参数顺序固定，不能变动
					(success, res) => {
						console.log("HealthMonitor, 健康评估成功");
					}, (fail, err) => {
						console.log("HealthMonitor, 健康评估失败: ", err);
						//用户主动中断请求，不进行提示
						if (fail.errMsg != 'request:fail abort') {
							console.log("HealthMonitor, 服务器网络异常，请重试");
						}
					}, (complete, id, input) => {
						console.log("HealthMonitor, stop loading");
						writingEnded = true;
						this.isLoading = false;
						this.isUpdated = false;
					}, onHeadersReceivedCallBack => {}, (onChunkReceivedCallBack, id, input) => {
						const requestData = arrayBufferToString(onChunkReceivedCallBack.data);
						const lines = this.handleTipData(requestData);
						lines.forEach(line => {
							writingContent += line.content;
						});
						if (!writingTimer) {
							writingTimer = setInterval(() => {
								if (this.isWriting && writingIndex < writingContent.length) {
									if (this.dailyTips == "评估中...") {
										this.dailyTips = "";
									}
									this.dailyTips += writingContent.charAt(writingIndex);
									writingIndex++;
								} else if (!this.isWriting && writingEnded) {
									stopWriting();
								}
							}, 50);
						}
					}
				);
			},
			toSteps: function(item) {
				store.userConfig.monitorTemp = this.monitorData?.steps;
				uni.navigateTo({
					url: '/pages/monitor/stepmonitor'
				});
			},
			toEat: function(item) {
				store.userConfig.monitorTemp = this.monitorData?.eat;
				uni.navigateTo({
					url: '/pages/monitor/eatmonitor'
				});
			},
			toFeelings: function(item) {
				store.userConfig.monitorTemp = this.monitorData?.feelings;
				uni.navigateTo({
					url: '/pages/monitor/feelingmonitor'
				});
			},
			toSleep: function(item) {
				store.userConfig.monitorTemp = this.monitorData?.sleep;
				uni.navigateTo({
					url: '/pages/monitor/sleepmonitor'
				});
			},
			toPulse: function(item) {
				store.userConfig.monitorTemp = this.monitorData?.pulse;
				uni.navigateTo({
					url: '/pages/monitor/pulsemonitor'
				});
			},
			showPopup: function(vo2max, heartAge) {
				this.showChart = false;
				this.$refs.resultContent.update(vo2max, heartAge);
				this.$refs.popupResult.open();
			},
			closePopup() {
				this.$refs.popupResult.close();
				this.showChart = true;
			}
		}
	}
</script>

<style>
	page {
		background-color: #f6f6f6;
	}

	.monitor-container {
		display: flex;
		flex-direction: column;
		background-color: #f6f6f6;
	}

	.monitor-gradient {
		display: flex;
		flex-direction: row;
		position: absolute;
		top: 0px;
		width: 100%;
		height: 400px;
	}

	.monitor-purple {
		background: linear-gradient(180deg, #4C5382 0%, #F6F6F6 100%);
	}

	.monitor-orange {
		background: linear-gradient(180deg, #4C5382 40%, #F6F6F6 100%);
	}

	.monitor-red {
		background: linear-gradient(180deg, #4C5382 40%, #F6F6F6 100%);
	}

	.monitor-top {
		display: flex;
		flex-direction: row;
		z-index: 10;
	}

	.monitor-evaluate-result {
		display: flex;
		flex-direction: column;
		flex: 1;
	}

	.monitor-title {
		display: flex;
		flex-direction: row;
		margin: 15px 20px 0px;
		align-items: center;
	}

	.monitor-title-text {
		font-size: 16px;
		font-weight: bold;
		color: white;
	}

	.monitor-device-icon {
		width: 21px;
		height: 21px;
		margin-left: 6px;
	}

	.monitor-subtitle {
		font-size: 9px;
		color: white;
		margin: 10px 18px 5px 24px;
	}

	.monitor-highlight {
		display: flex;
		flex-direction: row;
		font-weight: bold;
		align-items: center;
	}

	.monitor-evaluate-container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		margin-right: 20px;
		padding: 10px 15px;
		margin-top: 10px;
	}

	@keyframes sparkle {
		0% {
			opacity: 0.3;
		}

		50% {
			opacity: 1.0;
		}

		100% {
			opacity: 0.3;
		}
	}

	.sparkle-animation {
		margin: 0px 6px;
		/* animation: sparkle 2s linear infinite; */
		/* 设置动画持续时间为2秒，线性变化无限次 */
	}

	.monitor-score {
		font-size: 42px;
		font-weight: bold;
		color: white;
		margin-top: 20px;
	}

	.monitor-device-score {
		display: flex;
		flex-direction: row;
		align-items: baseline;
		font-size: 21px;
		font-weight: bold;
		color: white;
		margin-top: 20px;
		margin-bottom: 6px;
	}

	.monitor-time {
		font-size: 8px;
		color: white;
		margin: 3px 0px 5px 0px;
	}

	.monitor-evaluate {
		position: relative;
		align-self: flex-end;
		min-width: 96px;
		padding: 0px 10px;
		margin: 15px 0px 0px;
		color: white;
		border-radius: 20px;
		font-size: 12px;
		line-height: 30px;
		text-align: center;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.monitor-evaluate:active {
		opacity: 0.8;
	}

	.monitor-content {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.monitor-tips {
		font-size: 12px;
		color: white;
		margin: 10px 18px 0px 24px;
	}

	.monitor-data-container {
		z-index: 10;
		display: flex;
		flex-direction: column;
		margin: 20px 20px;
		padding-top: 10px;
		border-radius: 10px;
		background-color: #FFFFFF;
	}

	.monitor-item {
		display: flex;
		flex-direction: row;
		align-items: center;
		font-size: 12px;
		color: #303030;
		margin: 0px 10px 10px;
	}

	.monitor-item-icon {
		width: 15px;
		margin-right: 6px;
	}

	.monitor-item-label {
		width: 39px;
		margin-right: 3px;
	}

	.monitor-progress-container {
		flex: 1;
		width: auto;
		margin-right: 10px;
		border-radius: 20px;
		overflow: hidden;
	}

	.monitor-progress {}

	.monitor-item-right {
		display: flex;
		flex-direction: row;
		align-items: center;
		width: 90px;
	}

	.monitor-progress-desc {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.monitor-action-btn {
		color: #4C5382;
		padding: 0px 5px;
		font-weight: bold;
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.monitor-action-text {
		color: #A0A0A0;
		padding: 0px 5px;
	}

	.monitor-action-btn:active {
		opacity: 0.8;
	}

	.health-chart {
		flex: 1;
		margin-top: -38px;
	}

	.chart-container {
		z-index: 10;
		margin: 0px 20px 20px;
		background-color: white;
		border-radius: 10px;
		overflow: hidden;
	}
</style>