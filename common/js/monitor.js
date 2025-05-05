import {
	store
} from '@/uni_modules/uni-id-pages/common/store.js';
import {
	createDate,
	getDateFrom,
	getDateLastWeek,
	getDateToday,
	getRangeLastNight,
	getRangeToday,
	isNight,
	traversalTime
} from '@/common/utils/timestamp.js';
import {
	useDebounce
} from '@/common/utils/utils';
import {
	getMonitorPrompt
} from '@/modules/data/deviceInput.js';
import en from '@/lang/en.js';
import {
	uatob
} from '@/uni_modules/Sansnn-uQRCode/js_sdk/gcanvas/env/tool.js';

// 最大摄氧量标准
const VO2_STANDARD = store.userInfo.gender == 2 ? {
	bad: 15,
	normal: 25,
	good: 45,
	maxOxygen: 90
} : {
	bad: 20,
	normal: 30,
	good: 50,
	maxOxygen: 100
};

// 男性不同年龄对应的最大摄氧量数据
const maleAge = [20, 30, 40, 50, 60];
const maleVo2max = [50, 45, 36, 33, 30];

// 女性不同年龄对应的最大摄氧量数据
const femaleAge = [20, 30, 40, 50, 60];
const femaleVo2max = [48, 42, 32, 30, 26];

/**
 * 通过线性插值计算给定最大摄氧量对应的年龄
 * @param {number} vo2max - 最大摄氧量
 * @param {Array<number>} ageList - 年龄列表
 * @param {Array<number>} vo2maxList - 最大摄氧量列表
 * @returns {number|null} - 对应的年龄，如果未找到合适区间则返回 null
 */
function interpolateAge(vo2max, ageList, vo2maxList) {
	let age = '--';
	if (vo2max >= vo2maxList[0]) {
		age = ageList[0];
	}
	if (vo2max <= vo2maxList[vo2maxList.length - 1]) {
		age = ageList[ageList.length - 1];
	}
	for (let i = 0; i < vo2maxList.length - 1; i++) {
		if (vo2maxList[i + 1] <= vo2max && vo2max <= vo2maxList[i]) {
			// 线性插值公式：x = x1 + (x2 - x1) * (y - y1) / (y2 - y1)
			age = ageList[i] + (ageList[i + 1] - ageList[i]) * (vo2max - vo2maxList[i]) / (vo2maxList[i + 1] -
				vo2maxList[i]);
		}
	}
	return Math.floor(age);
}

/**
 * 根据最大摄氧量和性别获取心脏年龄
 * @param {number} vo2max - 最大摄氧量
 * @param {string} gender - 性别，'male' 或 'female'
 * @returns {number|null} - 心脏年龄，如果性别输入无效则抛出错误
 */
function getHeartAge(vo2max, gender) {
	if (gender === 'male') {
		return interpolateAge(vo2max, maleAge, maleVo2max);
	} else {
		return interpolateAge(vo2max, femaleAge, femaleVo2max);
	}
}

// 心脏健康等级
const LEVEL_RANGE = [{
	text: '非常健康',
	textColor: '#FFFFFF',
	backgroundColor: '#4C5382',
	gradientColor: 'monitor-purple'
}, {
	text: '轻度风险',
	textColor: '#F1C96A',
	backgroundColor: '#F1C96A',
	gradientColor: 'monitor-orange'
}, {
	text: '中度风险',
	textColor: '#FF8866',
	backgroundColor: '#FF8866',
	gradientColor: 'monitor-red'
}];

function getDeviceHealth(score) {
	return score >= 70 ? LEVEL_RANGE[0] : (score < 50 ? LEVEL_RANGE[2] : LEVEL_RANGE[1]);
}

// 更新每日健康状态
const monitorUpdate = useDebounce((data, date = getDateToday(), onSuccess = undefined) => {
	store.userConfig.monitorUpdated = true;
	const db = uniCloud.database();
	const query = store.hasLogin ? {
		uid: store.userInfo._id,
		date: date
	} : {
		did: store.userConfig.deviceID,
		date: date
	};
	db.collection('health-monitor').where(query).field("_id").get().then(res => {
		if (res?.result?.data.length > 0) {
			db.collection('health-monitor').where(query).update(data).then(updateRes => {
				onSuccess && onSuccess(updateRes);
			}).catch(err => {
				console.log('每日健康状态更新失败', err);
			});
		} else {
			db.collection('health-monitor').add({
				...query,
				...data
			}).then(updateRes => {
				onSuccess && onSuccess(updateRes);
			}).catch(err => {
				console.log('每日健康状态记录失败', err)
			});
		}
	}).catch(err => {});
}, 200);

// 同步设备睡眠数据
function syncSleepData(deviceData, onUpdated) {
	updateSleep(deviceData);
	const data = {
		pulse: deviceData.pulse,
		sleep: deviceData.sleep,
		sleepQuality: deviceData.sleepQuality,
		dataSource: 1
	};
	monitorUpdate(data, deviceData.date, (res) => {
		onUpdated && onUpdated();
	});
}

// 同步设备睡眠、心率数据
function syncDeviceData(deviceData, onUpdated) {
	updatePulse(deviceData);
	syncSleepData(deviceData, onUpdated);
}

