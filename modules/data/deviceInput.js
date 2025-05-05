import {
	store
} from "@/uni_modules/uni-id-pages/common/store";

const reportMock = {
	"BasicReportID": "b740acdfd97a42d09a6baae17d9b06de",
	"UserID": "13191065101",
	"SensorID": "05DAFF313132594D43037807_1",
	"IsMain": false,
	"AllTotalSleepTime": 1437.0,
	"HeartHealthIndex": 1.63,
	"BreathingHealthIndex": 1.0,
	"TotalSleepTimeRate": 0.0,
	"GradeRate": 0.0,
	"HeartHealthIndexRate": 0.0,
	"BreathingHealthIndexRate": 0.0,
	"InsertTime": "2024-08-29 09:03:22",
	"HasHtml": false,
	"Lvl": 0,
	"SleepQualityIndex_Raw": null,
	"StartTime": "2024-08-29 08:32:17",
	"EndTime": "2024-08-29 08:58:40",
	"Grade": 67.83,
	"MedicineSleepQuality": {
		"HeartbeatRate": 61.25,
		"BreathingRate": 12.0,
		"GoToBedTime": "2024-08-29 08:32:17",
		"LeaveBedTime": "2024-08-29 08:58:40",
		"AsleepTime": "2024-08-29 08:34:38",
		"WakeTime": "2024-08-29 08:58:35",
		"TotalSleepTime": 1437.0,
		"TotalOnBedTime": 1583.0,
		"TotalEffectiveSleepTime": 1306.0,
		"LeaveBedNumbers": 0,
		"LeaveBedIntervals": [],
		"BodyMovementNumbers": 28,
		"BodyMovementNumbersPerHour": 63.68,
		"Conclusion": "",
		"Proposal": "我们所吃的食物对我们生活的各个方面影响深远。如果饮食不健康，会导致烧心、消化不良和其他数不胜数的与食物有关的疾病，影响睡眠。以饮食促睡眠，不仅可以提高睡眠质量，还可保证健康饮食。",
		"BodyActivityIndex": [],
		"TurningTimes": ["2024-08-29 08:46:15"],
		"SleepQualityIndex": [],
		"AwakeningRate": 0.09,
		"REMRate": 0.3,
		"LightSleepRate": 0.22,
		"DeepSleepRate": 0.39,
		"SleepStages": null,
		"SleepStageProportions": null
	},
	"HeartRateVariability": {
		"HeartbeatRates": [],
		"HeartHealthConclusion": "正常",
		"PAFConclusion": "正常",
		"ArrhythmiaConclusion": "正常",
		"Conclusion": "",
		"Proposal": "富含精氨酸的食物有助调节血管张力、抑制血小板聚集，减少血管损伤。这类食物有海参、泥鳅、鳝鱼及芝麻、山药、银杏、豆腐皮、葵花子等。"
	},
	"HRV": null,
	"OSAHS": {
		"BreathingRates": [],
		"SDBPercent": 0.0,
		"SDBTotalTime": 0.0,
		"LongestSDBDuration": 0.0,
		"LongestSDBEventTime": null,
		"SBDNumbersPerHour": 0.0,
		"SBDNumbers": 0.0,
		"OSAHSIndex": [],
		"Level": 0,
		"Conclusion": "",
		"Proposal": "",
		"SDBSections": []
	}
};
const reportLastWeek = {
	"BasicReportID": "28c0836f7bbc443abadf9b0b82e54f77",
	"UserID": "13191065101",
	"SensorID": "05DAFF313132594D43037807_1",
	"IsMain": true,
	"AllTotalSleepTime": 30316.0,
	"HeartHealthIndex": 1.65,
	"BreathingHealthIndex": 1.0,
	"TotalSleepTimeRate": 0.44,
	"GradeRate": 0.02,
	"HeartHealthIndexRate": 0.28,
	"BreathingHealthIndexRate": 0.95,
	"InsertTime": "2024-08-20 09:23:21",
	"HasHtml": false,
	"Lvl": 0,
	"SleepQualityIndex_Raw": null,
	"StartTime": "2024-08-19 18:50:16",
	"EndTime": "2024-08-20 09:22:12",
	"Grade": 35.01,
	"MedicineSleepQuality": {
		"HeartbeatRate": 60.71,
		"BreathingRate": 12.37,
		"GoToBedTime": "2024-08-19 18:50:16",
		"LeaveBedTime": "2024-08-20 09:22:12",
		"AsleepTime": "2024-08-20 00:56:53",
		"WakeTime": "2024-08-20 09:22:09",
		"TotalSleepTime": 30316.0,
		"TotalOnBedTime": 52316.0,
		"TotalEffectiveSleepTime": 23638.0,
		"LeaveBedNumbers": 29,
		"LeaveBedIntervals": [],
		"BodyMovementNumbers": 676,
		"BodyMovementNumbersPerHour": 46.52,
		"Conclusion": "",
		"Proposal": "治疗失眠的偏方：将用白开水冲水后的鲜花生叶放入壶内或杯内，待花生叶的色泽泡下后饮下，约15分钟左右，即能入睡，该治疗失眠的偏方可有效治疗9成以上的失眠。",
		"BodyActivityIndex": [],
		"TurningTimes": ["2024-08-20 00:56:47", "2024-08-20 01:38:27", "2024-08-20 03:37:56", "2024-08-20 06:14:48",
			"2024-08-20 07:10:50", "2024-08-20 07:46:39"
		],
		"SleepQualityIndex": [],
		"AwakeningRate": 0.18,
		"REMRate": 0.02,
		"LightSleepRate": 0.06,
		"DeepSleepRate": 0.73,
		"SleepStages": null,
		"SleepStageProportions": null
	},
	"HeartRateVariability": {
		"HeartbeatRates": [],
		"HeartHealthConclusion": "正常",
		"PAFConclusion": "正常",
		"ArrhythmiaConclusion": "正常",
		"Conclusion": "",
		"Proposal": "用其他蛋白质替代红肉。奥尔森博士表示，红肉中饱和脂肪含量尤其高。为了减少饱和脂肪摄入量，应少吃牛排等红肉，或者以鸡肉或鱼肉取代红肉，从长计议更有助于保护心脏。"
	},
	"HRV": null,
	"OSAHS": {
		"BreathingRates": [],
		"SDBPercent": 0.0,
		"SDBTotalTime": 85.12,
		"LongestSDBDuration": 26.48,
		"LongestSDBEventTime": "2024-08-20 04:30:13",
		"SBDNumbersPerHour": 0.47,
		"SBDNumbers": 4.0,
		"OSAHSIndex": [],
		"Level": 0,
		"Conclusion": "",
		"Proposal": "咽部异常 常见咽炎，喉炎，扁桃体炎等咽喉疾病，会直接造成患者在睡眠中打呼噜现象，建议到耳鼻喉专科医院用H-UPPP成形术 彻底治疗打鼾，H-UPPP成形术是在鼻内窥镜下，并同时联合纤维喉、手术显微镜，锁定咽腔、鼻腔、舌根等形态改变部位，进行可视介入，运用等离子低温消 融系统，精确定位，瞬间对增生组织进行消融，恰当的温度控制及能释放，仅需20分钟，可解决软腭三个区一次性治疗。包括对呼吸道消炎和消肿、使颌咽成形， 改变鼻腔咽腔通气状况，使打鼾患者轻松告别鼾声，快捷轻松消除病灶炎症，疏通呼吸道堵塞部位。",
		"SDBSections": [{
			"Level": 100,
			"StartTime": "2024-08-20 01:57:58",
			"EndTime": "2024-08-20 01:58:12"
		}, {
			"Level": 100,
			"StartTime": "2024-08-20 01:59:13",
			"EndTime": "2024-08-20 01:59:35"
		}, {
			"Level": 100,
			"StartTime": "2024-08-20 04:30:13",
			"EndTime": "2024-08-20 04:30:40"
		}, {
			"Level": 100,
			"StartTime": "2024-08-20 08:50:10",
			"EndTime": "2024-08-20 08:50:31"
		}]
	}
};
const reportLastMonth = {
	"BasicReportID": "f157381b85524b23ba3b1a25caec838d",
	"UserID": "",
	"SensorID": "05DAFF313132594D43037807_1",
	"IsMain": true,
	"AllTotalSleepTime": 30667.0,
	"HeartHealthIndex": 1.96,
	"BreathingHealthIndex": 0.99,
	"TotalSleepTimeRate": 0.5,
	"GradeRate": 0.64,
	"HeartHealthIndexRate": 0.79,
	"BreathingHealthIndexRate": 0.74,
	"InsertTime": "2024-07-16 08:13:12",
	"HasHtml": false,
	"Lvl": 0,
	"SleepQualityIndex_Raw": null,
	"StartTime": "2024-07-15 19:04:12",
	"EndTime": "2024-07-16 08:09:18",
	"Grade": 74.95,
	"MedicineSleepQuality": {
		"HeartbeatRate": 51.01,
		"BreathingRate": 12.57,
		"GoToBedTime": "2024-07-15 19:04:12",
		"LeaveBedTime": "2024-07-16 08:09:18",
		"AsleepTime": "2024-07-15 23:38:08",
		"WakeTime": "2024-07-16 08:09:15",
		"TotalSleepTime": 30667.0,
		"TotalOnBedTime": 47106.0,
		"TotalEffectiveSleepTime": 27812.0,
		"LeaveBedNumbers": 4,
		"LeaveBedIntervals": [],
		"BodyMovementNumbers": 497,
		"BodyMovementNumbersPerHour": 37.98,
		"Conclusion": "",
		"Proposal": "睡眠是人生理的基本需求，充足的睡眠可使人消退疲劳，促进恢复体力。",
		"TurningTimes": [
			"2024-07-15 23:54:36",
			"2024-07-16 02:29:08",
			"2024-07-16 02:48:55",
			"2024-07-16 03:13:31",
			"2024-07-16 03:45:28",
			"2024-07-16 06:29:11"
		],
		"AwakeningRate": 0.07,
		"REMRate": 0.06,
		"LightSleepRate": 0.59,
		"DeepSleepRate": 0.28,
		"SleepStages": null,
		"SleepStageProportions": null
	},
	"HeartRateVariability": {
		"HeartHealthConclusion": "正常",
		"PAFConclusion": "正常",
		"ArrhythmiaConclusion": "正常",
		"Conclusion": "",
		"Proposal": "以茶代酒，多饮茶特别是新鲜绿茶，对预防心血管病大有裨益，因为其中的茶多酚有强烈的抗氧化作用，另外还可以促进多余胆固醇从肠道排泄。"
	},
	"HRV": null,
	"OSAHS": {
		"SDBPercent": 0.01,
		"SDBTotalTime": 268.88,
		"LongestSDBDuration": 24.76,
		"LongestSDBEventTime": "2024-07-16 06:22:56",
		"SBDNumbersPerHour": 1.64,
		"SBDNumbers": 14.0,
		"Level": 0,
		"Conclusion": "",
		"Proposal": "人一生总心跳次数约为25亿次至30亿次，如果静息心率在60次左右，其寿命可达93岁。"
	}
};

