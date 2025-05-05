'use strict';

function generateUUID() {
	let d = new Date().getTime()
	if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
		d += performance.now() // use high-precision timer if available
	}
	const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		const r = (d + Math.random() * 16) % 16 | 0
		d = Math.floor(d / 16)
		return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16)
	})
	return uuid
}

exports.main = async (event, context) => {
	//event为客户端上传的参数
	console.log('event : ', event)
	const {
		method,
		data,
		uniIdToken
	} = event;

	if (!data.content) {
		return {
			code: 9999,
			msg: '缺少字段：content'
		}
	}

	const response = await uniCloud.httpclient.request("https://openspeech.bytedance.com/api/v1/tts", {
		method: 'POST',
		data: {
			"app": {
				"appid": "8080795390",
				"token": "GUQO6YbXl2HalAwoArPFSKKU4U2k-jhQ",
				"cluster": "volcano_tts"
			},
			"user": {
				"uid": "388808087185088"
			},
			"audio": {
				"voice_type": "BV001_streaming",
				"encoding": "mp3",
				"compression_rate": 1,
				"rate": 24000,
				"speed_ratio": 1.0,
				"volume_ratio": 1.0,
				"pitch_ratio": 1.0,
				// "emotion": "customer_service",
				"language": "cn"
			},
			"request": {
				"reqid": generateUUID(),
				"text": data.content,
				"text_type": "plain",
				"operation": "query",
				"silence_duration": "125",
				"with_frontend": "1",
				"frontend_type": "unitTson",
				"pure_english_opt": "1"
			}
		},
		headers: {
			"Authorization": "Bearer;GUQO6YbXl2HalAwoArPFSKKU4U2k-jhQ"
		},
		contentType: 'json', // 指定以application/json发送data内的数据
		dataType: 'json', // 指定返回值为json格式，自动进行parse
		timeout: 20000,
	});


	if (response.data.data) {
		const audioBuffer = Buffer.from(response.data.data, 'base64');

		const result = await uniCloud.uploadFile({
			cloudPath: '/audio/tts/' + new Date().getTime() + '.mp3',
			fileContent: audioBuffer,
			cloudPathAsRealPath: true,
			success(res) {
				return result.fileID
			},
			fail(err) {
				reject(new Error(err.errMsg))
			}
		})

		return {
			code: 200,
			data: result
		}

		console.log(result, 'result');
	} else {
		return {
			code: 9999,
			msg: '获取数据失败',
			data: response
		}
	}

	//返回数据给客户端
	return {
		code: 500,
	}
};