function updatePulse(data) {
	const pulseData = store.userConfig.monitor[4];
	if (data.pulse || data.pulse == 0) {
		pulseData.value = data.pulse;
		if (data.pulse > 100) {
			pulseData.text = "过快";
		} else if (data.pulse > 75) {
			pulseData.text = "略快";
		} else if (data.pulse == 0) {
			pulseData.text = "--";
		} else if (data.pulse < 50) {
			pulseData.text = "略慢";
		} else if (data.pulse < 40) {
			pulseData.text = "过慢";
		} else {
			pulseData.text = "正常";
		}
		let score = 0;
		if (data.pulse == 0) {
			score = 0;
		} else if (data.pulse > 100 || data.pulse < 40) {
			score = 30;
		} else if (data.pulse > 75 || data.pulse < 50) {
			score = 60;
		} else {
			score = 100;
		}
		pulseData.data = Number(score / 100).toFixed(2);
		pulseData.date = data.pulse == 0 ? '' : data.date;
	}
	if (data.trendRisk || data.trendRisk == 0) {
		pulseData.risk.trendRisk = data.trendRisk;
		pulseData.risk.distRisk = data.distRisk;
		pulseData.risk.scatterRisk = data.scatterRisk;
		pulseData.risk.advice = data.advice;
	}
}

function updateSleep(data) {
	if (data.sleepQuality) {
		store.userConfig.monitor[3].quality = data.sleepQuality;
		const sleepScore = getSleepQualityScore(data.sleepQuality);
		store.userConfig.monitor[3].value = sleepScore;
		store.userConfig.monitor[3].text = getSleepText(sleepScore);
		store.userConfig.monitor[3].data = Number(Math.min(sleepScore, 90) / 90).toFixed(2);
		store.userConfig.monitor[3].date = data.date;
	} else {
		if (data.sleep == "good") {
			store.userConfig.monitor[3].value = 90;
			store.userConfig.monitor[3].text = "不错";
		} else if (data.sleep == "normal") {
			store.userConfig.monitor[3].value = 60;
			store.userConfig.monitor[3].text = "一般";
		} else if (data.sleep == "bad") {
			store.userConfig.monitor[3].value = 30;
			store.userConfig.monitor[3].text = "较差";
		} else {
			store.userConfig.monitor[3].value = 0;
			store.userConfig.monitor[3].text = "--";
		}
		store.userConfig.monitor[3].data = Number(store.userConfig.monitor[3].value / 90).toFixed(2);
		store.userConfig.monitor[3].date = data.date;
	}
}

function updateSteps(data) {
	if (data.steps || data.steps == 0) {
		store.userConfig.monitor[0].value = data.steps;
		store.userConfig.monitor[0].data = Number(Math.min(data.steps, 10000) / 10000).toFixed(2);
		store.userConfig.monitor[0].date = data.date;
	}
	if (data.vo2max && data.vo2max > 0) {
		const vo2max = data.vo2max;
		store.userConfig.monitor[5].value = vo2max;
		if (vo2max > VO2_STANDARD.good) {
			store.userConfig.monitor[5].text = '不错';
		} else if (vo2max > VO2_STANDARD.normal) {
			store.userConfig.monitor[5].text = '良好';
		} else if (vo2max > VO2_STANDARD.bad) {
			store.userConfig.monitor[5].text = '一般';
		} else if (vo2max > 0) {
			store.userConfig.monitor[5].text = '较差';
		} else {
			store.userConfig.monitor[5].text = '--';
		}
		store.userConfig.monitor[5].data = Number(vo2max / VO2_STANDARD.maxOxygen).toFixed(2);
	}
}

function updateEat(data) {
	if (data.eat == "good") {
		store.userConfig.monitor[1].value = 90;
		store.userConfig.monitor[1].text = "不错";
	} else if (data.eat == "normal") {
		store.userConfig.monitor[1].value = 60;
		store.userConfig.monitor[1].text = "一般";
	} else if (data.eat == "bad") {
		store.userConfig.monitor[1].value = 30;
		store.userConfig.monitor[1].text = "较差";
	} else {
		store.userConfig.monitor[1].value = 0;
		store.userConfig.monitor[1].text = "--";
	}
	store.userConfig.monitor[1].data = Number(store.userConfig.monitor[1].value / 90).toFixed(2);
	store.userConfig.monitor[1].date = data.date;
}

function updateFeelings(data) {
	if (data.feelings == "good") {
		store.userConfig.monitor[2].value = 90;
		store.userConfig.monitor[2].text = "不错";
	} else if (data.feelings == "normal") {
		store.userConfig.monitor[2].value = 60;
		store.userConfig.monitor[2].text = "一般";
	} else if (data.feelings == "bad") {
		store.userConfig.monitor[2].value = 30;
		store.userConfig.monitor[2].text = "较差";
	} else {
		store.userConfig.monitor[2].value = 0;
		store.userConfig.monitor[2].text = "--";
	}
	store.userConfig.monitor[2].data = Number(store.userConfig.monitor[2].value / 90).toFixed(2);
	store.userConfig.monitor[2].date = data.date;
}

function getSleepText(sleepScore) {
	let sleepText = "";
	if (sleepScore >= 90) {
		sleepText = "不错";
	} else if (sleepScore >= 60) {
		sleepText = "一般";
	} else {
		sleepText = "较差";
	}
	return sleepText;
}

