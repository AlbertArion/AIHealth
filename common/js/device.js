import md5 from "js-md5";
import gbk from "../../modules/lib/libgbk.js";
import * as utf8 from "../../modules/lib/libutf8.js";
import {
	generateOrderNumber
} from "../utils/generateUUID.ts";
import {
	store
} from "@/uni_modules/uni-id-pages/common/store.js";
import {
	getNowTime
} from "../utils/timestamp.js";
import {
	PRODUCT_PRICE_AUTOTIP,
	PRODUCT_PRICE_EXPERT,
	PRODUCT_PRICE_EXPERT_MONTH,
	PRODUCT_PRICE_NORMAL,
	SERVICE_PRICE_YEAR
} from "./productorder.js";
import {
	noticeMap
} from "./record.js";

const GBK = "GBK";
const UTF_8 = "UTF-8";
let enctype = "GBK";

const accountID = "bjhmjk001";
const accountPassword = "bjhmjk001";

const serviceVersions = [{
	intro: "标准版",
	price: PRODUCT_PRICE_NORMAL,
	title: "标准版：￥3888/年",
	services: [{
			name: "心脉AI智能硬件：",
			descs: [
				"配置一套健康监测仪",
				"提供基础心率、呼吸健康等监测功能"
			]
		},
		{
			name: "每日AI健康监测：",
			descs: [
				"每日一份健康小结",
				"支持风险筛查与提醒功能",
				"提供个性化健康建议，更好地管理健康"
			]
		},
		{
			name: "专家健康服务：",
			descs: [
				"每月一次医疗专家健康建议",
				"每半年一次专家电话沟通，讨论健康状况给出改进建议"
			]
		}
	]
}, {
	intro: "专业版",
	price: PRODUCT_PRICE_AUTOTIP,
	title: "专业版：￥9800/年",
	services: [{
			name: "心脉AI智能硬件：",
			descs: [
				"配置一套心肺+睡眠健康监测仪",
				"提供心肺健康、睡眠质量等全面监测功能",
				"提供详细的数据分析和报告解读"
			]
		},
		{
			name: "每日AI健康监测：",
			descs: [
				"每日一份详细健康解读",
				"支持风险筛查与提醒功能",
				"心率趋势图、散点图等健康可视化功能",
				"个性化健康建议，健康指标、可视化数据深度分析"
			]
		},
		{
			name: "专家健康服务：",
			descs: [
				"每两周一次医疗专家健康解读与建议",
				"每季度一次专家电话沟通，详细讨论健康状况和改进建议"
			]
		}
	]
}, {
	intro: "旗舰版",
	price: PRODUCT_PRICE_EXPERT,
	title: "旗舰版：￥28800/年",
	services: [{
			name: "心脉AI智能硬件：",
			descs: [
				"配置一套心肺+睡眠健康监测仪",
				"提供专业的心肺健康、睡眠质量监测功能，支持实时监测",
				"提供专业的数据分析和报告解读"
			]
		},
		{
			name: "每日AI健康监测：",
			descs: [
				"每日一份详细健康解读",
				"支持风险筛查与提醒功能",
				"心率趋势图、散点图等健康可视化功能",
				"个性化健康建议，健康指标、可视化数据深度分析"
			]
		},
		{
			name: "专家健康服务：",
			descs: [
				"每周一次医疗专家健康解读与建议",
				"每两周一次专家电话沟通，详细讨论健康状况和改进建议"
			]
		}
	]
}];

const productMap = {
	"sleepBelt": "心肺+睡眠监测仪",
	"cardioCare": "心脏健康管理"
};
const imageMap = {
	"sleepBelt": "https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/device/hr_monitor_p.png",
	"cardioCare": "https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/device/hr_monitor_p.png"
};
const descMap = {
	"sleepBelt": "ES 6 | 智能健康管理",
	"cardioCare": "心肺 + 睡眠监测仪"
};
const stateMap = {
	"-1": "已退款",
	"0": "已预订",
	"1": "已购买",
	"2": "退款中",
	"3": "已绑定"
};