const promptDevice = `请用不超过100字，输出诊断结果（重点突出，可以唬住人）；最近心率和睡眠健康，最关键的几个问题
  - XXX；
  - XXX；
  - XXX。
我的睡眠特点是怎样的？有哪些好的地方需要保持？如果有问题，请提供个性化解决方案`;

const promptTrend = `请用不超过100字，输出诊断结果（重点突出，可以唬住人）；最近心率和睡眠健康与以往相比，有什么趋势（这部分的标题叫'近期健康趋势'，不要告诉我健康指数，适当给我一些鼓励）？判断出问题来，最关键的几个问题
  - XXX；
  - XXX；
  - XXX。
我的睡眠特点是怎样的？有哪些好的地方需要保持？如果有问题，请提供个性化解决方案`;

const promptScatter = `这是我的心率散点图，横轴表示前一个心率值，纵轴表示当前心率值。请用不超过20个字，输出诊断结果（重点突出，通俗易懂），判断出最关键的问题，并告诉我：
  - 散点图的整体分布情况（是否均匀、是否有聚集区域）？
  - HRV（心率变异性）的高低？
  - 是否属于窦性心律？`;

const promptSleepTrend = `中国人睡眠质量平均分数是75分，睡眠时长为6.75小时，平均夜间清醒次数为1.4次。
查看最近睡眠报告中的睡眠质量分数（报告中Grade表示睡眠质量分数）、睡眠时长，告诉我我的睡眠质量超过了百分之多少的人（适当给我一些鼓励）；
从最近的报告中分析，用不超过20字，输出最近趋势（重点突出，可以唬住人）；
判断出最关键的几个问题及解决方案；有哪些好习惯需要保持？如果想跑步和饮酒，请给我一些建议。
请精简语句，按如下格式输出，段落标题不需要突出和加粗：
XXX
1. XXX
	- XXX
	- XXX
2. XXX
	- XXX
	- XXX`;

