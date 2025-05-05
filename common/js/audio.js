// Message audio context
let lastAudio = null;

// WechatSi 语音识别
const wsiPlugin = initWechatSI();

// ASR 录音|语音识别
const ASR_ID = 'AKIDtfJn282hKTYYTDCLOKADE9wYwJbhoz41';
const ASR_KEY = 'wlNrCPVTJ4hCTaZW3a9eDkKn5OpFaq16';
const ASR_APP_ID = 1321984317;
const ASR_APP_ID_STR = String(ASR_APP_ID);
const asrPlugin = initAsr();
const asrRecorder = initRecorder();

const asrOptions = {
	speed: 0,
	volume: 0,
	voiceType: 101007,
	language: 1,
	projectId: 0,
	sampleRate: 16000,
	emotionCategory: 'neutral',
};

function saveLastAudio(audio) {
	lastAudio = audio;
}

function initWechatSI() {
	return requirePlugin("WechatSI");
}

function initAsr() {
	// 录音插件：QCloudAIVoice 腾讯云ASR语音识别
	const plugin = requirePlugin("QCloudAIVoice")
	plugin.setQCloudSecret(ASR_APP_ID, ASR_ID, ASR_KEY, false);
	return plugin;
}

function initRecorder() {
	return asrPlugin.speechRecognizerManager();
}

function onRecording() {
	// 需要开始识别时调用此方法
	const options = {
		signCallback: null, // 鉴权函数
		// 用户参数
		appid: ASR_APP_ID_STR, // 腾讯云账号appid（非微信appid）
		secretid: ASR_ID,
		secretkey: ASR_KEY,
		token: '', // 选填参数，若密钥为临时密钥，需传此参数。
		// 录音参数
		// duration: 10000,
		frameSize: 0.32, //单位:k

		// 实时识别接口参数
		engine_model_type: '16k_zh',
		voice_format: 8, // 1 为 pcm, 8为 mp3, 目前仅支持mp3和pcm
		// 以下为非必填参数，可跟据业务自行修改
		// hotword_id : '08003a00000000000000000000000000',
		// needvad: 0,
		// filter_dirty: 1,
		// filter_modal: 2,
		// filter_punc: 0,
		// convert_num_mode : 1,
		// word_info: 2,
		vad_silence_time: 250
	};
	asrRecorder.start(options);
}

function offRecording() {
	asrRecorder.listener = undefined;
	asrRecorder.OnRecognitionStart = null;
	asrRecorder.OnSentenceBegin = null;
	asrRecorder.OnRecognitionResultChange = null;
	asrRecorder.OnSentenceEnd = null;
	asrRecorder.OnRecognitionComplete = null;
	asrRecorder.OnError = null;
	asrRecorder.OnRecorderStop = null;
}

function shortBreakIndex(str) {
	const punctuationRegex = /[\u3002\uFF0C\u002C\u002E\u003A]/;
	// 使用exec方法查找第一个匹配项
	const match = punctuationRegex.exec(str);
	// 如果找到匹配项，返回它的索引，否则返回-1
	return match ? match.index : -1;
}

function longBreakIndex(str) {
	// 正则表达式匹配标点符号
	/**
	 * \u3002：中文句号
	 * \uFF1F：中文问号
	 * \uFF01：中文感叹号
	 * \uFF0C：中文逗号
	 * \u3001：中文顿号
	 * \uFF1B：中文分号
	 * \uFF1A：中文冒号
	 * \u0020：英文空格
	 * \u0021：英文感叹号
	 * \u002C：英文逗号
	 * \u002E：英文句号
	 * \u003A：英文冒号
	 * \u003B：英文分号
	 * \u003F：英文问号
	 * \u000D：英文回车符
	 */
	// const punctuationRegex = /[\u3002\uFF0C\u002C\u002E\u003A\u000D]/;
	const punctuationRegex = /[\d+\.\r\n\u000D]/;
	// 使用exec方法查找第一个匹配项
	const match = punctuationRegex.exec(str);
	// 如果找到匹配项，返回它的索引，否则返回-1
	return match ? match.index : -1;
}

// 腾讯云语音合成
function onSpeaking(text, onSuccess, onFail) {
	asrPlugin.textToSpeech({
		...asrOptions,
		content: text,
		success: (res) => {
			onSuccess(res.result.filePath);
		},
		fail: (err) => {
			console.log('Audio, onSpeaking err: ', err);
			onFail(err);
		}
	});
}

// 火山语音合成
function volcengineSpeaking(text, onSuccess, onFail) {
	let content = '';
	if (text?.length > 480) {
		const breakIndex = 480 + shortBreakIndex(text.slice(480, text.length));
		content = text.slice(0, breakIndex) + "。更多内容请查看聊天的文字内容。";
	} else {
		content = text;
	}
	console.log('Audio, volcengineSpeaking content: ', content);
	uniCloud.callFunction({
		name: "textToSpeech",
		data: {
			data: {
				content: content
			}
		},
	}).then((res) => {
		console.log('Audio, volcengineSpeaking res: ', res);
		if (res.result.code === 200 && res.result.data?.fileID) {
			onSuccess(res.result.data.fileID);
		} else {
			onFail(res);
		}
	}).catch((err) => {
		console.log('Audio, volcengineSpeaking err: ', err);
		onFail(err);
	});
}

function initAudio(audioUrl, onStop, onEnded, playRate = 1) {
	const audio = uni.createInnerAudioContext();
	audio.src = audioUrl;
	audio.volume = 1;
	audio.playbackRate = playRate;
	audio.obeyMuteSwitch = false;
	audio.onStop(() => {
		console.log("Audio, 语音播放中止");
		onStop();
	});
	audio.onEnded(() => {
		console.log("Audio, 语音播放完成");
		onEnded();
	});
	audio.onError((err) => {
		console.log("Audio, 语音播放错误: ", err);
		onStop();
	});
	return audio;
}

export {
	lastAudio,
	saveLastAudio,
	wsiPlugin,
	asrPlugin,
	asrRecorder,
	onRecording,
	offRecording,
	asrOptions,
	onSpeaking,
	initAudio,
	shortBreakIndex,
	longBreakIndex
}