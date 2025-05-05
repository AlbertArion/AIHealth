export function formatTimestamp(timestamp) {
	// 创建一个新的Date对象并传入时间戳
	const dateObj = new Date(timestamp);
	// 获取年、月、日、小时、分钟和秒
	const year = dateObj.getFullYear();
	const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
	const day = dateObj.getDate().toString().padStart(2, '0');
	const hours = dateObj.getHours().toString().padStart(2, '0');
	const minutes = dateObj.getMinutes().toString().padStart(2, '0');
	// 与当前年份比较
	const yearNow = new Date().getFullYear();
	// 输出结果
	return year == yearNow ? `${month}月${day}日 ${hours}:${minutes}` :
		`${year}年${month}月${day}日 ${hours}:${minutes}`;
}

export function getNowTime() {
	const nowTime = traversalTime(new Date().getTime()) //在data里定义变量-nowTime
	return nowTime;
}

function addTimes(m) {
	return m < 10 ? '0' + m : m
}

export function traversalTime(timestamp) {
	let time = new Date(timestamp);
	let y = time.getFullYear();
	let m = time.getMonth() + 1;
	let d = time.getDate();
	let h = time.getHours();
	let mm = time.getMinutes();
	let s = time.getSeconds();
	return y + '-' + addTimes(m) + '-' + addTimes(d) + ' ' + addTimes(h) + ':' + addTimes(mm) + ':' + addTimes(s);

	/***********判断当前时间是上午还是下午************/
	//  if (h>= 0 && h < 12) {
	//      this.hoursTip = "上午"
	//  } else if (h >= 12 && h < 18) {
	//      this.hoursTip = "下午"
	//  } else {
	//      this.hoursTip = "晚上"
	//  }
}

export function onlyTime(timestamp) {
	let time = new Date(timestamp);
	let h = time.getHours();
	let mm = time.getMinutes();
	let s = time.getSeconds();
	return addTimes(h) + ':' + addTimes(mm) + ':' + addTimes(s);
}

export function yearInMillis() {
	return 365 * 24 * 60 * 60 * 1000;
}

export function monthInMillis() {
	return 30 * 24 * 60 * 60 * 1000;
}

export function getMillisNow(timestamp = Date.now()) {
	return new Date(timestamp).getTime();
}

export function getRangeToday() {
	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	return {
		startTime: Math.floor(today.getTime() / 1000),
		endTime: Math.floor(now.getTime() / 1000)
	};
}

export function getRangeLastNight() {
	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	return {
		startTime: today.getTime(),
		endTime: today.getTime() + 9 * 60 * 60 * 1000
	};
}

export function isNight(startTime, endTime) {
	const startDate = createDate(startTime);
	const startTimestamp = startDate.getTime();
	const endDate = createDate(endTime);
	const endTimestamp = endDate.getTime();
	const date = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
	const range = {
		startTime: date.getTime(),
		endTime: date.getTime() + 8 * 60 * 60 * 1000
	};
	return (startTimestamp < range.startTime && endTimestamp > range.startTime) ||
		(startTimestamp < range.endTime && endTimestamp > range.endTime) ||
		(startTimestamp >= range.startTime && endTimestamp <= range.endTime) ||
		(startTimestamp <= range.startTime && endTimestamp >= range.endTime);
}

let dateToday = getDateToday();

export function getDateToday(dateValue = Date.now()) {
	// 东八区时区差,该值为负数
	if (dateToday?.length > 0) {
		// console.log('Timestamp, 今日日期: ' + dateToday);
	} else {
		const tzoffset = (new Date()).getTimezoneOffset() * 60000;
		dateToday = new Date(dateValue - tzoffset).toISOString().slice(0, 10);
	}
	return dateToday;
}

export function getDateFrom(dateValue = Date.now()) {
	const tzoffset = (new Date()).getTimezoneOffset() * 60000;
	return new Date(dateValue - tzoffset).toISOString().slice(0, 10);
}

export function getWeekCategories() {
	const dateValue = Date.now();
	// 东八区时区差,该值为负数
	const moffset = 60000; // 分钟转成毫秒
	const doffset = 24 * 60 * moffset; // 天转为毫秒
	const tzoffset = (new Date()).getTimezoneOffset() * moffset;
	const today = new Date(dateValue - tzoffset).toISOString().slice(0, 10);
	return [
		new Date(dateValue - tzoffset - 6 * doffset).toISOString().slice(5, 10),
		new Date(dateValue - tzoffset - 5 * doffset).toISOString().slice(5, 10),
		new Date(dateValue - tzoffset - 4 * doffset).toISOString().slice(5, 10),
		new Date(dateValue - tzoffset - 3 * doffset).toISOString().slice(5, 10),
		new Date(dateValue - tzoffset - 2 * doffset).toISOString().slice(5, 10),
		new Date(dateValue - tzoffset - doffset).toISOString().slice(5, 10),
		new Date(dateValue - tzoffset).toISOString().slice(5, 10)
	];
}

export function getDateLastWeek() {
	const dateValue = Date.now();
	// 东八区时区差,该值为负数
	const moffset = 60000; // 分钟转成毫秒
	const doffset = 24 * 60 * moffset; // 天转为毫秒
	const tzoffset = (new Date()).getTimezoneOffset() * moffset;
	const today = new Date(dateValue - tzoffset).toISOString().slice(0, 10);
	return [
		new Date(dateValue - tzoffset).toISOString().slice(0, 10),
		new Date(dateValue - tzoffset - doffset).toISOString().slice(0, 10),
		new Date(dateValue - tzoffset - 2 * doffset).toISOString().slice(0, 10),
		new Date(dateValue - tzoffset - 3 * doffset).toISOString().slice(0, 10),
		new Date(dateValue - tzoffset - 4 * doffset).toISOString().slice(0, 10),
		new Date(dateValue - tzoffset - 5 * doffset).toISOString().slice(0, 10),
		new Date(dateValue - tzoffset - 6 * doffset).toISOString().slice(0, 10)
	];
}

export function getFreightDdl(timestamp = undefined) {
	const _10_15_millis = 1728921600000;
	const date = timestamp ? new Date(Number(timestamp)) : new Date();
	const dateMillis = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
	const ddl = new Date(Math.max(dateMillis, _10_15_millis) + 172800000);
	const ddlStr = ddl.getMonth() + 1 + '月' + ddl.getDate() + '日';
	return ddlStr;
}

export function getFreightTime(timestamp = undefined) {
	const _10_15_millis = 1728921600000;
	const date = timestamp ? new Date(Number(timestamp)) : new Date();
	const dateMillis = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
	const delayMillis = date.getDay() < 5 ? 86400000 : (8 - date.getDay()) * 86400000;
	const time = new Date(Math.max(dateMillis, _10_15_millis) + delayMillis);
	const timeStr = time.getMonth() + 1 + '月' + time.getDate() + '日';
	return timeStr;
}

export function createDate(dateString) {
	return new Date(String(dateString).replaceAll('-', '/'));
}