function getSleepFromScore(sleepScore) {
	let sleep = "";
	if (sleepScore >= 90) {
		sleep = "good";
	} else if (sleepScore >= 60) {
		sleep = "normal";
	} else {
		sleep = "bad";
	}
	return sleep;
}

function getSleepQualityScore(sleepQuality) {

	const effectiveTime = sleepQuality.effectiveTime;
	const awakeningRate = sleepQuality.awakeningRate;
	const remRate = sleepQuality.remRate;
	const lightSleepRate = sleepQuality.lightSleepRate;
	const deepSleepRate = sleepQuality.deepSleepRate;

	const normalEffectiveTime = 8 * 60 * 60; // 8小时换算为秒
	const effectiveTimeScore = effectiveTime / normalEffectiveTime * 40;

	const awakeningRateScore = 10 * (1 - awakeningRate);
	const remRateScore = 10 - 2 * Math.abs(remRate - 0.05);
	const lightSleepRateScore = 20 - 2 * Math.abs(lightSleepRate - 0.5);
	const deepSleepRateScore = Math.min(20, Math.max(0, 10 + (deepSleepRate - 0.3) * 100));
	const totalScore = effectiveTimeScore + awakeningRateScore + remRateScore + lightSleepRateScore +
		deepSleepRateScore;

	return Math.round(totalScore);
}

function requestAllReports(mapping, params, onSuccess = undefined, onFail = undefined) {
	uni.request({
		url: 'https://chat.aicareme.cn/api/wechat/mqtt/sleepreport/page',
		method: 'GET',
		header: {
			'X-Auth-Token': uni.getStorageSync('uni_id_token'),
		},
		data: {
			...params
		},
		success: res => {
			if (res.code == 200 || res.statusCode == 200) {

				const data = res.data?.data;
				const dataList = data?.dataList;

				let nightStart = -1;
				let latestReport = undefined;

				const filterList = [];
				const nightReports = [];

				const nightRange = getRangeLastNight();

				const unique = params.sensorId ? true : false;

				for (let i = 0; i < dataList.length; i++) {
					const item = dataList[i];
					const mappingItem = mapping[item.sensorId];
					if (mappingItem) {
						item.uid = mappingItem.uid;
						item.username = mappingItem.address.username;
						item.telNumber = mappingItem.address.telNumber;
						item.businessData = JSON.parse(item.businessData);
						if (unique && isReportToday(item.businessData) && isReportInRange(item.businessData,
								nightRange)) {
							if (nightStart < 0) {
								nightStart = filterList.length;
								latestReport = item;
							}
							nightReports.push(item);
						}
						parseReportHRs(item.businessData);
						filterList.push(item);
					}
				}
				if (unique && nightStart != -1 && nightReports.length > 1) {
					mergeReport(nightReports);
					filterList.splice(nightStart + 1, nightReports.length - 1);
					// 反写醒来次数
					latestReport.businessData.MedicineSleepQuality.AwakeningTimes = nightReports.length - 1;
				}

				onSuccess && onSuccess(filterList, filterList.length == 0 ? 0 : data.totalCount);
			}
		},
		onFail: err => {
			console.log("Monitor, 管理员请求所有报告失败, err = ", err);
			onFail && onFail(err);
		}
	});
}

function requestDeviceReport(onSuccess = undefined, onFail = undefined, extra = undefined) {
	const today = getDateToday();
	if (!extra) {
		const reports = store.getDeviceReports();
		if (reports?.length > 0) {
			const latestReport = reports[0].businessData;
			if (isReportToday(latestReport, today)) {
				// 今日报告已生成，无需重复获取
				onSuccess && onSuccess(reports, today);
				return;
			}
		}
		extra = {
			pageNo: 1,
			pageSize: 10
		};
	}
	let sensorID = '';
	const products = store.userInfo.products;
	if (products?.length > 0) {
		sensorID = products[store.userConfig.productIndex].device?.sensorID;
	}
	uni.request({
		url: 'https://chat.aicareme.cn/api/wechat/mqtt/sleepreport/page',
		method: 'GET',
		header: {
			'X-Auth-Token': uni.getStorageSync('uni_id_token'),
		},
		data: {
			...extra,
			sensorId: sensorID
		},
		success: (res) => {
			if (res.code == 200 || res.statusCode == 200) {
				const data = res.data?.data;
				let dataList = data?.dataList;
				dataList?.forEach((item) => {
					const jsonString = item.businessData;
					item.businessData = JSON.parse(jsonString);
				});
				if (dataList?.length > 0) {
					onSuccess && onSuccess(dataList, today, data.totalCount);
				} else {
					dataList = [];
					store.setDeviceReports(dataList);
					onSuccess && onSuccess(dataList, today, 0);
				}
			}
		},
		onFail: (err) => {
			console.log("Monitor, 请求设备报告失败: ", err);
			onFail && onFail(err);
		}
	});
}