function reduceToJson(report) {

	// 抹除原始建议与结论
	report.MedicineSleepQuality.Proposal = '';
	report.MedicineSleepQuality.Conclusion = '';
	report.HeartRateVariability.Proposal = '';
	report.HeartRateVariability.Conclusion = '';
	report.OSAHS.Proposal = '';
	report.OSAHS.Conclusion = '';

	// 防止JSON过长，清空所有index数组
	const SleepQualityIndex_Raw = report.SleepQualityIndex_Raw;
	report.SleepQualityIndex_Raw = null;
	const LeaveBedIntervals = report.MedicineSleepQuality.LeaveBedIntervals;
	report.MedicineSleepQuality.LeaveBedIntervals = [];
	const BodyActivityIndex = report.MedicineSleepQuality.BodyActivityIndex;
	report.MedicineSleepQuality.BodyActivityIndex = [];
	const SleepQualityIndex = report.MedicineSleepQuality.SleepQualityIndex;
	report.MedicineSleepQuality.SleepQualityIndex = [];
	const TurningTimes = report.MedicineSleepQuality.TurningTimes;
	report.MedicineSleepQuality.TurningTimes = [];

	const HeartbeatRates = report.HeartRateVariability.HeartbeatRates;
	report.HeartRateVariability.HeartbeatRates = [];
	const HeartbeatDist = report.HeartRateVariability.HeartbeatDist;
	report.HeartRateVariability.HeartbeatDist = [];
	const ScatterRates = report.HeartRateVariability.ScatterRates;
	report.HeartRateVariability.ScatterRates = [];

	const BreathingRates = report.OSAHS.BreathingRates;
	report.OSAHS.BreathingRates = [];
	const OSAHSIndex = report.OSAHS.OSAHSIndex;
	report.OSAHS.OSAHSIndex = [];
	const SDBSections = report.OSAHS.SDBSections;
	report.OSAHS.SDBSections = [];

	const StaticHRs = report.StaticHRs;
	report.StaticHRs = [];
	const RRIs = report.RRIs;
	report.RRIs = [];

	// 生成JsonString
	const reportJson = JSON.stringify(report);

	// 恢复index数组
	report.MedicineSleepQuality.LeaveBedIntervals = LeaveBedIntervals;
	report.MedicineSleepQuality.BodyActivityIndex = BodyActivityIndex;
	report.MedicineSleepQuality.SleepQualityIndex = SleepQualityIndex;
	report.MedicineSleepQuality.TurningTimes = TurningTimes;

	report.HeartRateVariability.HeartbeatRates = HeartbeatRates;
	report.HeartRateVariability.HeartbeatDist = HeartbeatDist;
	report.HeartRateVariability.ScatterRates = ScatterRates;

	report.OSAHS.BreathingRates = BreathingRates;
	report.OSAHS.OSAHSIndex = OSAHSIndex;
	report.OSAHS.SDBSections = SDBSections;

	report.StaticHRs = StaticHRs;
	report.RRIs = RRIs;

	return reportJson;
}

