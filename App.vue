<script>
	import initApp from '@/common/appInit.js';
	import openApp from '@/common/openApp.js';

	// #ifdef H5
	openApp() //创建在h5端全局悬浮引导用户下载app的功能
	// #endif

	import checkIsAgree from '@/pages/uni-agree/utils/uni-agree.js';
	import uniIdPageInit from '@/uni_modules/uni-id-pages/init.js';
	import * as http from '@/common/js/http.js';
	import * as tool from '@/common/utils/tool.js';

	const systemInfo = uni.getSystemInfoSync();
	const platform = systemInfo.uniPlatform;

	export default {
		globalData: {
			searchText: '',
			appVersion: {},
			config: {},
			$i18n: {},
			$t: {},
			isDev: false,
			systemInfo: systemInfo,
			platform: platform,
			// url: "http://192.168.1.8:8099/wtall/",
			url: "https://cy2.wtianyu.com/wtall/",
			// webSocketUrl: "ws://192.168.1.3:8099/wtall/",
			// webSocketUrl: "wss://cy2.wtianyu.com/wtall/",
			webSocketUrl: "wss://cy2.wtianyu.com/wtall/",
			// 小程序的appId -生产
			appId: platform === 'mp-weixin' ? uni.getAccountInfoSync().miniProgram.appId : (platform === 'mp-toutiao' ?
				'tt13d565688ce9cbfa01' : ''),
			// 小程序的appId -沙盒
			// appId: platform === 'mp-weixin' ? uni.getAccountInfoSync().miniProgram.appId : (platform === 'mp-toutiao' ?
			// 	'tt5dcb2b76c2f7701101' : ''),
			appType: platform === 'mp-weixin' ? 'WXXCX' : platform === 'mp-toutiao' ? 'DYXCX' : '',
			//消息队列的缓存名称
			messageQueueName: 'messages_list_real_leiyunbaihuo',
			// openIdCacheName
			openIdCacheName: 'openId',
			// avatarUrlCacheName
			avatarUrlCacheName: 'avatarUrl',
			// nickNameCacheName
			nickNameCacheName: 'nickName',
			// modeNameCacheName
			modeNameCacheName: 'modeName',
			//temperatureNameCacheName
			temperatureNameCacheName: 'temperature',
			// audioSwitchName
			audioSwitchName: 'audioSwitch',
			audioSexName: 'audioSex',
			//创作页跳转到会话页的参数
			produceInfo: null,
			//绘画详情也进行重画操作
			reDrawTask: null,
			//播放广告获取奖励类型
			adTypePlay: null,
			isBlank: function(data) {
				return data == null || data == 'null' || data == '' || data == 'undefined';
			},
			isNotBlank: function(data) {
				return !this.isBlank(data);
			},
			// 判断是否在开发者工具中
			isDevTools: function() {
				if (this.isDev || (this.globalData != null && this.globalData.isDev)) {
					return true;
				}
				return platform === 'devtools';
			}
		},
		onLaunch: function() {
			console.log('App Launch')
			this.globalData.$i18n = this.$i18n
			this.globalData.$t = str => this.$t(str)
			initApp();
			uniIdPageInit()
			uni.http = http;
			uni.tool = tool;
			uni.subscribed = false;
			console.log('App Launch')
			uni.onPushMessage((res) => {
				console.log("App，收到推送消息：", res) //监听推送消息
			})
			uni.setInnerAudioOption({
				mixWithOther: false,
				obeyMuteSwitch: false,
			});
			// #ifdef APP-PLUS
			//checkIsAgree(); APP端暂时先用原生默认生成的。目前，自定义方式启动vue界面时，原生层已经请求了部分权限这并不符合国家的法规
			// #endif

			// #ifdef H5
			// checkIsAgree(); // 默认不开启。目前全球，仅欧盟国家有网页端同意隐私权限的需要。如果需要可以自己去掉注视后生效
			// #endif

			// #ifdef APP-PLUS
			//idfa有需要的用户在应用首次启动时自己获取存储到storage中
			/*var idfa = '';
			var manager = plus.ios.invoke('ASIdentifierManager', 'sharedManager');
			if(plus.ios.invoke(manager, 'isAdvertisingTrackingEnabled')){
				var identifier = plus.ios.invoke(manager, 'advertisingIdentifier');
				idfa = plus.ios.invoke(identifier, 'UUIDString');
				plus.ios.deleteObject(identifier);
			}
			plus.ios.deleteObject(manager);
			console.log('idfa = '+idfa);*/
			// #endif
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	.shadow {
		box-shadow: 3px 3px 3px 1px rgba(0, 0, 0, 0.2);
	}

	.loading-view {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 0px 10px;
	}

	@keyframes rotate {
		0% {
			transform: rotate(0deg);
		}

		100% {
			transform: rotate(360deg);
		}
	}

	.rotate-animation {
		animation: rotate 2s linear infinite;
		/* 设置动画持续时间为2秒，线性变化无限次 */
	}

	.flex-column {
		display: flex;
		flex-direction: column;
	}

	.flex-row {
		display: flex;
		flex-direction: row;
	}
</style>