export function generateUUID() {
	let d = new Date().getTime()
	if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
		d += performance.now() // use high-precision timer if available
	}
	const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		const r = (d + Math.random() * 16) % 16 | 0
		d = Math.floor(d / 16)
		return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16)
	})
	return uuid
}

export function getRandomInviteCode (len = 6) {
	const charArr = ['2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
	let code = ''
	for (let i = 0; i < len; i++) {
	  code += charArr[Math.floor(Math.random() * charArr.length)]
	}
	return code
  }

  // 生成订单号
export function generateOrderNumber() {
	const now = new Date()
	const year = now.getFullYear();
	let month = now.getMonth() + 1;
	let day = now.getDate();
	let hour = now.getHours();
	let minutes = now.getMinutes();
	let seconds = now.getSeconds();
	String(month).length < 2 ? (month = Number("0" + month)) : month;
	String(day).length < 2 ? (day = Number("0" + day)) : day;
	String(hour).length < 2 ? (hour = Number("0" + hour)) : hour;
	String(minutes).length < 2 ? (minutes = Number("0" + minutes)) : minutes;
	String(seconds).length < 2 ? (seconds = Number("0" + seconds)) : seconds;
	const yyyyMMddHHmmss = `${year}${month}${day}${hour}${minutes}${seconds}`;
	return yyyyMMddHHmmss + (Math.floor(Math.random() * 1000000)).toString();
}