function updateDeviceReport(onUpdated = undefined, onFail = undefined) {
	requestDeviceReport((dataList, today) => {
		if (dataList.length == 0) {
			// 获取成功，设备没有报告
			console.log("Monitor, 请求的设备暂无报告");
			onFail && onFail();
			return;
		}
		let latestReport = dataList[0];
		if (String(latestReport.businessData.EndTime).slice(0, 10) != today) {
			// 最新数据不是今天的数据
			console.log("Monitor, 请求设备报告, 不是今天的数据: ", latestReport.businessData);
			store.setDeviceReports(dataList);
			onFail && onFail();
			return;
		}
		let nightStart = -1;
		const nightReports = [];
		const nightRange = getRangeLastNight();
		if (isReportInRange(latestReport.businessData, nightRange)) {
			nightStart = 0;
			store.userConfig.reportIndex = 0;
			nightReports.push(latestReport);
		}
		for (let i = 1; i < dataList.length; i++) {
			const report = dataList[i];
			const data = report.businessData;
			if (String(data.EndTime).slice(0, 10) != today) {
				break;
			} else if (isReportInRange(data, nightRange)) {
				if (nightStart < 0) {
					nightStart = i;
					latestReport = report;
					store.userConfig.reportIndex = i;
				}
				nightReports.push(report);
			}
		}
		if (nightStart != -1 && nightReports.length > 1) {
			mergeReport(nightReports);
			dataList.splice(nightStart + 1, nightReports.length - 1);
			// 反写醒来次数
			latestReport.businessData.MedicineSleepQuality.AwakeningTimes = nightReports.length - 1;
		}
		const qualityData = latestReport.businessData.MedicineSleepQuality;
		const sleepQuality = {
			effectiveTime: qualityData.TotalSleepTime,
			awakeningRate: qualityData.AwakeningRate,
			remRate: qualityData.REMRate,
			lightSleepRate: qualityData.LightSleepRate,
			deepSleepRate: qualityData.DeepSleepRate
		};
		const sleepScore = getSleepQualityScore(sleepQuality);
		// 反写报告分数
		latestReport.businessData.Grade = sleepScore;
		const deviceData = {
			sleep: getSleepFromScore(sleepScore),
			sleepQuality: sleepQuality,
			date: today
		};
		parseReportHRs(latestReport.businessData);
		const pulse = averageRate(latestReport.businessData)
		if (pulse > 0) {
			deviceData.pulse = pulse;
		}
		store.setDeviceReports(dataList);
		latestReport.businessData.afRisk = latestReport.afRisk;
		onUpdated && onUpdated(deviceData, latestReport.businessData);
	});
}

function mergeReport(reportList) {
	// 合并基础数据
	const reportF = reportList[0];
	const reportL = reportList[reportList.length - 1];
	reportF.startTime = reportL.startTime;
	const dataF = reportF.businessData;
	const dataL = reportL.businessData;
	dataF.MedicineSleepQuality.AsleepTime = dataL.MedicineSleepQuality.AsleepTime;
	dataF.MedicineSleepQuality.GoToBedTime = dataL.MedicineSleepQuality.GoToBedTime;
	// 抹除prompt和reportTips
	dataF.prompt = '';
	dataF.reportTips = '';
	for (let i = 1; i < reportList.length; i++) {
		const report = reportList[i];
		const data = report.businessData;
		// 合并心率数据
		if (dataF.HeartRateVariability.MaxHeartbeatRate < data.HeartRateVariability.MaxHeartbeatRate) {
			dataF.HeartRateVariability.MaxHeartbeatRate = data.HeartRateVariability.MaxHeartbeatRate;
		}
		if (dataF.HeartRateVariability.MinHeartbeatRate > data.HeartRateVariability.MinHeartbeatRate) {
			dataF.HeartRateVariability.MinHeartbeatRate = data.HeartRateVariability.MinHeartbeatRate;
		}
		if (data.StaticHRs?.length > 0) {
			dataF.StaticHRs = data.StaticHRs.concat(dataF.StaticHRs);
		} else if (!dataF.StaticHRs || dataF.StaticHRs.length == 0) {
			const endTime = createDate(data.EndTime).getTime();
			const startTime = createDate(dataF.StartTime).getTime();
			const offset = Math.round((startTime - endTime) / 60000);
			const beats = data.HeartRateVariability.HeartbeatRates.concat(new Array(offset).fill(0));
			dataF.HeartRateVariability.HeartbeatRates = beats.concat(dataF.HeartRateVariability.HeartbeatRates);
		}
		// 合并睡眠数据
		dataF.AllTotalSleepTime += data.AllTotalSleepTime;
		dataF.MedicineSleepQuality.TotalEffectiveSleepTime += data.MedicineSleepQuality.TotalEffectiveSleepTime;
		dataF.MedicineSleepQuality.TotalOnBedTime += data.MedicineSleepQuality.TotalOnBedTime;
		const TotalSleepTime = dataF.MedicineSleepQuality.TotalSleepTime + data.MedicineSleepQuality.TotalSleepTime;
		dataF.MedicineSleepQuality.AwakeningRate = (dataF.MedicineSleepQuality.TotalSleepTime * data
			.MedicineSleepQuality.AwakeningRate + data.MedicineSleepQuality.TotalSleepTime * data
			.MedicineSleepQuality.AwakeningRate) / TotalSleepTime;
		dataF.MedicineSleepQuality.LightSleepRate = (dataF.MedicineSleepQuality.TotalSleepTime * data
			.MedicineSleepQuality.LightSleepRate + data.MedicineSleepQuality.TotalSleepTime * data
			.MedicineSleepQuality.LightSleepRate) / TotalSleepTime;
		dataF.MedicineSleepQuality.DeepSleepRate = (dataF.MedicineSleepQuality.TotalSleepTime * data
			.MedicineSleepQuality.DeepSleepRate + data.MedicineSleepQuality.TotalSleepTime * data
			.MedicineSleepQuality.DeepSleepRate) / TotalSleepTime;
		dataF.MedicineSleepQuality.REMRate = (dataF.MedicineSleepQuality.TotalSleepTime * data.MedicineSleepQuality
				.REMRate + data.MedicineSleepQuality.TotalSleepTime * data.MedicineSleepQuality.REMRate) /
			TotalSleepTime;
		dataF.MedicineSleepQuality.TotalSleepTime = TotalSleepTime;
	}
	// 合并开始时间
	dataF.StartTime = dataL.StartTime;
}

