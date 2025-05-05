<template>
	<view class="device-root">
		<view class="device-product-row">
			<view class="device-selector" @click="onDeviceClick">
				<text class="device-name">心脏健康管理</text>
				<uni-icons class="action-icon" :type="`${isSelectorOpen ? 'up' : 'down'}`" size="13" color="#C0C0C0" />
			</view>
			<view class="flex-row" style="align-items: center;">
				<image v-if="isOrderFinished" :class="`device-icon ${beating ? 'breathing-animation' : ''}`"
					mode="heightFix" @click="bindDevice"
					src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/device/router_white.png" />
				<text v-else class="device-price"></text>
			</view>
		</view>
		<view class="device-product-row">
			<view class="flex-row" style="flex: 1; align-items: center;">
				<view class="device-tips" :style="`align-items: center; ${isDefaultStyle?'':'font-size: 11px'}`">
					<uni-icons v-if="isOrderFinished" type="vip-filled" size="16" :color="vipColor" />
					<text v-if="isOrderFinished"
						:style="`margin-left: 3px; font-size: 12px; font-weight: bold; color: ${vipColor};`">{{productIntro}}</text>
					<text>{{isOrderFinished ? '&nbsp;|&nbsp;健康管理 1年' : '* 产品配置图片仅供参考' }}</text>
				</view>
				<view v-if="isOrderFinished" class="device-tips"
					:style="`color: #4C5382; margin-left: 6px; ${isDefaultStyle?'':'font-size: 11px'}`" />
				<view v-else class="device-tips"
					:style="`color: #4C5382; margin-left: 6px; ${isDefaultStyle?'':'font-size: 11px'}`"
					@click="bindDevice">绑定设备 >></view>
			</view>
			<view v-if="isOrderFinished" class="device-product-row" style="margin: 0px;">
				<text class="device-tips" style="padding: 5px 3px;">{{beating ? '监测中' : '已连接'}}</text>
			</view>
			<view v-else class="flex-row" style="align-items: center;" @click="toGuidance">
				<text class="device-tips">如何使用</text>
				<uni-icons style="margin-left: 3px;" type="help" size="15" color="#C0C0C0" />
			</view>
		</view>
		<view v-if="isOrderFinished" class="flex-column" style="align-items: center;" @click="bindDevice">
			<image style="width: 240px; margin: 20px;" mode="widthFix" :src="productImages[0]" />
		</view>
		<view v-else class="flex-row" style="align-items: center; margin: 15px 0px 15px;">
			<view class="flex-column"
				:style="`padding: 0px 21px; ${currentIntro == 0 ? '' : 'border-right: 1px dashed rgba(76, 83, 130, 0.4);'}`">
				<text :class="`${currentIntro == 0 ? 'device-product-intro-selected' : 'device-product-intro'}`"
					style="margin-bottom: 15px;" @click.stop="changeIntro(0)">智能硬件</text>
				<text :class="`${currentIntro == 1 ? 'device-product-intro-selected' : 'device-product-intro'}`"
					style="margin-bottom: 15px;" @click.stop="changeIntro(1)">健康监测</text>
				<text :class="`${currentIntro == 2 ? 'device-product-intro-selected' : 'device-product-intro'}`"
					style="margin-bottom: 15px;" @click.stop="changeIntro(2)">风险筛查</text>
				<text :class="`${currentIntro == 3 ? 'device-product-intro-selected' : 'device-product-intro'}`"
					@click.stop="changeIntro(3)">专家服务</text>
			</view>
			<!-- 设备介绍Slider -->
			<swiper class="device-product-swiper" :style="swiperStyle" :circular="true" :current="currentIntro"
				@change="onIntroChanged">
				<swiper-item v-for="(item, index) in productImages" :key="`product-image-swiper-${index}`"
					class="device-swiper-item">
					<image v-if="index == 0" class="device-product-main" mode="widthFix" :src="item" />
					<image v-else class="device-product-image" mode="widthFix" :src="item" />
				</swiper-item>
			</swiper>
		</view>
		<view class="device-advantages">
			<text class="device-desc-text">夜间睡眠时的心率、呼吸自动感知</text>
			<view class="device-column-divider" />
			<text class="device-desc-text">持续监测健康趋势，风险自动识别</text>
			<view class="device-column-divider" />
			<text class="device-desc-text">无门槛、可视化呵护自己和家人的健康</text>
		</view>
		<view v-if="isOrderFinished" class="flex-column shadow"
			style="margin: 20px; border-radius: 10px; overflow: hidden;">
			<report-data ref="reportData" :report="reportToday" :product="product" from="device"
				@to-report="toReportHistory" />
			<view class="report-tips-container">
				<bcg-monitor v-if="beating" ref="bcgMonitor" />
				<view v-else-if="reportLoading" class="loading-view" style="min-height: 90px;">
					<uni-icons class="rotate-animation" type="spinner-cycle" size="24" color="#A0A0A0" />
				</view>
				<view v-else class="item-report-container">
					<text v-if="hasExpertAdvice" class="item-report-text"
						:style="`color: #282828; ${isDefaultStyle?'':'font-size: 14px'}`">{{expertAdvice}}</text>
					<view v-else-if="reportTipToday" style="marginTop: 10px; white-space: pre-wrap;">
						<uaMarkDown :source="reportTipToday"
							:outerStyle="`font-size: ${isDefaultStyle ? '12' : '14'}px; color: #808080; line-height: 20px;`"
							:showLine="false" />
					</view>
					<view v-else style="display: flex; flex-direction: row; margin-bottom: 10px;"
						@click="toReportHistory">
						<text class="item-report-text"
							:style="`color: #A0A0A0; ${isDefaultStyle?'':'font-size: 14px'}`">{{reportEmpty}}</text>
						<text v-if="isInService" class="item-report-text"
							:style="`color: #4C5382; margin-left: 6px; ${isDefaultStyle?'':'font-size: 14px'}`">查看历史
							>></text>
						<text v-else class="item-report-text"
							:style="`color: #4C5382; margin-left: 6px; ${isDefaultStyle?'':'font-size: 14px'}`"
							@click.stop="toServiceUpgrade">{{emptyAction}}</text>
					</view>
				</view>
				<view v-if="reportTipToday && !reportLoading && !beating"
					style="display: flex; flex-direction: row; margin-top: 8px;">
					<view style="flex: 1;" />
					<button class="report-detail-button" @click.stop="toReportDetail">查看详情</button>
				</view>
			</view>
		</view>
		<!-- 服务Slider -->
		<swiper v-else style="margin: 10px" :style="serviceStyle" next-margin="40px" :circular="true"
			:current="currentService" @change="onServiceChanged">
			<swiper-item v-for="index in [0,1,2]" :key="`service-swiper-${index}`" class="device-swiper-item">
				<service-item :index="index" @purchase="purchase" @upgrade="upgrade" />
			</swiper-item>
		</swiper>
		<view v-if="isPurchased" class="device-address">
			<view class="device-text-row">
				<text class="device-label" style="width: 52px;">收件人</text>
				<text class="device-label" style="width: 21px;">：</text>
				<text class="device-text">{{username}}</text>
			</view>
			<view class="device-text-row">
				<text class="device-label" style="width: 52px;">收件地址</text>
				<text class="device-label" style="width: 21px;">：</text>
				<text v-if="hasAddress" class="device-text">{{addressText}}</text>
				<text v-else class="device-text" style="color: #4C5382; font-weight: bold;" @click="chooseAddress">请填写地址
					>></text>
			</view>
			<view v-if="isPurchased" class="device-text-row">
				<text class="device-label" style="width: 52px;">京东快递{{hasFreightId ? '（长按复制）' : ''}}</text>
				<text class="device-label" style="width: 21px;">：</text>
				<text class="device-text">{{hasFreightId ? product.freightId : freightTime}}</text>
			</view>
		</view>
		<view v-if="!isNotOrdered" class="device-pay">
			<uni-icons type="star-filled" size="15" color="#4C5382" />
			<text class="device-tip-text" style="flex: 1; font-size: 11px; margin-left: 3px;">{{orderCountDesc}}</text>
			<button v-if="isPurchased && !hasFreightId" class="device-pay-button"
				@click="chooseAddress">{{addressBtnText}}</button>
			<button v-if="isPurchased" class="device-pay-button" @click="bindDevice">绑定设备</button>
			<button v-if="isOrderFinished" class="device-share-button" open-type="share"
				@touchstart="onShareDevice">共享</button>
		</view>
		<uni-popup ref="popupSelector" type="top" mask-background-color="rgba(0, 0, 0, 0.3)"
			@maskClick="closePopupSelector">
			<popup-selector mode="base" @closePopup="closePopupSelector" @click="closePopupSelector" />
		</uni-popup>
		<uni-popup ref="popupReceived" type="center" mask-background-color="rgba(0, 0, 0, 0.7)"
			@maskClick="closePopupReceived">
			<popup-received ref="popupReceivedContent" mode="base" @closePopup="closePopupReceived"
				@onProduct="onProduct" @onAddress="chooseAddress" @onContinue="toOrder" />
		</uni-popup>
	</view>