function scanDevice(onSuccess = undefined) {
	uni.scanCode({
		onlyFromCamera: true,
		scanType: ['qrCode'],
		autoDecodeCharSet: true,
		sound: 'default',
		autoZoom: true,
		success: (res) => {
			console.log("Device, scanDevice res: ", res);
			if (res.result?.length > 0) {
				onSuccess && onSuccess(res.result);
			}
		}
	});
}

/**
 * 将字符串按照指定编码方式编码成字节流
 * @param {*} str
 * @param {*} enctype
 */
function stringToBytes(str, enctype) {
	var bs;
	if (enctype == UTF_8) {
		bs = utf8.encode(str);
	} else {
		bs = gbk.encode(str);
	}
	return bs;
}

//传入协议数据，构建完整的帧数据
function structFrame(cmd, arr) {
	var leg = 7 + arr.length; // 帧头+帧长度+版本号+命令字+数据+疑惑校验码=6+n+1
	var data = [
		0xEB, 0x90, //帧头
		parseInt(leg / 256), parseInt(leg % 256), // 帧长度=固定结构字节数+数据字节数
		0x00, // 版本号 
		cmd, // 命令 
	];
	data = data.concat(arr); //数据
	var xor = 0x00;
	for (var i = 2; i < data.length; i++) { //除帧头和异或校验码外所有字节的异或
		xor = xor ^ data[i];
	}
	data.push(xor); //异或校验码
	return data;
}
//构建0x05协议数据，配置参数
function structData(wifi, encryption = 0x00, server = null) {
	enctype = wifi.enctype == UTF_8 ? GBK : UTF_8;
	const pidBytes = stringToBytes(wifi.SSID, enctype);
	let arr = new Array();
	let ipBytes = []; //server为空时，ipBytes和portBytes都是0，就不会修改硬件中的服务器信息
	let portBytes = [0x00, 0x00];
	if (server != null) { //服务器信息，如果不知道就不能乱配置，否则会导致设备无法到正确的云端
		ipBytes = getASCII(server.IP);
		portBytes = [parseInt(server.Port / 256), parseInt(server.Port % 256)];
	}
	arr = arr.concat(
		extendLength(pidBytes, 32), //wifi名称 32字节
		getASCII(wifi.password, 32), //wifi密码 32字节
		encryption, //加密方式 1字节
		extendLength(ipBytes, 64), //服务器ip，64字节
		portBytes, //服务器端口，2字节
		0x00, //其他不明数据，一律传0，传0不做修改，否则就会出问题 
		0x00,
		0x00,
		0x00,
		0x00,
		0x00,
		getASCII(enctype, 12) //编码方式 12字节
	);
	const frame = structFrame(0x05, arr);
	return { //发送协议数据
		cmd: 0x05,
		data: frame
	};
}

/**
 * 得到字符串的ASCII字节数组
 * @param {*} str 
 * @param {*} maxLength 
 */
function getASCII(str, maxLength) {
	var bs = new Array();
	str.split('').forEach(p => {
		if (p.charCodeAt() <= 127) {
			bs.push(p.charCodeAt());
		}
	});
	if (maxLength == null) {
		return bs;
	}
	return extendLength(bs, maxLength);
}

/**
 * 将字节数组补零扩展到指定长度
 * @param {} bs 
 * @param {*} maxLength 
 */
function extendLength(bs, maxLength) {
	let len = maxLength - bs.length;
	for (let i = 0; i < len; i++) { //这里必须要用变量len因为bs的长度会增长
		bs.push(0);
	}
	return bs;
}

var buffer = [0, 0, 0, 0]; //响应数据的缓冲区   
var len = 0; //检测到的帧长度，0表示没有帧结构

function receiveData(bs, respSuccess) {
	let isFrame = false; //是否是帧结构数据
	for (let i = 0; i < bs.length; i++) {
		if (len == 0) { //寻找帧结构
			buffer[0] = buffer[1];
			buffer[1] = buffer[2]
			buffer[2] = buffer[3];
			buffer[3] = bs[i];
			if (buffer[0] == 235 && buffer[1] == 144) { //找帧头
				len = buffer[2] * 256 + buffer[3]; //帧长度
				isFrame = true;
			}
		} else {
			buffer.push(bs[i]);
			if (len == buffer.length) {
				analyse(buffer[5], buffer.slice(6, buffer.length - 1), respSuccess); //就截取命令字、数据
				buffer = [0, 0, 0, 0]; //释放缓存区
				len = 0; //初始化
			}
			isFrame = true;
		}
	}
	if (isFrame == false && null != respSuccess) { //只有没有进行任何帧结构操作的，才会认为是非帧结构的数据
		respSuccess({
			cmd: 0xFF, //非帧结构数据
			bs: bs,
		});
	}
}