function isReportToday(report, today = getDateToday()) {
	return String(report.EndTime).slice(0, 10) == today;
}

function isReportInRange(report, range) {
	const startTime = createDate(report.StartTime).getTime();
	const endTime = createDate(report.EndTime).getTime();
	return (startTime > range.startTime && startTime < range.endTime) ||
		(endTime > range.startTime && endTime < range.endTime);
}

function parseReportHRs(report) {
	const encodedHRs = report.StaticHRs;
	if (report.StaticHRsParsed || !encodedHRs || encodedHRs.length == 0) {
		console.log("Monitor, 心率数据已解析或没有数据");
		// 已解析过或没有数据
		return;
	}
	let sum = 0;
	let max = 0;
	let min = -1;
	let validLength = 0;
	let trendRisk = 0;
	let scatterRisk = 0;
	const start = createDate(report.StartTime).getTime();
	const end = createDate(report.EndTime).getTime();
	const range = Math.floor((end - start) / 60000);
	const HeartbeatRates = new Array(range).fill(0);
	const HeartbeatDist = new Array(8).fill(0); // [<40, <50, <60, <70, <80, <90, <100, >=100]
	for (let i = 0; i < encodedHRs.length; i++) {
		const el = encodedHRs[i];
		const millis = createDate(el.StartTime).getTime();
		let offset = Math.floor((millis - start) / 60000);
		const decodedBytes = uatob(el.HRs);
		if (!decodedBytes) {
			continue;
		}
		const values = [];
		for (let j = 0; j < decodedBytes.length; j++) {
			const value = decodedBytes.charCodeAt(j);
			values.push(value);
			const distIndex = Math.max(Math.floor((value + 10 - 40) / 10), 0);
			HeartbeatDist[distIndex] += 1;
			if (j % 29 == 0) {
				HeartbeatRates[offset] = value;
				offset += 1;
			}
			if (value > 100 || value < 40) {
				trendRisk += 1;
			}
			if (j > 0) {
				const last = values[j - 1];
				const x = Math.round(60000 / last);
				const y = Math.round(60000 / value);
				// 散点图模式45°对角矩形范围: [ y = x + 280 | y = x - 280 | y = -x + 1200 | y = -x + 3000 ]
				if (last > 0 && value > 0 && (y > x + 280 || y < x - 280 || y > -x + 3000 || y < -x + 1200)) {
					scatterRisk += 1;
				}
			}
			if (value > 0) {
				sum += value;
				validLength += 1;
			}

			max = Math.max(max, value);
			if (value != 0 && (min == -1 || value < min)) {
				min = value;
			}
		}
		if (values.length < 30) {
			const value = values[values.length - 1];
			HeartbeatRates[offset] = value;
		}
		// validLength += values.length;
	}
	if (validLength > 0) {
		report.HeartRateVariability.ValidLength = validLength;
		report.HeartRateVariability.TrendRisk = trendRisk / validLength;
		report.HeartRateVariability.ScatterRisk = scatterRisk / validLength;
		report.HeartRateVariability.ScatterRates = report.HeartRateVariability.HeartbeatRates;
		report.HeartRateVariability.HeartbeatRates = HeartbeatRates;
		report.HeartRateVariability.HeartbeatDist = HeartbeatDist;
		report.MedicineSleepQuality.HeartbeatRate = Math.round(sum / validLength);
	} else if (report.HeartRateVariability.HeartbeatRates?.length > 0) {
		const beatArray = report.HeartRateVariability.HeartbeatRates;
		sum = 0;
		for (let i = 0; i < beatArray.length; i++) {
			sum += beatArray[i];
		}
		report.MedicineSleepQuality.HeartbeatRate = Math.round(sum / beatArray.length);
	}
	report.StaticHRsParsed = true;
	if (max > 0) {
		report.HeartRateVariability.MaxHeartbeatRate = max;
	}
	if (min) {
		report.HeartRateVariability.MinHeartbeatRate = min;
	}
	report.isNightReport = isNight(report.StartTime, report.EndTime);
	report.MedicineSleepQuality.DeepSleepRate = Math.min(0.37, report.MedicineSleepQuality.DeepSleepRate);
}