</template>

<script>
	import serviceItem from '@/components/health/service-item.vue';
	import uaMarkDown from '@/components/ua-markdown/ua-markdown.vue';
	import bcgMonitor from '@/components/health/bcg-monitor.vue';
	import reportData from '@/components/health/report-data.vue';
	import popupSelector from '@/components/popup/popup-selector.vue';
	import popupReceived from '@/components/popup/popup-product-received.vue';
	import {
		EXPERT_PRICE_MONTH,
		EXPERT_PRICE_YEAR,
		PRODUCT_PRICE_AUTOTIP,
		PRODUCT_PRICE_EXPERT,
		PRODUCT_PRICE_EXPERT_MONTH,
		PRODUCT_PRICE_NORMAL,
		PRODUCT_SLEEP_BELT,
		PRODUCT_TYPE_SLEEP_BELT,
		SERVICE_PRICE_FIRST_YEAR,
		SERVICE_PRICE_MONTH,
		SERVICE_PRICE_YEAR,
		createProduct,
		getProductPrice,
		getServiceType,
		toCustomService,
		updateUserAddress
	} from '@/common/js/productorder';
	import {
		imageMap,
		payForProduct,
		subscribeReportPush,
		updateUserInfo,
		shareProduct,
		receiveProduct
	} from '@/common/js/device';
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store';
	import {
		getFreightDdl,
		getFreightTime,
		getMillisNow,
		monthInMillis,
		yearInMillis
	} from '@/common/utils/timestamp';
	import {
		fetchReportTips,
		syncDeviceData,
		updateDeviceReport,
	} from '@/common/js/monitor';
	import {
		tipContent
	} from '@/common/js/record';
	const db = uniCloud.database();
	export default {
		data() {
			return {
				isPageHidden: false,
				interrupt: 0,
				currentIntro: 0, // 当前产品介绍索引
				introAutoPlay: true, // 产品介绍自动播放
				swiperStyle: {}, // 产品介绍滑动样式
				currentService: 0, // 当前选择健康管理服务索引
				serviceStyle: {}, // 服务介绍滑动样式
				serviceType: -1, // 服务类型：[-1: 免费健康管理 1月 | 0: 智能健康管理 1年 | 1: 专家健康管理 1月 | 2: 专家健康管理 1年]
				inService: -1, // 智能健康管理服务状态
				product: store.hasProducts() ? store.userInfo.products[store.userConfig.productIndex] : {
					poid: undefined,
					type: PRODUCT_TYPE_SLEEP_BELT,
					name: PRODUCT_SLEEP_BELT,
					price: PRODUCT_PRICE_NORMAL,
					amount: 1,
					state: store.currentProductState,
					serviceStart: undefined,
					serviceEnd: undefined
				},
				receivedProduct: undefined,
				reportId: undefined,
				reportToday: undefined,
				reportTipToday: undefined,
				reportLoading: true,
				isSelectorOpen: false,
				isShareOpen: false
			}
		},
		components: {
			serviceItem,
			uaMarkDown,
			bcgMonitor,
			reportData,
			popupSelector,
			popupReceived
		},
		computed: {
			isDefaultStyle() {
				return store.userConfig.fontStyle == 'normal';
			},
			hasLogin: function() {
				return store.hasLogin;
			},
			deviceName: function() {
				const nickname = this.product.nickname;
				const name = this.product.name;
				return nickname?.length > 0 ? nickname : (name?.length > 0 ? name : '已绑定的设备');
			},
			currentPrice: function() {
				const arr = [3888, 9880, 28800];
				return arr[this.currentService];
			},
			servicePriceMonth: function() {
				return SERVICE_PRICE_MONTH;
			},
			servicePriceFirstYear: function() {
				return SERVICE_PRICE_FIRST_YEAR;
			},
			servicePriceYear: function() {
				return SERVICE_PRICE_YEAR;
			},
			expertPriceMonth: function() {
				return EXPERT_PRICE_MONTH;
			},
			expertPriceYear: function() {
				return EXPERT_PRICE_YEAR;
			},
			isNotOrdered: function() {
				return this.product?.state == -1;
			},
			isPurchased: function() {
				return this.product?.state == 1;
			},
			isRefunding: function() {
				return this.product?.state == 2;
			},
			isOrderFinished() {
				return this.product?.state == 3;
			},
			isOrdered: function() {
				return this.product?.state > 0
			},
			productImages: function() {
				return [
					imageMap[this.product.type],
					"https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/device/product_intro_health.jpg",
					"https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/device/product_intro_report.jpg",
					"https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/device/product_intro_notice.jpg"
				];
			},
			vipColor: function() {
				return this.serviceExpert ? '#DB545C' : (this.serviceAI ? '#5F9EA0' : '#4C5382');
			},
			productIntro: function() {
				return this.serviceExpert ? '旗舰版' : (this.serviceAI ? '专业版' : '标准版');
			},
			serviceAI: function() {
				return this.serviceType == 0;
			},
			serviceExpertMonth: function() {
				return this.serviceType == 1;
			},
			serviceExpert: function() {
				return this.serviceType == 2;
			},
			serviceDesc: function() {
				if (this.serviceAI) {
					return '智能健康管理 1年';
				} else if (this.serviceExpertMonth) {
					return '专家健康管理 1月';
				} else if (this.serviceExpert) {
					return '专家健康管理 1年';
				} else {
					return '免费健康服务 1月';
				}
			},
			servicePrice: function() {
				const prices = [
					'',
					'￥' + SERVICE_PRICE_FIRST_YEAR,
					'￥' + EXPERT_PRICE_MONTH,
					'￥' + EXPERT_PRICE_YEAR
				];
				return prices[this.serviceType + 1];
			},
			isInService: function() {
				if (this.inService != -1) {
					return this.inService;
				}
				this.inService = this.product.serviceEnd && (getMillisNow() < Number(this.product.serviceEnd));
				return this.inService;
			},
			hasExpertAdvice() {
				return store.userConfig.monitor[4].risk.advice?.length > 0;
			},
			expertAdvice() {
				return store.userConfig.monitor[4].risk.advice;
			},
			reportEmpty() {
				return this.isInService ? '今日暂无数据' : (this.product.serviceStart ? '您的服务已到期' : '您还没有购买服务');
			},
			emptyAction() {
				return this.product.serviceStart ? '续费 >> ' : '购买 >> ';
			},
			stateDesc: function() {
				let desc = '￥' + PRODUCT_PRICE_NORMAL;
				if (this.isPurchased) {
					desc = `￥${this.product.price * this.product.amount}（已购买）`;
				} else if (this.isRefunding) {
					desc = '退款中';
				}
				return desc;
			},
			deviceTips: function() {
				return this.isOrdered ? '心脉AI：持续守护您和家人的心血管健康' : '预计锁单后1周内发货';
			},
			hasAddress: function() {
				return store.hasAddress();
			},
			username: function() {
				return store.username();
			},
			addressText: function() {
				return store.addressText();
			},
			addressBtnText: function() {
				return this.hasAddress ? '更新地址' : '填写地址';
			},
			hasFreightId: function() {
				return this.product.freightId?.length > 0;
			},
			freightTime: function() {
				const timestamp = this.product.serviceStart;
				return `预计${timestamp ? getFreightTime(timestamp) : '明天'}发货`;
			},
			orderCountDesc: function() {
				return `已有${store.orderCount}人订阅`;
			},
			beating: function() {
				return store.userConfig.beating;
			}
		},
		onLoad(option) {
			this.init(option);
			uni.$on('loginSuccess', this.initProduct);
			uni.$on('productUpdate', (product) => {
				console.log("Device, productUpdate: ", product);
				product ? this.onProduct(product) : this.initProduct(true);
			});
			uni.$on('dailyReport', (dailyReport) => {
				this.reportId = dailyReport.id;
				this.reportTipToday = tipContent(dailyReport.content);
			});
			uni.$on('servicePaid', (fee) => {
				if (!this.product || !this.product.serviceEnd) {
					console.log("Device, 产品或服务不存在");
					return;
				}
				const serviceMillis = Math.max(Number(this.product.serviceEnd), getMillisNow());
				this.product.serviceEnd = String(serviceMillis + (fee == SERVICE_PRICE_YEAR ? yearInMillis() :
					monthInMillis()));
				updateUserInfo(store.userInfo._id, {
					products: store.userInfo.products
				});
			});
			this.fetchOrderCount();
			if (this.hasLogin) {
				this.fetchDetail();
			} else {
				this.toLogin();
			}
		},
		onShow() {
			console.log('Device, onShow');
			this.isPageHidden = false;
			if (store.userConfig.beating == false) {
				this.startMonitor();
			}
		},
		onHide() {
			console.log('Device, onHide');
			this.isPageHidden = true;
			store.userConfig.beating = false;
		},
		onUnload() {
			uni.$off('loginSuccess');
			uni.$off('productUpdate');
			uni.$off('dailyReport');
			uni.$off('servicePaid');
		},
		onShareTimeline: function() {
			let query = "";
			if (store.hasInviteCode()) {
				query = `uniInvitationCode=${store.userInfo.inviteCode}`;
			}
			console.log("Device, onShareTimeline, query = " + query);
			return {
				title: "心脉AI：持续守护您和家人的心血管健康",
				query: query
			};
		},
		onShareAppMessage: async function() {
			let path = 'pages/device/device';
			const invite = store.hasInviteCode();
			if (invite) {
				path += `?uniInvitationCode=${store.userInfo.inviteCode}`;
			}
			const sid = this.product.device?.sensorID;
			let title = undefined;
			if (this.isShareOpen && sid) {
				shareProduct(this.product);
				path += `${invite ? '&' : '?'}sid=${sid}`;
				title = "共享设备给好友";
			} else {
				title = "持续守护您和家人的心血管健康";
			}
			console.log("Device, onShareAppMessage, path = " + path);
			return {
				title: title,
				path: path
			};
		},
		methods: {
			init: function(option) {
				const systemInfo = getApp().globalData.systemInfo;
				const windowWidth = systemInfo.windowWidth; // 注意：这里可能是窗口宽度，如果需要全屏宽度请使用 screenWidth
				this.swiperStyle.height = `${Math.round(windowWidth * 2 / 3)}px`;
				this.serviceStyle.height = `${Math.round(windowWidth * 1.3)}px`;
				if (option.sid?.length > 0 && this.hasLogin) {
					receiveProduct(option.sid, product => {
						product.nickname = undefined;
						this.receivedProduct = product;
						this.showPopupReceived('share', product);
					});
				}
			},
			startMonitor: function() {
				if (!this.isOrderFinished) {
					// 没有完成设备购买，不进行监测
					return;
				}
				// 监测实时心率
				const onBeat = beatInfo => {
					if (this.isPageHidden) {
						// 页面隐藏，不进行监测
						return;
					}
					const dataComponent = this.$refs.reportData;
					if (dataComponent) {
						dataComponent.onBeating(this.beating, beatInfo);
					}
					const bcgMonitor = this.$refs.bcgMonitor;
					if (this.beating && bcgMonitor) {
						bcgMonitor.onBeating(beatInfo);
						if (beatInfo.heartRate == 0) {
							this.interrupt += 1;
							console.log("Device, interrupt = " + this.interrupt);
							if (this.interrupt >= 15) {
								this.stopMonitor();
							}
						} else {
							this.interrupt = 0;
						}
					} else if (beatInfo?.heartRate > 0) {
						store.userConfig.beating = true;
					}
				};
				const onComplete = beats => {
					console.log('Device, 监测实时心率完成：', beats);
				};
				const onFail = err => {
					console.log('Device, 监测实时心率失败: ', err);
					this.stopMonitor();
				};
				uni.http.streamBeats(onComplete, onFail, onBeat, -1);
			},
			stopMonitor: function() {
				console.log("Device, StopMonitor");
				this.interrupt = 0;
				store.userConfig.beating = false;
			},
			toLogin: function() {
				store.reLaunchUrl = 'pages/device/device';
				uni.navigateTo({
					url: '/uni_modules/uni-id-pages/pages/login/login-withoutpwd'
				});
			},
			copyContent: function(content) {
				if (content?.length > 0) {
					uni.setClipboardData({
						data: content
					});
				}
			},
			fetchOrderCount: function() {
				db.collection('health-product-order').count().then(res => {
					if (res?.result?.total) {
						store.orderCount = 1680 + res.result.total;
					}
				});
			},
			showPopupSelector: function() {
				this.isSelectorOpen = true;
				this.$refs.popupSelector.open();
			},
			closePopupSelector: function() {
				this.isSelectorOpen = false;
				this.$refs.popupSelector.close();
			},
			toServiceUpgrade: function() {
				uni.navigateTo({
					url: `/modules/device/pages/service`
				});
			},
			showPopupReceived: function(from, product) {
				this.$refs.popupReceivedContent.update(from, product);
				this.$refs.popupReceived.open();
			},
			closePopupReceived: function() {
				this.$refs.popupReceived.close();
			},
			initProduct: function(reset = false) {
				if (store.hasProducts()) {
					const product = store.userInfo.products[store.userConfig.productIndex]
					this.onProduct(product);
					this.subscribe(product);
				} else if (reset) {
					const product = createProduct();
					this.onProduct(product);
				}
			},
			onProduct: function(product) {
				console.log("Device, onProduct: ", product);
				if (!product.amount) {
					product.amount = 1;
				}
				if (product.device?.sensorID != this.product.device?.sensorID) {
					this.reportId = undefined;
					this.reportToday = undefined;
					this.reportTipToday = undefined;
				}
				this.product = product;
				this.inService = -1;
				this.serviceType = getServiceType(this.product.price);
				store.currentProductState = product.state;
				if (product.device?.sensorID.length > 0) {
					this.fetchReport();
				} else {
					this.reportLoading = false;
				}
			},
			subscribe: function(product) {
				if (this.isOrderFinished && product.device?.sensorID.length > 0) {
					subscribeReportPush(product);
				}
			},
			fetchDetail: function() {
				store.fetchProducts((res) => {
					this.initProduct();
				});
			},
			fetchReport: function() {
				if (this.reportTipToday?.length > 0) {
					// 今日报告已存在
					this.reportLoading = false;
				} else {
					this.reportLoading = true;
				}
				updateDeviceReport((deviceData, latestReport) => {
					this.reportToday = latestReport;
					this.getReportTips(latestReport);
					syncDeviceData(deviceData);
				}, err => {
					this.reportLoading = false;
				});
			},
			getReportTips: function(report) {
				if (!this.isInService) {
					// 服务到期，需要续费
					console.log("Device, 健康报告解读: 服务到期需要续费");
					this.reportLoading = false;
					return;
				}
				if (report.reportTips) {
					// 解读已完成
					console.log("Device, 今日健康报告已解读完成");
					this.reportId = report.BasicReportID;
					this.reportTipToday = tipContent(report.reportTips);
					this.reportLoading = false;
					return;
				}
				const onSuccess = (dailyReport) => {
					console.log("Device, 今日健康报告解读成功: ", dailyReport);
					this.reportId = dailyReport.id;
					this.reportTipToday = tipContent(dailyReport.content);
					this.reportLoading = false;
				};
				const onFail = (err) => {
					uni.showToast({
						title: "解析失败",
						icon: 'none',
						duration: 2000
					});
					this.reportLoading = false;
				};
				const reports = store.getDeviceReports();
				const oldestReport = reports[reports.length - 1].businessData;
				fetchReportTips(report, onSuccess, onFail, oldestReport);
			},
			changeIntro: function(index) {
				this.currentIntro = index;
			},
			onIntroChanged: function(event) {
				this.currentIntro = event.detail.current;
				if (this.currentIntro == 0) {
					this.introAutoPlay = false;
				}
			},
			onServiceChanged: function(event) {
				if (store.hasProducts()) {
					return;
				}
				this.currentService = event.detail.current;
				let serviceType = -1;
				if (this.currentService == 2) {
					serviceType = 2;
				} else if (this.currentService == 1) {
					serviceType = 0;
				} else if (this.currentService == 0) {
					serviceType = -1;
				}
				this.serviceChanged(serviceType);
			},
			previewImage: function() {
				uni.previewImage({
					current: this.currentIntro,
					urls: this.productImages
				});
			},
			toReportHistory: function() {
				uni.navigateTo({
					url: `/modules/health/pages/healthreport`
				});
			},
			toReportDetail: function() {
				const tips = this.hasExpertAdvice ? this.expertAdvice : this.reportTipToday;
				uni.navigateTo({
					url: `/pages/records/report?id=${String(this.reportId).toUpperCase()}&reportTips=${tips}&reportTime=${this.reportToday.EndTime}&from=healthReport`
				});
			},
			decrease: function() {
				if (this.product.amount > 1) {
					this.product.amount -= 1;
				} else {
					uni.showToast({
						icon: 'none',
						title: '最少不低于1个产品',
						duration: 600
					});
				}
			},
			increase: function() {
				if (this.product.amount < 10) {
					this.product.amount += 1;
				} else {
					const that = this;
					uni.showModal({
						content: `您购买的数量超过10个，确定继续增加吗？`,
						confirmColor: '#4C5382',
						confirmText: "确定",
						showCancel: true,
						cancelText: "取消",
						cancelColor: '#808080',
						success(res) {
							if (res.confirm) {
								that.product.amount += 1;
							}
						}
					});
				}
			},
			toService: function() {
				toCustomService();
			},
			serviceChanged: function(serviceType) {
				this.serviceType = serviceType;
				this.product.price = getProductPrice(serviceType);
			},
			toProductOrder: function() {
				if (!this.hasLogin) {
					this.toLogin();
				} else if (!this.isNotOrdered) {
					uni.navigateTo({
						url: `/modules/device/pages/myproducts`
					});
				}
			},
			onDeviceClick: function() {
				if (this.isOrderFinished) {
					store.userInfo.products?.length > 1 ? this.showPopupSelector() : this.bindDevice();
				}
			},
			bindDevice: function() {
				if (this.hasLogin) {
					uni.navigateTo({
						url: `/modules/device/pages/binddevice?productType=${this.product.type}&productName=${this.product.name}&productPrice=${this.product.price}`
					});
				} else {
					this.toLogin();
				}
			},
			onShareDevice: function() {
				this.isShareOpen = true;
			},
			chooseAddress: function() {
				if (this.hasLogin) {
					updateUserAddress(this.product.poid);
				} else {
					this.toLogin();
				}
			},
			toOrder: function() {
				const totalPrice = this.product.price * this.product.amount;
				const fee = totalPrice;
				const desc = `心脏健康管理服务 | ${this.productIntro}：`;
				const state = 1;
				payForProduct(this.product.price, this.product.amount, fee, desc, state, this.product.type, this
					.product.poid);
			},
			upgrade: function(product) {
				const totalPrice = (product.price - this.product.price) * this.product.amount;
				const fee = totalPrice;
				const desc = `套餐升级：${this.productIntro} 至 ${product.intro}`;
				const state = 1;
				payForProduct(product.price, this.product.amount, fee, desc, state, product.type, this.product.poid);
			},
			purchase: function() {
				if (this.hasLogin) {
					this.showPopupReceived('purchase', this.product);
				} else {
					this.toLogin();
				}
			},
			toGuidance: function() {
				if (this.hasLogin) {
					uni.navigateTo({
						url: `/modules/device/pages/guidance`
					});
				} else {
					this.toLogin();
				}
			}
		}
	}