//解析分配
function analyse(cmd, data, respSuccess) {
	if (cmd == 0x06) {
		console.log("Device, analyse_0x06: " + cmd);
		analyse_0x06(data, respSuccess);
	} else if (cmd == 0x08) {
		console.log("Device, analyse_0x08: " + cmd);
		analyse_0x08(data, respSuccess);
	} else if (cmd == 0x52) {
		console.log("Device, analyse_0x52: " + cmd);
		analyse_0x52(data, respSuccess);
	} else if (cmd == 0x0C) {
		console.log("Device, analyse_0x0C: " + cmd);
		analyse_0x0C(data, respSuccess);
	} else if (cmd == 0x6C) {
		console.log("Device, analyse_0x6C: " + cmd);
		analyse_0x6C(data, respSuccess);
	} else if (cmd == 0x6E) {
		console.log("Device, analyse_0x6E: " + cmd);
		analyse_0x6E(data, respSuccess);
	} else if (cmd == 0x56) {
		console.log("Device, analyse_0x56: " + cmd);
		analyse_0x56(data, respSuccess);
	} else if (cmd == 0x3C) {
		console.log("Device, analyse_0x3C: " + cmd);
		analyse_0x3C(data, respSuccess);
	} else if (cmd == 0x68) {
		console.log("Device, analyse_0x68: " + cmd);
		analyse_0x68(data, respSuccess);
	} else {
		console.log("Device, analyse 未知的协议：" + cmd);
	}
}

//配置wifi参数 
function analyse_0x06(data, respSuccess) {
	respSuccess({
		cmd: 0x06,
		data: data,
	});
}

//读取状态
function analyse_0x08(data, respSuccess) {
	var networkState = data[8]; //第9个字节为网络状态  
	respSuccess({
		cmd: 0x08,
		networkState: networkState,
		networkStateContent: get_networkStateContent(networkState),
	});
}

//获得网络状态对应的文本内容
function get_networkStateContent(networkState) {
	if (networkState == 0x00) {
		return "WiFi模块初始化中";
	} else if (networkState == 0x01) {
		return "网络正常";
	} else if (networkState == 0x02) {
		return "WIFI未连接";
	} else if (networkState == 0x03) {
		return "WIFI连接成功， 服务器未连接";
	} else if (networkState == 0x04) {
		return "网络正常， 服务器不响应";
	} else if (networkState == 0x05) {
		return "正在等待设备联网...";
	} else if (networkState == 0x06) {
		return "固件正在升级";
	} else {
		return "0x08返回了未知的状态码:" + networkState;
	}
}

//联网状态通知，设备主动推送的
function analyse_0x52(data, respSuccess) {
	var wifiState = data[0]; //wifi状态
	var rscp = data[1] * 256 + data[2]; //接收信号码功率
	if (rscp > 0x7FFF) {
		rscp = rscp - 0x10000;
	}
	respSuccess({
		cmd: 0x52,
		wifiState: wifiState,
		rscp: rscp,
		wifiStateContent: get_wifiStateContent(wifiState),
		rscpContent: get_rscpContent(rscp)
	});
}

//获得wifi状态对应的文本信息
function get_wifiStateContent(wifiState) {
	if (wifiState == 0) {
		return "WiFi连接断开";
	} else if (wifiState == 1) {
		return "设备配置联网成功";
	} else if (wifiState == 2) {
		return "找不到WiFi，附近未搜到指定WiFi，大概率是WiFi名称输入错误，或者是编码方式错误，或者是连接了5Ghz的信号";
	} else if (wifiState == 3) {
		return "WiFi连接超时，WiFi名称正确，大概率是密码错误";
	} else if (wifiState == 4) {
		return "WiFi连接成功";
	} else if (wifiState == 5) {
		return "WiFi验证失败，可能是密码错误或者路由器连接已满";
	} else if (wifiState == 6) {
		return "WiFi模块尝试连接路由器"; //之前是”WiFi模块开始连接网络“
	} else if (wifiState == 7) {
		return "WiFi模块已经连接到路由器";
	} else {
		return "未知的WiFi状态" + wifiState;
	}
}

