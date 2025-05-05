'use strict';
exports.main = async (event, context) => {
	console.log("ReportToMonitor, event: ", event);
	let res = {
		code: 0,
		errMsg: 'Report to monitor request failed',
		data: {}
	};
	const today = dateToday();
	// 请求产品订单列表
	const db = uniCloud.databaseForJQL();
	const sid = event.queryStringParameters.sid;
	const orderRes = await db.collection('health-product-order').where({
		sid: sid
	}).field('uid, sid, name').get({
		getOne: true
	});
	console.log("ReportToMonitor, matched order: ", orderRes);
	const product = orderRes.data;
	const uid = product.uid;
	const monitorRes = await db.collection('health-monitor').where({
		uid: uid,
		date: today
	}).get({
		getOne: true
	});
	console.log("ReportToMonitor, matched monitor: ", monitorRes);
	const monitor = monitorRes.data;
	// 请求报告心率为空
	if (!monitor) {
		// 请求设备报告
		const response = await uniCloud.httpclient.request(
			'https://chat.aicareme.cn/api/wechat/mqtt/sleepreport/page', {
				method: 'GET',
				data: {
					pageNo: 1,
					pageSize: 10,
					sensorId: sid
				},
				contentType: 'json', // 指定以application/json发送data内的数据
				dataType: 'json', // 指定返回值为json格式，自动进行parse
				timeout: 20000
			});
		console.log("ReportToMonitor, request report, response = ", response);
		let reportList = undefined;
		if (response.data.data) {
			reportList = response.data.data.dataList;
		}

		if (reportList && reportList.length > 0) {
			let targetReport = reportList[0];
			targetReport.businessData = JSON.parse(targetReport.businessData);
			// 解析心率数据
			if (String(targetReport.businessData.EndTime).slice(0, 10) == today) {
				let nightStart = -1;
				const nightReports = [];
				const nightRange = getRangeLastNight();
				if (isReportInRange(targetReport.businessData, nightRange)) {
					nightStart = 0;
					nightReports.push(targetReport);
				}
				for (let i = 1; i < reportList.length; i++) {
					const item = reportList[i];
					item.businessData = JSON.parse(item.businessData);
					const report = item.businessData;
					const sleepQuality = report.MedicineSleepQuality;
					if (String(report.EndTime).slice(0, 10) != today) {
						break;
					} else if (isReportInRange(report, nightRange)) {
						if (nightStart < 0) {
							nightStart = i;
							targetReport = item;
						}
						nightReports.push(item);
					}
				}
				if (nightStart != -1 && nightReports.length > 1) {
					mergeReport(nightReports);
					reportList.splice(nightStart + 1, nightReports.length - 1);
					// 反写醒来次数
					targetReport.businessData.MedicineSleepQuality.AwakeningTimes = nightReports.length - 1;
				}
				// 构建报告结果
				const targetData = targetReport.businessData;
				const reportTitle = (product.nickname ? product.nickname : product.name) + ' 每日健康报告';
				// 构造订阅报告结果
				const qualityData = targetData.MedicineSleepQuality;
				const sleepQuality = {
					effectiveTime: qualityData.TotalSleepTime,
					awakeningRate: qualityData.AwakeningRate,
					remRate: qualityData.REMRate,
					lightSleepRate: qualityData.LightSleepRate,
					deepSleepRate: qualityData.DeepSleepRate
				};
				const sleepScore = getSleepQualityScore(sleepQuality);
				targetData.Grade = sleepScore;
				parseReportHRs(targetData);
				const deviceScore = getDeviceScore(targetData);
				const data = {
					uid: uid,
					dataSource: 1,
					date: today,
					pulse: averageRate(targetData),
					sleep: getSleepFromScore(sleepScore),
					sleepQuality: sleepQuality,
					timestamp: Date.now(),
					score: deviceScore
				}
				console.log("ReportToMonitor, monitor data: ", data);
				const addRes = await db.collection('health-monitor').add(data);
				res.code = 200;
				res.errMsg = "success";
				res.data = addRes.data;
			}
		}
	}

	//返回数据给客户端
	return res;
};

function dateToday() {
	const tzoffset = (new Date()).getTimezoneOffset() * 60000;
	const today = new Date(Date.now() - tzoffset).toISOString().slice(0, 10);
	return today;
}

function createDate(dateString) {
	return new Date(String(dateString) /*.replaceAll('-', '/')*/ );
}

