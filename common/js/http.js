import {
	store
} from "@/uni_modules/uni-id-pages/common/store";
import {
	arrayBufferToString
} from "@/common/utils/chat";

function checkHttpOk(res) {
	return res.data.code == '000000';
}

function number(a, b) {
	return a * b;
}

function showLoadingHttp() {
	uni.showLoading({
		title: '加载中',
		mask: true
	});
}

function hideLoadingHttp() {
	uni.hideLoading();
}


const url = {
	// 正式环境
	medical: 'https://www.aicareme.cn/medical/stream',
	clinic: 'https://www.aicareme.cn/clinic/stream',
	checkin: 'https://www.aicareme.cn/checkin/stream',
	emohaa: 'https://www.aicareme.cn/emo_chat'
}

const devUrl = {
	// 测试环境
	medical: 'https://test.aicareme.cn/medical/stream',
	clinic: 'https://test.aicareme.cn/clinic/stream',
	checkin: 'https://test.aicareme.cn/checkin/stream',
	emohaa: 'https://test.aicareme.cn/emo_chat'
}

const streamTask = (url, requestData, onSuccess, onFail, onComplete) => {
	return uni.request({
		url: url,
		method: 'POST',
		enableChunked: true,
		responseType: 'text',
		header: {
			'X-Auth-Token': uni.getStorageSync('uni_id_token'),
		},
		data: {
			...requestData,
		},
		success: (res) => {
			console.log("Http, streamTask success: ", res);
			onSuccess && onSuccess(res);
		},
		fail: (err) => {
			console.log('Http, streamTask failed: ', err);
			onFail && onFail(err);
		},
		complete: (res) => {
			console.log('Http, streamTask complete: ', res);
			onComplete && onComplete(res);
		}
	});
}

const requestTaskHandler = (str, id, requestData, onSuccess, onFail, onComplete) => {
	return uni.request({
		url: getApp().globalData.isDevTools() ? devUrl[str] : url[str],
		// responseType: "arraybuffer",
		method: 'POST',
		enableChunked: true,
		responseType: 'text',
		// header: {
		// 	'sslVerify': false,
		// 	'content-type': 'application/json',
		// },
		data: {
			...requestData,
		},
		success: (res) => {
			onSuccess && onSuccess(res);
		},
		fail: (err) => {
			console.log('Http, requestTaskHandler request failed: ', err);
			onFail && onFail(err, id);
		},
		complete: (res) => {
			onComplete && onComplete(res, id, requestData.input);
		}
	});
}

function streamWx(model = 'medical', id, requestData, onSuccess, onFail, onComplete, onHeadersReceived,
	onChunkReceived) {
	console.log("Http, streamWx, requestData: ", requestData);
	const requestTask = requestTaskHandler(model, id, requestData, onSuccess, onFail, onComplete);
	if (requestTask.onHeadersReceived) {
		requestTask.onHeadersReceived(res => {
			onHeadersReceived(res);
		});
	}
	if (requestTask.onChunkReceived) {
		requestTask.onChunkReceived(res => {
			onChunkReceived(res, id, requestData.input);
		});
	}
	return requestTask;
}

function streamRequest(url, requestData, onChunkReceived, onFail = undefined, onHeadersReceived = undefined,
	onSuccess = undefined, onComplete = undefined) {
	console.log("Http, streamRequest, url = " + url + ", requestData: ", requestData);
	const task = streamTask(url, requestData, onSuccess, onFail, onComplete);
	if (task.onHeadersReceived) {
		task.onHeadersReceived(res => {
			onHeadersReceived && onHeadersReceived(res);
		});
	}
	if (task.onChunkReceived) {
		task.onChunkReceived(res => {
			onChunkReceived(res);
		});
	}
	return task;
}

function streamBeats(onComplete, onFail, onBeat = undefined, timeout = 15000) {
	const url = "https://chat.aicareme.cn/api/wechat/mqtt/realtime/stream";
	const requestData = {
		sensorID: ''
	};
	const products = store.userInfo.products;
	if (products?.length > 0) {
		requestData.sensorID = products[store.userConfig.productIndex].device?.sensorID;
	}
	const beats = [];
	const onChunkReceived = res => {
		let jsonString = arrayBufferToString(res.data).trim();
		if (jsonString?.length > 0) {
			const array = jsonString.split('data:');
			if (array?.length > 0) {
				jsonString = array[array.length - 1];
				if (jsonString?.length > 0) {
					try {
						const beatInfo = JSON.parse(jsonString);
						beats.push(beatInfo);
						onBeat && onBeat(beatInfo);
					} catch (e) {
						console.log("Http, streamBeats JSON.parse failed, jsonString = " + jsonString +
							", exception = ", e);
					}
				}
			}
		}
	};
	const task = streamRequest(url, requestData, onChunkReceived, onFail);

	if (timeout > -1) {
		setTimeout(() => {
			onComplete && onComplete(beats);
			task.abort();
		}, timeout);
	}

	return task;
}
export {
	number,
	streamWx,
	streamBeats
}