//信号强度的文本信息
function get_rscpContent(rscp) {
	if (rscp == 0) {
		return "WiFi信号极差或未成功获取信号强度";
	} else if (rscp < 0 && rscp >= -50) {
		return "WiFi信号最好";
	} else if (rscp < -50 && rscp >= -70) {
		return "WiFi信号较好";
	} else if (rscp < -70 && rscp >= -80) {
		return "WiFi信号一般";
	} else if (rscp < -80 && rscp >= -100) {
		return "WiFi信号较差";
	} else if (rscp < -100) {
		return "WiFi信号极差";
	} else {
		return "未知的信号强度范围" + rscp;
	}
}

//蓝牙实时数据开关
function analyse_0x0C(data, respSuccess) {
	var rmsOnOff = data[1];
	respSuccess({
		cmd: 0x0C,
		rmsOnOff: rmsOnOff,
	});
}

//0x6B_发送读取LED灯的参数_0x6C
function analyse_0x6C(data, respSuccess) {
	if (data[0] == 0) { //0x00失败，0x01成功
		return;
	}
	var ledParam = {
		modeIndex: data[1], //从1开始
		isHeartLight: data[2] == 1 ? true : false, //心率灯
		h_r: data[3], //心率颜色的R
		h_g: data[4], //心率颜色的G
		h_b: data[5], //心率颜色的B
		isBreathingLight: data[6] == 1 ? true : false, //呼吸灯
		b_r: data[7], //呼吸颜色的R
		b_g: data[8], //呼吸颜色的G
		b_b: data[9], //呼吸颜色的B
		heartRate: data[10], //心率
		breathingRate: data[11], //呼吸
		b_max: data[12], //最大呼吸率值
		periodicValue_b: data[13], //呼吸周期值
		changeValue_b: data[14], //呼吸率每次改变值
		b_min: data[15], //最小呼吸率值
		loop_lessen_value_b: data[16], //循环减少的呼吸率值 
		loop_periodicValue_b: data[17], //循环的呼吸周期值 
		seconds_once_b_time: data[18], //一次呼吸的次数
		seconds_once_b: 60 / data[18], //一次呼吸的秒数
		minutes: 5, //((res.data[19] * 256 + res.data[20]) / 12).toFixed(0), //连续静卧分钟数
	};
	respSuccess({
		cmd: 0x6C,
		ledParam: ledParam,
	});
}

///0x6D_发送配置LED灯的参数_0x6E
function analyse_0x6E(data, respSuccess) {
	respSuccess({
		cmd: 0x6E,
		result: data[0], //0x00失败，0x01成功
	});
}

/**
 * 将数值转成十六进制字符串
 * @param {*} b 
 */
function toHexString(b) {
	var str = Number(b).toString(16);
	return str.length == 1 ? "0" + str : str;
}

//设备广播
function analyse_0x56(data, respSuccess) {
	var obj = {
		functionId: data[0], //1个字节功能id
	};
	if (obj.functionId == 8) { //设备广播-1527报警
		var paramCount = data[1]; //1个字节参数的数量
		var index = 2;
		for (var i = 0; i < paramCount; i++) {
			var paramID = data[index++] * 256 + data[index++]; //2个字节的参数ID
			var paramByteLength = data[index++]; //1个的当前参数值所占的字节数 
			if (paramID == 40 && paramByteLength >= 7) { //格式："YYMdHms"，年为2个字节，大端字节序
				obj.time_1527 = data[index++] * 256 + data[index++]; //年
				obj.time_1527 += "-" + data[index++] + '-' + data[index++]; //月日
				obj.time_1527 += " " + data[index++] + ":" + data[index++] + ":" + data[index++]; //时分秒
			} else if (paramID == 41 && paramByteLength >= 3) { //3的字节数组地址码
				obj.code_1527 = (toHexString(data[index++]) + toHexString(data[index++]) + toHexString(data[index++]))
					.toUpperCase(); //用十六进制字符表示，转成大写，最终是6个长度的大写字符串
			}
		}
	}
	respSuccess({
		cmd: 0x56,
		obj: obj,
	});
}