</script>

<style>
	page {
		background-color: #F6F6F6;
	}

	.device-root {
		display: flex;
		flex-direction: column;
		background: linear-gradient(0deg, #F6F6F6 40%, rgba(76, 83, 130, 0.2) 66%, rgba(76, 83, 130, 0.2) 72%, #F6F6F6 95%);
	}

	.device-product-row {
		display: flex;
		flex-direction: row;
		align-items: center;
		margin: 0px 20px;
	}

	.device-selector {
		flex: 1;
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.device-name {
		margin-right: 3px;
		font-size: 18px;
		font-weight: normal;
		color: #484848;
	}

	.device-icon {
		width: 18px;
		height: 18px;
		padding: 7px;
		border-radius: 50%;
		overflow: hidden;
		background-color: #4C5382;
	}

	.device-icon:active {
		opacity: 0.8;
	}

	@keyframes breathing {
		0% {
			opacity: 0.2;
		}

		50% {
			opacity: 1;
		}

		100% {
			opacity: 0.2;
		}
	}

	.breathing-animation {
		animation: breathing 2s linear infinite;
		/* 设置动画持续时间为2秒，线性变化无限次 */
		background: linear-gradient(135deg, rgba(219, 84, 92, 1) 0%, rgba(76, 83, 130, 1) 85%);
	}

	.device-product-amount {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.amount-text {
		flex: 1;
		text-align: center;
		min-width: 15px;
		font-size: 13px;
		color: #A0A0A0;
	}

	.device-tips {
		display: flex;
		flex-direction: row;
		color: #C0C0C0;
		font-size: 10px;
	}

	.item-service-chat {
		display: flex;
		flex-direction: row;
		align-items: center;
		width: 12px;
		height: 12px;
		margin-right: 6px;
	}

	.device-price {
		color: #4C5382;
		font-size: 14px;
	}

	.device-product-intro {
		font-size: 12px;
		color: #4C5382;
		padding: 4px 21px;
		border-radius: 20px;
		box-shadow: 1px 1px 1px 0px rgba(76, 83, 130, 0.6);
		background: linear-gradient(90deg, #FFFFFF 0%, rgba(76, 83, 130, 0.1) 100%);
	}

	.device-product-intro-selected {
		font-size: 12px;
		color: white;
		padding: 4px 21px;
		border-radius: 20px;
		box-shadow: 1px 1px 1px 0px rgba(76, 83, 130, 0.8);
		background: linear-gradient(270deg, rgba(76, 83, 130, 0.6) 0%, rgba(76, 83, 130, 1) 100%);
	}

	.device-product-swiper {
		flex: 1;
		height: 240px;
	}

	.device-swiper-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.device-product-main {
		width: 200px;
		border-radius: 6px;
		box-shadow: 3px 2px 3px 1px rgba(0, 0, 0, 0.3);
		margin-bottom: 4px;
		margin-right: 10px;
		overflow: hidden;
	}

	.device-product-image {
		width: 108px;
		border-radius: 10px;
		border: 3px solid white;
		box-shadow: 3px 2px 3px 1px rgba(0, 0, 0, 0.3);
		margin-bottom: 4px;
		overflow: hidden;
	}

	.report-tips-container {
		display: flex;
		flex-direction: column;
		padding: 15px 10px;
		background-color: white;
	}

	.item-report-container {
		display: flex;
		flex-direction: row;
		align-items: center;
		margin: 0px 15px;
		min-height: 90px;
	}

	.report-detail-button {
		background-color: #468294;
		color: white;
		border-radius: 20px;
		font-size: 11px;
		padding: 0px 15px;
		line-height: 24px;
	}

	.report-detail-button:active {
		opacity: 0.8;
	}

	.item-report-text {
		margin-top: 10px;
		font-size: 11px;
		color: #808080;
		line-height: 18px;
	}

	.text-ellipsis {
		line-height: 18px;
		max-height: 200px;
		word-break: break-all;
		text-overflow: ellipsis;
		overflow: hidden;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 10;
	}

	.device-advantages {
		display: flex;
		flex-direction: row;
		align-items: center;
		margin: 0px 30px;
	}

	.device-column-divider {
		width: 1px;
		height: 24px;
		margin: 0px 20px;
		background-color: #A0A0A0;
	}

	.device-desc-text {
		flex: 1;
		font-size: 11px;
		color: #A0A0A0;
	}

	.device-tip-text {
		line-height: 20px;
		font-size: 12px;
		color: #A0A0A0;
		margin-top: 1px;
	}

	.action-icon {
		margin-right: 10px;
	}

	.device-tip-trigger {
		display: flex;
		flex-direction: row;
		font-size: 11px;
		border: solid 1px #A0A0A0;
		border-radius: 20px;
		margin-right: 6px;
	}

	.trigger-item-button {
		font-size: 11px;
		line-height: 18px;
		padding: 0px 15px;
		margin-right: 6px;
		color: dimgray;
		text-align: center;
		border: solid 1px #A0A0A0;
		border-radius: 18px;
	}

	.trigger-item-button-selected {
		font-size: 11px;
		line-height: 18px;
		padding: 0px 15px;
		margin-right: 6px;
		color: white;
		text-align: center;
		background-color: #4C5382;
		border: solid 1px #4C5382;
		border-radius: 18px;
	}

	.trigger-item-left {
		height: 18px;
		line-height: 18px;
		padding: 0px 15px 0px 18px;
		color: dimgray;
		text-align: center;
		background-color: white;
		border-top-left-radius: 18px;
		border-bottom-left-radius: 18px;
	}

	.trigger-item-selected-left {
		height: 18px;
		line-height: 18px;
		padding: 0px 15px 0px 18px;
		color: white;
		text-align: center;
		background-color: #4C5382;
		border-top-left-radius: 18px;
		border-bottom-left-radius: 18px;
	}

	.trigger-item-right {
		height: 18px;
		line-height: 18px;
		padding: 0px 18px 0px 15px;
		color: #A0A0A0;
		text-align: center;
		background-color: white;
		border-top-right-radius: 18px;
		border-bottom-right-radius: 18px;
	}

	.trigger-item-selected-right {
		height: 18px;
		line-height: 18px;
		padding: 0px 18px 0px 15px;
		color: white;
		text-align: center;
		background-color: #4C5382;
		border-top-right-radius: 18px;
		border-bottom-right-radius: 18px;
	}

	.device-address {
		display: flex;
		flex-direction: column;
		margin: 20px 20px;
	}

	.device-text-row {
		display: flex;
		flex-direction: row;
		margin: 0px 10px;
	}

	.device-label {
		font-size: 12px;
		color: #808080;
		line-height: 24px;
		vertical-align: middle;
	}

	.device-text {
		flex: 1;
		font-size: 12px;
		color: #808080;
		line-height: 24px;
		vertical-align: middle;
		white-space: pre-wrap;
	}

	.device-product-icon {
		width: 18px;
		padding: 3px 3px;
	}

	.device-pay {
		display: flex;
		flex-direction: row;
		align-items: center;
		margin: 10px 20px 30px;
	}

	.device-pay-tips {
		flex: 1;
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.device-share-button {
		margin-left: 10px;
		padding: 3px 15px;
		line-height: 21px;
		font-size: 12px;
		color: #4C5382;
		border: 1px solid #4C5382;
		border-radius: 5px;
	}

	.device-share-button:active {
		background-color: rgba(76, 83, 130, 0.1);
	}

	.device-pay-button {
		background-color: #4C5382;
		color: white;
		border: 1px solid #4C5382;
		border-radius: 20px;
		font-size: 12px;
		font-weight: bold;
		padding: 0px 20px;
		margin: 10px 0px 10px 10px;
		line-height: 24px;
	}

	.device-pay-button:active {
		opacity: 0.8;
	}

	.device-pay-button-disable {
		background-color: white;
		color: #A0A0A0;
		border: 1px solid #A0A0A0;
		border-radius: 20px;
		font-size: 12px;
		font-weight: bold;
		padding: 0px 20px;
		margin: 10px 0px 10px 10px;
		line-height: 24px;
	}
</style>