function fetchReportTips(report, onSuccess = undefined, onFail = undefined, oldestReport = undefined) {
	const prompt = getMonitorPrompt(report, oldestReport);
	uni.request({
		url: 'https://www.aicareme.cn/medical/invoke', // API接口地址
		method: 'POST',
		data: {
			"input": {
				"repo": "",
				"question": prompt,
			}
		},
		success: (res) => {
			const content = res.data.output?.content;
			if (content?.length > 0) {
				report.reportTips = content;
				store.setDeviceReports();
				updateDailyReport(report, onSuccess);
			} else {
				onFail && onFail(res);
			}
		},
		fail: (err) => {
			console.log("Monitor, 获取每日健康建议 failed: ", err);
			onFail && onFail(err);
		}
	});
}

function updateDailyReport(report, onSuccess) {
	const today = getDateToday();
	const reportDate = String(report.MedicineSleepQuality.WakeTime).slice(0, 10);
	if (today != reportDate) {
		// 不是今天的数据
		onSuccess && onSuccess();
		return;
	}
	const isDailyReportToday = (today == store.userConfig.dailyReport?.date);
	let sleepQuality = store.userConfig.dailyReport.sleepQuality;
	const qualityData = report.MedicineSleepQuality;
	const better = !isDailyReportToday || (qualityData.TotalSleepTime > sleepQuality?.effectiveTime);
	if (better) {
		sleepQuality = {
			effectiveTime: qualityData.TotalSleepTime,
			awakeningRate: qualityData.AwakeningRate,
			remRate: qualityData.REMRate,
			lightSleepRate: qualityData.LightSleepRate,
			deepSleepRate: qualityData.DeepSleepRate
		};
		store.userConfig.dailyReport = {
			id: report.BasicReportID,
			date: today,
			sleepQuality: sleepQuality,
			content: report.reportTips
		};
		uni.setStorage({
			key: 'dailyReport',
			data: store.userConfig.dailyReport
		});
	}
	onSuccess && onSuccess(store.userConfig.dailyReport);
}

function getRunData(onUpdated) {
	wx.getWeRunData({
		success: function(res) {
			uniCloud.callFunction({
				name: "werun",
				data: {
					data: {
						appid: getApp().globalData.appid,
						sessionKey: store.sessionKey,
						encryptedData: res.encryptedData,
						iv: res.iv
					},
				},
			}).then((res) => {
				const stepList = res.result?.stepInfoList;
				if (stepList && stepList.length > 0) {
					const lastDate = store.userConfig.monitor[0].date;
					const stepInfo = stepList[stepList.length - 1];
					const date = getDateFrom(Number(stepInfo.timestamp + '000'));
					const step = Number(stepInfo.step);
					if (lastDate != date || store.userConfig.monitor[0].value != step) {
						store.userConfig.monitor[0].value = step;
						store.userConfig.monitor[0].data = Number(Math.min(step, 10000) / 10000)
							.toFixed(2);
						store.userConfig.monitor[0].date = date;
						onUpdated && onUpdated();
						monitorUpdate({
							steps: step,
						}, date);
					}
				}
			}).catch((err) => {
				console.log("Monitor, getRunData failed, err: ", err);
				if (err && err != '') {
					store.sessionKey = '';
					uni.removeStorageSync('sessionKey');
				}
			});
		},
		fail: function(res) {
			uni.showModal({
				content: '未开通微信运动，请关注“微信运动”公众号后重试',
				showCancel: false,
				confirmText: '知道了'
			});
		}
	});
}

function onStepGranted(onUpdated) {
	wx.authorize({
		scope: 'scope.werun'
	}).then(res => {
		wx.openSetting({
			success: function(res) {
				getRunData(onUpdated);
			}
		});
	});
}

function getStepSetting(config, onUpdated) {
	if (config.authSetting['scope.werun']) {
		getRunData(onUpdated);
		return;
	}
	const systemInfo = getApp().globalData.systemInfo;
	if (systemInfo.osName == "ios") {
		onStepGranted(onUpdated)
	} else {
		uni.showModal({
			title: '提示',
			content: '获取微信运动步数，需要开启计步权限',
			confirmColor: '#4C5382',
			success: function(res) {
				if (res.confirm) {
					onStepGranted(onUpdated)
				}
			}
		});
	}
}

function getWeChatSteps(onUpdated) {
	wx.getSetting({
		success: function(res) {
			getStepSetting(res, onUpdated);
		}
	});
}

function averageRate(report) {
	return Math.round(report.MedicineSleepQuality.HeartbeatRate);
}

function fetchMaxRate(report) {
	if (!report.HeartRateVariability.MaxHeartbeatRate) {
		const arr = report.HeartRateVariability.HeartbeatRates;
		report.HeartRateVariability.MaxHeartbeatRate = Math.round(Math.max(...arr));
	}
	return report.HeartRateVariability.MaxHeartbeatRate;
}

function fetchMinRate(report) {
	if (!report.HeartRateVariability.MinHeartbeatRate) {
		const arr = report.HeartRateVariability.HeartbeatRates;
		let minValue = -1;
		for (let i = 0; i < arr.length; i++) {
			const el = arr[i];
			if (el != 0 && (minValue == -1 || el < minValue)) {
				minValue = el;
			}
		}
		report.HeartRateVariability.MinHeartbeatRate = Math.round(minValue);
	}
	return report.HeartRateVariability.MinHeartbeatRate;
}