/**
 * 将指定字节流，按照指定编码方式解码成字符串，如果不知道编码方式，则自己根据utf8的规则来尝试判断
 * @param {*} bytes 
 */
function bytesToString(bytes) {
	let str;
	// if (utf8.canUseUTF8(bytes)) { //如果不知道编码方式，就尝试判断是否能用utf8解码，能解就用utf8，否则就认为是gbk
	if (enctype == UTF_8) {
		str = utf8.decode(bytes);
	} else {
		str = gbk.decode(bytes);
	}
	return {
		str: str,
		enctype: enctype,
	}
}

/**
 * 从字节流的指定索引开始读取2个字节转成有符号的短整型int16
 * @param {*} bs 
 * @param {*} startIndex 
 */
function toInt16(bs, startIndex) {
	return getView(bs, startIndex).getInt16();
}

function getView(bs, startIndex) {
	let view = new DataView(new ArrayBuffer(2));
	for (let i = 0; i < 2; i++) {
		view.setUint8(i, bs[startIndex + i]);
	}
	return view;
}

function analyse_0x3C(data, respSuccess) {
	if (null != respSuccess) {
		var index = 0;
		console.log(data);
		if (data[index++] == 0) { //0失败，1成功，1个字节
			return;
		}
		var wifiList = new Array();
		var count = data[index++]; //扫描发现的WiFi组数，目前最大30，1个字节
		for (var i = 0; i < count; i++) {
			index++; //编号,从0到WiFi组数减1，1个字节
			var len = data[index++] //WiFi名称长度，1个字节 
			var bytes = [];
			for (var j = 0; j < len; j++) {
				bytes.push(data[index++]); //WiFi名称字节数组
			}
			var bts = bytesToString(bytes);
			var name = bts.str;
			var enctype = bts.enctype;
			var dbm = toInt16(data, index); //toInt8(data, index); //WiFi信号强度，一般为负数，单位：dBm，2个字节 
			index += 2;
			if (name.length > 0) { //隐藏网络搜索到的是空字符串
				wifiList.push({
					dbm: dbm,
					dbmDesc: getDbmDesc(dbm),
					name: name,
					enctype: enctype,
					bytes: bytes,
					reliable: true, //认为是可靠的
				});
			}
			index += 6; //WiFi的MAC地址字节数组，6个字节
			index++; //WiFi信道，1个字节
			index++; //WiFi加密方式，1个字节
		}
		respSuccess({
			cmd: 0x3C,
			wifiList: wifiList
		});
	}
}

function getDbmDesc(dbm) {
	if (dbm > -60) {
		return "较好";
	} else if (dbm > -80) {
		return "一般";
	}
	return "较差";
}

//读取指定功能的参数
function analyse_0x68(data, respSuccess) {
	var reqResult = data[0]; //返回结果，1为成功，0为失败，不知道这个要怎么用，先放着吧
	var obj = getFuncParams(data, 1); //读取信息,从索引1开始，注意，和0x56不一样！
	if (obj.fid == 3) { //ESP32设备信息
		obj.deviceInfo = {
			DeviceID: toASCIIString(obj.ps[63]), //ESP32设备主机ID
			DeviceNick: toASCIIString(obj.ps[66]), //ESP32设备主机昵称
			IMEI: toASCIIString(obj.ps[67]), //4G模块的IMEI
			CCID: toASCIIString(obj.ps[68]), //4G模块的
		};
		obj.deviceInfo.SensorID = obj.deviceInfo.DeviceID + "_1"; //传感器ID是根据主机ID虚拟的
		obj.deviceInfo.SensorNick = obj.deviceInfo.DeviceNick + "_1";
		obj.deviceInfo.Is4G = obj.deviceInfo.DeviceNick.indexOf("SSK_G") == 0; //SSK_G开头的为4G版本的设备
	}
	obj.reqResult = reqResult;
	respSuccess({
		cmd: 0x68,
		obj: obj,
	});
}