function isReportInRange(report, range) {
	const startTime = createDate(report.StartTime).getTime();
	const endTime = createDate(report.EndTime).getTime();
	return (startTime > range.startTime && startTime < range.endTime) ||
		(endTime > range.startTime && endTime < range.endTime);
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
		if (data.StaticHRs && data.StaticHRs.length > 0) {
			dataF.StaticHRs = data.StaticHRs.concat(dataF.StaticHRs);
		} else {
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

function validValue(value) {
	return value ? value : 0;
}

function averageRate(report) {
	return Math.round(report.MedicineSleepQuality.HeartbeatRate);
}

function getPulseScore(report) {
	const pulse = averageRate(report);
	let score = 30;
	if (pulse > 100 || pulse < 40) {
		score = 30;
	} else if (pulse > 75 || pulse < 50) {
		score = 60;
	} else {
		score = 100;
	}
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
		// 心脏疾病风险
		const pulseRisk = 25 * Math.max(trendRisk, distRisk, scatterRisk)
		// 睡眠中断风险
		const sleepRisk = 10 * Math.min(1, validValue(report.MedicineSleepQuality.AwakeningTimes) / 4);
		const heartScore = (80 - pulseRisk - sleepRisk) * getPulseScore() / 100;
		const sleepScore = 10 * report.Grade / 100;
		const stepScore = 6;
		const eatScore = 1;
		const feelingScore = 1;
		console.log("ReportPush, trendRisk = ", trendRisk, ", scatterRisk = ",
			scatterRisk, ", sleepRisk = ", sleepRisk, ", heartScore = ", heartScore, ", sleepScore = ", sleepScore);
		const score = Math.floor(heartScore + sleepScore + stepScore + eatScore + feelingScore)
		console.log("ReportPush, deviceScore = " + score);
		return score;
	}
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

function parseReportHRs(report) {
	const encodedHRs = report.StaticHRs;
	if (!encodedHRs || encodedHRs.length == 0) {
		// 2S一次心率没有数据
		return;
	}
	let sum = 0;
	let max = 0;
	let min = undefined;
	let validLength = 0;
	let trendRisk = 0;
	let scatterRisk = 0;
	const start = createDate(report.StartTime).getTime();
	const end = createDate(report.EndTime).getTime();
	const range = Math.floor((end - start) / 60000);
	const HeartbeatRates = new Array(range).fill(0);
	report.StartTime = encodedHRs[0].StartTime;
	for (let i = 0; i < encodedHRs.length; i++) {
		const el = encodedHRs[i];
		const millis = createDate(el.StartTime).getTime();
		let offset = Math.floor((millis - start) / 60000);
		const decodedBytes = uatob(el.HRs);
		const values = [];
		for (let j = 0; j < decodedBytes.length; j++) {
			const value = decodedBytes.charCodeAt(j);
			values.push(value);
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
			sum += value;
			max = Math.max(max, value);
			min = min ? Math.min(min, value) : value;
		}
		if (values.length < 30) {
			const value = values[values.length - 1];
			HeartbeatRates[offset] = value;
		}
		validLength += values.length;
	}
	if (validLength > 0) {
		report.HeartRateVariability.TrendRisk = trendRisk / validLength;
		report.HeartRateVariability.ScatterRisk = scatterRisk / validLength;
		report.HeartRateVariability.HeartbeatRates = HeartbeatRates;
	}
	report.StaticHRsParsed = true;
	report.MedicineSleepQuality.HeartbeatRate = Math.round(sum / validLength);
	console.log("ReportToMonitor， parseReportHRs sum = " + sum + ", validLength = " + validLength + ", max = " + max +
		", min = " + min + ", rate = " + report.MedicineSleepQuality.HeartbeatRate);
	if (max > 0) {
		report.HeartRateVariability.MaxHeartbeatRate = max;
	}
	if (min) {
		report.HeartRateVariability.MinHeartbeatRate = min;
	}
}

function uatob(input) {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
	let str = input.replace(/=+$/, '');
	let output = '';
	if (str.length % 4 === 1) {
		console.log("ReportToMonitor, uatob InvalidLengthError: str.length = " + str.length);
		return;
	}
	for (let i = 0, len = str.length; i < len; i += 4) {
		const a = chars.indexOf(str.charAt(i));
		const b = chars.indexOf(str.charAt(i + 1));
		const c = chars.indexOf(str.charAt(i + 2));
		const d = chars.indexOf(str.charAt(i + 3));
		const sum = (a << 18) | (b << 12) | (c << 6) | d;
		output += String.fromCharCode((sum >> 16) & 0xFF, (sum >> 8) & 0xFF, sum & 0xFF);
	}
	return output;
}