function getProgress(index) {
	if (!store.userConfig.monitor[index].data) {
		store.userConfig.monitor[index].data = 0;
	}
	const data = store.userConfig.monitor[index].data;
	return data * 100;
}

function getStepScore() {
	return getProgress(0);
}

function getEatScore() {
	return getProgress(1);
}

function getFeelingScore() {
	return getProgress(2);
}

function getSleepScore() {
	return getProgress(3);
}

function getPulseScore() {
	return getProgress(4);
}

function validValue(value, defaultValue = 0) {
	return value ? value : defaultValue;
}

function getSoftScore() {
	const stepScore = getStepScore();
	const eatScore = getEatScore();
	const feelingScore = getFeelingScore();
	const sleepScore = getSleepScore();
	const pulseScore = getPulseScore();
	const score = Math.round((stepScore + eatScore + feelingScore + sleepScore + pulseScore) / 5);
	console.log("Monitor, getSoftScore: " + score);
	return score;
}

function getDeviceScore(report) {
	/** 
        - 趋势图：模式识别 - 醒得多，高心律时段多，最多减20分
		- 分布图：模式识别 - 高、低心率分布过多，最多减10分
        - 散点图：模式识别 - 区域发散，最多减10分
		- 醒来次数：数值判断 - 最多减10分
        - 心率：平均心率， 80分
		- 睡眠：浅、深、Rem、清醒算分，10分
        - 运动：平均步数，8分
        - 饮食：1分
		- 心情：1分
	 */
	if (!report) {
		return 0;
	}
	const pulseScore = getPulseScore();
	if (pulseScore == 0) {
		// 数据未录入
		return 0;
	} else {
		// 专家分数：心率趋势图
		if (report.expert?.trendRisk || report.expert?.trendRisk == 0) {
			report.HeartRateVariability.TrendRisk = report.expert.trendRisk;
		}
		const trendRisk = validValue(report.HeartRateVariability.TrendRisk);
		// 专家分数：心率分布图
		let distRisk = 0;
		if (report.expert?.distRisk || report.expert?.distRisk == 0) {
			report.HeartRateVariability.DistRisk = report.expert.distRisk;
			distRisk = validValue(report.HeartRateVariability.DistRisk);
		}
		// 专家分数：心率散点图
		if (report.expert?.scatterRisk || report.expert?.scatterRisk == 0) {
			report.HeartRateVariability.ScatterRisk = report.expert.scatterRisk;
		}
		const scatterRisk = validValue(report.HeartRateVariability.ScatterRisk);
		// 算法分数：房颤风险
		if (report.afRisk) {
			const afRisk = report.afRisk;
			if (afRisk.classification == 'AF') {

			}
		}
		// 心脏疾病风险
		const pulseRisk = 25 * Math.max(trendRisk, distRisk, scatterRisk)
		// 睡眠中断风险
		const sleepRisk = 10 * Math.min(1, validValue(report.MedicineSleepQuality.AwakeningTimes) / 4);
		const heartScore = (80 - pulseRisk - sleepRisk) * getPulseScore() / 100;
		const sleepScore = 10 * report.Grade / 100;
		const stepScore = 8 * getStepScore() / 100;
		const eatScore = 1 * getEatScore() / 100;
		const feelingScore = 1 * getFeelingScore() / 100;
		const score = Math.floor(heartScore + sleepScore + stepScore + eatScore + feelingScore)
		console.log("Monitor, getDeviceScore: " + score);
		return score;
	}
}

function matchPulseColor(val) {
	if (val > 100) {
		return '#AA3311';
	} else if (val > 75) {
		return '#FFA500';
	} else if (val < 50) {
		return '#FFA500';
	} else if (val < 40) {
		return '#AA3311';
	} else {
		return '#5EC29C';
	}
}

function matchStepColor(val) {
	if (val <= 0) {
		return 'transparent';
	} else if (val <= 1000) {
		return '#DE6F6B';
	} else if (val <= 6000) {
		return '#F1C96A';
	} else if (val <= 10000) {
		return '#5EC29C';
	} else {
		return '#0088BB';
	}
}

function matchColorFromScore(score) {
	if (score <= 0) {
		return 'transparent';
	} else if (score <= 30) {
		return '#DE6F6B';
	} else if (score <= 60) {
		return '#F1C96A';
	} else {
		return '#5EC29C';
	}
}

function matchScoreFromDb(dbVal) {
	let score = 0;
	if (dbVal == "good") {
		score = 90;
	} else if (dbVal == "normal") {
		score = 60;
	} else if (dbVal == "bad") {
		score = 30;
	}
	return score;
}