//得到功能参数
function getFuncParams(data, index) {
	var fid = data[index++]; //1个字节功能id
	var ps = {};
	var paramCount = data[index++]; //1个字节参数的数量  
	for (var i = 0; i < paramCount; i++) {
		var paramID = data[index++] * 256 + data[index++]; //2个字节的参数ID
		var paramByteLength = data[index++]; //1个的当前参数值所占的字节数
		var arr = new Array();
		for (var j = 0; j < paramByteLength; j++) {
			arr.push(data[index++]);
		}
		ps[paramID] = arr;
	}
	return {
		fid: fid, //功能id
		ps: ps, //参数字典
	};
}

/**
 * 将字节数组按照ASCII编码转成字符串
 * @param {*} bytes 
 */
function toASCIIString(bytes) {
	let str = '';
	if (bytes != null && bytes.length > 0) {
		for (let i = 0; i < bytes.length; i++) {
			if (bytes[i] > 0) {
				str += String.fromCharCode(bytes[i]);
			}
		}
	}
	return str;
}

function upperMd5(str) {
	return String(md5(str)).toUpperCase();
}

function findSensorID(device, onSuccess, onFail) {
	const time = getNowTime();
	const params = new Map([
		['_time', time],
		['_accountID', accountID],
		['AccountID', accountID],
		['SensorID', '']
	]);
	let paramString = '';
	for (let [key, value] of params) {
		paramString += value;
	}
	const passwordMd5 = upperMd5(accountPassword);
	const sign = upperMd5(paramString + passwordMd5);
	uni.request({
		url: 'https://dc.dzssk.com/api/5.0/sensor/list',
		method: 'POST',
		header: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		data: {
			_time: time,
			_accountID: accountID,
			AccountID: accountID,
			SensorID: '',
			_sign: sign,
		},
		success: (res) => {
			console.log("Device, findSensorID: ", res);
			let deviceItem = undefined;
			for (let i = 0; i < res.data?.data?.length; i++) {
				const item = res.data.data[i];
				if (device.name == item?.Device.DeviceNick) {
					console.log("Device, fetchSensorID 设备匹配成功：", item);
					deviceItem = item;
					break;
				}
			}
			if (deviceItem) {
				onSuccess && onSuccess(deviceItem);
			} else {
				console.log("Device, fetchSensorID 设备匹配失败");
				onFail && onFail({
					errMsg: 'Dismatched'
				});
			}
		},
		fail: (err) => {
			console.log("fetchSensorID, err = ", err);
			onFail && onFail(err);
		}
	});
}

function updateUserInfo(uid, data, onSuccess = undefined) {
	store.refreshUser();
	const db = uniCloud.database();
	// 更新用户设备信息
	db.collection('uni-id-users').where({
		_id: uid
	}).update(data).then((res) => {
		console.log("Device, 用户设备信息更新成功");
		onSuccess && onSuccess(res);
	}).catch((err) => {
		console.log("Device, 用户设备信息更新失败: ", err);
	});
}

function payForProduct(price, amount, fee, description, state, type, poid = undefined) {
	const total_fee = fee;
	const total_fee_value = Number(fee * 100).toFixed(0);
	uni.navigateTo({
		url: `/pages/pay/productpay?${poid ? 'poid=' + poid + '&' : ''}state=${state}&total_fee_value=${total_fee_value}&price=${price}&amount=${amount}&total_fee=${total_fee}&description=${description}&type=${type}`
	});
}

function payForProductService(poid, fee) {
	const order_no = generateOrderNumber();
	const out_trade_no = `${order_no}`;
	const total_fee = fee;
	const total_fee_value = Number(fee * 100).toFixed(0);
	const description = `续费 AI健康服务：${fee == SERVICE_PRICE_YEAR ? '1年' : '1月'}`;
	uniCloud.database().collection('health-record-pay-info').add({
		uid: store.userInfo._id,
		orderId: order_no,
		poid: poid,
		totalPrice: total_fee,
		status: 0,
	}).then(res => {
		uni.navigateTo({
			url: `/pages/pay/aipay?poid=${poid}&orderId=${order_no}&total_fee_value=${total_fee_value}&total_fee=${total_fee}&description=${description}&out_trade_no=${out_trade_no}&type=productTip`
		});
	}).catch(err => {
		console.log("Device, payForProductService error: ", err);
		uni.showToast({
			icon: 'none',
			title: "网络故障，请稍后重试",
			duration: 1000
		});
	});
}