function getSleepBeltPrompt(report) {
	if (report.prompt?.length > 0) {
		return report.prompt;
	}
	report.prompt = reduceToJson(report) + "\n以上内容是我的睡眠报告。" + promptDevice;
	return report.prompt;
}

function getSleepTrendPrompt() {
	return `
一、上月的睡眠报告：\n
	${reduceToJson(reportLastMonth)}\n
二、上周的睡眠报告：\n
	${reduceToJson(reportLastWeek)}\n
三、昨天的睡眠报告：\n
	${reduceToJson(reportMock)}\n
${promptSleepTrend}`;
}

function getMonitorPrompt(report, comparison) {
	if (report.prompt?.length > 0) {
		return report.prompt;
	}
	const steps = store.userConfig.monitor[0].value;
	if (comparison) {
		const promptSuffix = `\n以上是我的心率与睡眠报告。我今天走了${steps}步。` + promptTrend;
		report.prompt = '上周的报告：' + reduceToJson(comparison) + '\n 最新的报告：' + reduceToJson(report) + promptSuffix;
		return report.prompt;
	} else {
		report.prompt = reduceToJson(report) + `\n以上是我的心率与睡眠报告。我今天走了${steps}步。` + promptDevice;
		return report.prompt;
	}
}

export {
	reportMock,
	reportLastWeek,
	reportLastMonth,
	promptScatter,
	getSleepBeltPrompt,
	getSleepTrendPrompt,
	getMonitorPrompt
}