function fetchMonitor(onFetched = undefined) {
	const db = uniCloud.database();
	const query = store.userInfo?._id ? {
		// 登录用户
		uid: store.userInfo._id
	} : {
		// 未登录用户
		did: store.userConfig.deviceID
	};
	db.collection('health-monitor').where(query).limit(14).orderBy('timestamp desc').get().then(res => {
		const scoreObject = {
			seriesData: [],
			lastSeries: [],
			categories: []
		};
		const pulseObject = {
			seriesData: [],
			categories: [],
			dataPointColor: [],
			healthLevel: undefined
		};
		const feelingObject = {
			seriesData: [],
			categories: [],
			dataPointColor: []
		};
		const eatObject = {
			seriesData: [],
			categories: [],
			dataPointColor: []
		};
		const sleepObject = {
			seriesData: [],
			categories: [],
			dataPointColor: [],
			qualityToday: undefined
		};
		const stepObject = {
			seriesData: [],
			categories: [],
			dataPointColor: [],
			// 每日最大步数
			maxValue: 20000,
			vo2max: undefined
		};

		const data = res.result.data;
		const weekDate = getDateLastWeek();

		let dataIndex = 0;
		// 上一个元素
		let prevEl = {};
		// 最新元素
		let lastEl = undefined;
		let i = 0;
		for (; i < Math.min(data.length, 7); i++) {
			let el = data[dataIndex];
			if (el.date == weekDate[i]) {
				dataIndex += 1;
				if (i == 0) {
					// 今天的最大摄氧量
					stepObject.vo2max = el.vo2max;
					// 今天的心脏健康
					pulseObject.healthLevel = el.healthLevel;
					// 今天的睡眠质量
					sleepObject.qualityToday = el.sleepQuality;
					// 今天的数据来源：[0: 手机 | 1: 设备]
					store.userConfig.dataSource = el.dataSource;
				}
			} else {
				el = {
					date: weekDate[i]
				};
			}
			// 日期数据
			const dateValue = el.date.slice(5);
			// 分数
			scoreObject.seriesData.unshift(validValue(el.score));
			scoreObject.categories.unshift(dateValue);
			// 心率数据
			if (!el.pulse) {
				el.pulse = 0;
			}
			pulseObject.seriesData.unshift(el.pulse);
			pulseObject.categories.unshift(dateValue);
			pulseObject.dataPointColor.unshift(matchPulseColor(el.pulse));
			// 睡眠数据
			const sleepValue = matchScoreFromDb(el.sleep);
			sleepObject.seriesData.unshift(sleepValue);
			sleepObject.categories.unshift(dateValue);
			sleepObject.dataPointColor.unshift(matchColorFromScore(sleepValue));
			// 运动数据
			if (!el.steps) {
				el.steps = 0;
			}
			if (el.date != prevEl.date) {
				stepObject.seriesData.unshift(el.steps);
				stepObject.categories.unshift(dateValue);
				stepObject.dataPointColor.unshift(matchStepColor(el.steps));
			} else if (prevEl.steps && (el.steps > prevEl.steps)) {
				stepObject.seriesData[stepObject.categories.length - 1] = el.steps;
			}
			const ceilValue = Math.ceil(el.steps / 20000) * 20000;
			stepObject.maxValue = Math.max(stepObject.maxValue, ceilValue);
			// 心情数据
			const feelingValue = matchScoreFromDb(el.feelings);
			feelingObject.seriesData.unshift(feelingValue);
			feelingObject.categories.unshift(dateValue);
			feelingObject.dataPointColor.unshift(matchColorFromScore(feelingValue));
			// 饮食数据
			const eatValue = matchScoreFromDb(el.eat);
			eatObject.seriesData.unshift(eatValue);
			eatObject.categories.unshift(dateValue);
			eatObject.dataPointColor.unshift(matchColorFromScore(eatValue));
			// 循环控制
			prevEl = el;
			if (!lastEl) {
				lastEl = el;
			}
		}
		for (; i < data.length; i++) {
			const el = data[i];
			scoreObject.lastSeries.unshift(validValue(el.score));
		}
		// 更新今日数据
		updatePulse({
			pulse: lastEl.pulse,
			trendRisk: lastEl.trendRisk,
			distRisk: lastEl.distRisk,
			scatterRisk: lastEl.scatterRisk,
			advice: lastEl.advice,
			date: lastEl.date
		});
		updateSleep({
			sleep: lastEl.sleep,
			sleepQuality: sleepObject.qualityToday,
			date: lastEl.date
		});
		updateSteps({
			steps: lastEl.steps,
			vo2max: stepObject.vo2max,
			date: lastEl.date
		});
		updateEat({
			eat: lastEl.eat,
			date: lastEl.date
		});
		updateFeelings({
			feelings: lastEl.feelings,
			date: lastEl.date
		});
		// 回调结果
		onFetched && onFetched({
			score: scoreObject,
			pulse: pulseObject,
			sleep: sleepObject,
			steps: stepObject,
			feelings: feelingObject,
			eat: eatObject
		});
	}).catch(err => {
		console.log("Monitor, 获取健康数据失败: ", err);
	});
}

export {
	VO2_STANDARD,
	getHeartAge,
	LEVEL_RANGE,
	getDeviceHealth,
	monitorUpdate,
	syncSleepData,
	syncDeviceData,
	updateSteps,
	updateEat,
	updateFeelings,
	updateSleep,
	getSleepQualityScore,
	getSleepFromScore,
	updatePulse,
	requestDeviceReport,
	requestAllReports,
	updateDeviceReport,
	parseReportHRs,
	fetchReportTips,
	updateDailyReport,
	getWeChatSteps,
	averageRate,
	fetchMaxRate,
	fetchMinRate,
	getStepScore,
	getEatScore,
	getFeelingScore,
	getSleepScore,
	getPulseScore,
	getSoftScore,
	getDeviceScore,
	fetchMonitor,
	isReportToday
}