function subscribeReportPush(product) {
	if (store.userInfo.subscribed != undefined) {
		console.log("Device, 报告消息订阅已设置");
		return;
	}
	console.log("Device, 报告推送消息未订阅");
	const productName = product.nickname ? product.nickname : product.name;
	uni.showModal({
		content: `您的设备「${productName}」已绑定，是否开启健康报告推送？`,
		confirmText: '确定',
		confirmColor: '#4C5382',
		cancelColor: '#808080',
		success: res => {
			if (res.confirm) {
				uni.requestSubscribeMessage({
					tmplIds: [noticeMap["healthReport"].template_id],
					success: res => {
						store.userInfo.subscribed = true;
						store.refreshUser();
					}
				});
			} else {
				store.userInfo.subscribed = false;
				store.refreshUser();
			}
		}
	});
}

function manualReportPush(sids = undefined) {
	if (!sids) {
		sids = [store.userInfo.products[store.userConfig.productIndex].device.sensorID];
	}
	uniCloud.callFunction({
		name: 'reportpush', // 云函数名称
		data: {
			sids: sids
		},
		success: res => {
			console.log("Device, reportpush success", res)
		},
		fail: err => {
			console.log("Device, reportpush failed", err)
		}
	});
}

function shareProduct(product) {
	const db = uniCloud.database();
	const collection = db.collection('health-product-group');
	const sid = product.device.sensorID;
	const query = {
		sid: sid
	};
	collection.where(query).get({
		getOne: true
	}).then(res => {
		const data = res.result?.data;
		if (data) {
			const userGroup = data.userGroup ? data.userGroup : [];
			const contained = userGroup.some(el => {
				el == store.userInfo._id
			});
			if (!contained) {
				userGroup.push(store.userInfo._id);
				collection.where(query).update({
					shareOpen: true,
					userGroup: userGroup
				}).then(res => {
					console.log("Device, 要分享的产品更新成功: ", res);
				}).catch(err => {
					console.log("Device, 要分享的产品更新失败: ", err);
				});
			}
		} else {
			collection.add({
				sid: sid,
				shareOpen: true,
				userGroup: [store.userInfo._id],
				product: product
			}).then(res => {
				console.log("Device, 要分享的产品增加成功: ", res);
			}).catch(err => {
				console.log("Device, 要分享的产品增加失败: ", err);
			});
		}
	}).catch(err => {
		console.log("Device, 要分享的产品查询失败: ", err);
	});
}

function receiveProduct(sid, onReceived) {
	const db = uniCloud.database();
	const collection = db.collection('health-product-group');
	const query = {
		sid: sid,
		shareOpen: true
	};
	collection.where(query).get({
		getOne: true
	}).then(res => {
		const data = res.result?.data;
		if (data) {
			let contained = false;
			if (store.hasProducts()) {
				contained = store.userInfo.products.some(el => {
					return el.device.sensorID == sid;
				});
			}
			if (!contained) {
				onReceived && onReceived(data.product);
			}
		}
	}).catch(err => {
		console.log("Device, 要接收的产品查询失败: ", err);
	});
}

function closeProductShare(product) {
	const db = uniCloud.database();
	const query = {
		sid: product.device.sensorID
	};
	db.collection('health-product-group').where(query).update({
		shareOpen: false
	}).then(res => {
		console.log("Device, 产品关闭分享成功: ", res);
	}).catch(err => {
		console.log("Device, 产品关闭分享失败: ", err);
	});
}

export {
	UTF_8,
	GBK,
	enctype,
	serviceVersions,
	productMap,
	imageMap,
	descMap,
	stateMap,
	scanDevice,
	structData,
	structFrame,
	receiveData,
	findSensorID,
	updateUserInfo,
	payForProduct,
	payForProductService,
	subscribeReportPush,
	manualReportPush,
	shareProduct,
	receiveProduct,
	closeProductShare
}