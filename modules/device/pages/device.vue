<template>
	<view class="device-root">
		<!-- <scroll-view class="device-root" scroll-y="true" :refresher-enabled="true" :refresher-triggered="pulling"
		@refresherrefresh="pullRefresh"> -->
		<view class="device-product-row">
			<view class="device-selector" @click="onDeviceClick">
				<text v-if="isOrderFinished" class="device-name"
					style="font-weight: normal; font-size: 19px; color: #484848;">{{deviceName}}</text>
				<text v-else class="device-name">{{product.name}}</text>
				<uni-icons class="action-icon" :type="`${isSelectorOpen ? 'up' : 'down'}`" size="13" color="#C0C0C0" />
			</view>
			<view class="flex-row" style="align-items: center;">
				<image v-if="isOrderFinished" :class="`device-icon ${beating ? 'breathing-animation' : ''}`"
					mode="heightFix" @click="bindDevice"
					src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/device/router_white.png" />
				<text v-else class="device-price">￥{{devicePrice}}</text>
			</view>
		</view>
		<view class="device-product-row">
			<view style="flex: 1; display: flex; flex-direction: row;">
				<view class="device-tips" :style="`margin-left: 3px; ${isDefaultStyle?'':'font-size: 11px'}`">
					{{productIntro}}
				</view>
				<view v-if="isOrderFinished" class="device-tips"
					:style="`color: #4C5382; margin-left: 6px; ${isDefaultStyle?'':'font-size: 11px'}`"
					@click="showPopupService">续费延长 >> </view>
				<view v-else class="device-tips"
					:style="`color: #4C5382; margin-left: 6px; ${isDefaultStyle?'':'font-size: 11px'}`"
					@click="bindDevice">去绑定 >>
				</view>
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
			<image style="width: 240px; margin: 40px 20px;" mode="widthFix" :src="productImage" />
		</view>
		<view v-else class="flex-row" style="align-items: center; margin: 24px 0px 18px 0px;">
			<view class="flex-column"
				:style="`padding: 0px 21px; ${currentIntro == 0 ? '' : 'border-right: 1px dashed rgba(76, 83, 130, 0.4);'}`">
				<text :class="`${currentIntro == 0 ? 'device-product-intro-selected' : 'device-product-intro'}`"
					style="margin-bottom: 15px;" @click.stop="changeIntro(0)">心率监测</text>
				<text :class="`${currentIntro == 1 ? 'device-product-intro-selected' : 'device-product-intro'}`"
					style="margin-bottom: 15px;" @click.stop="changeIntro(1)">睡眠监测</text>
				<text :class="`${currentIntro == 2 ? 'device-product-intro-selected' : 'device-product-intro'}`"
					style="margin-bottom: 15px;" @click.stop="changeIntro(2)">健康报告</text>
				<text :class="`${currentIntro == 3 ? 'device-product-intro-selected' : 'device-product-intro'}`"
					@click.stop="changeIntro(3)">风险提醒</text>
			</view>
			<swiper class="device-product-swiper" :style="swiperStyle" :autoplay="introAutoPlay" :circular="true"
				:current="currentIntro" @change="onIntroChanged" @click="previewImage">
				<swiper-item class="device-swiper-item">
					<image class="device-product-main" mode="widthFix" :src="productImage" />
				</swiper-item>
				<swiper-item class="device-swiper-item">
					<image class="device-product-image" mode="widthFix" :src="productImageHealth" />
				</swiper-item>
				<swiper-item class="device-swiper-item">
					<image class="device-product-image" mode="widthFix" :src="productImageReport" />
				</swiper-item>
				<swiper-item class="device-swiper-item">
					<image class="device-product-image" mode="widthFix" :src="productImageNotice" />
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
			style="margin: 20px 20px 0px; border-radius: 10px; overflow: hidden;">
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
							@click.stop="showPopupService">{{emptyAction}}</text>
					</view>
				</view>
				<view v-if="reportTipToday && !reportLoading && !beating"
					style="display: flex; flex-direction: row; margin-top: 8px;">
					<view style="flex: 1;" />
					<button class="report-detail-button" @click.stop="toReportDetail">查看详情</button>
				</view>
			</view>
		</view>
		<view v-else class="device-product-config shadow">
			<view class="device-product-info" @click="toProductOrder">
				<uni-icons class="action-icon" type="circle-filled" size="16" color="#4C5382" />
				<text class="device-product-text" style="flex: 1;">心肺+睡眠智能监测仪 ES 6</text>
				<text class="device-product-text" style="font-size: 13px;">{{stateDesc}}</text>
				<text v-if="isNotOrdered" class="device-tips"><!-- （限时优惠） --></text>
				<uni-icons v-else style="margin-left: 3px;" type="right" size="13" color="#808080" />
			</view>
			<view class="device-auto-tips" style="margin-top: 12px;" @click="showPopupConfig">
				<text class="device-tip-text">硬件设备：</text>
				<text class="device-tip-text" style="flex: 1;">白色全套配件</text>
				<uni-icons style="margin-left: 3px;" type="right" size="14" color="#A0A0A0" />
			</view>
			<view class="device-auto-tips" @click="showPopupConfig">
				<text class="device-tip-text">默认服务：</text>
				<text class="device-tip-text" style="flex: 1;">数据监测通知 | 健康可视化</text>
				<uni-icons style="margin-left: 3px;" type="right" size="14" color="#A0A0A0" />
			</view>
			<view class="device-auto-tips" @click="showPopupConfig">
				<text class="device-tip-text">{{isNotOrdered ? '可' : '已'}}选服务：</text>
				<text class="device-tip-text">{{serviceDesc}}</text>
				<text class="device-tip-text" style="flex: 1; color: #282828; text-align: end;">{{servicePrice}}</text>
				<uni-icons style="margin-left: 3px;" type="right" size="14" color="#A0A0A0" />
			</view>
			<view v-if="serviceAI" style="margin-left: 20px;">
				<text class="device-tips">[ 到期可选择续费：{{servicePriceMonth}}元/月 | {{servicePriceFirstYear}}元&nbsp;</text>
				<text class="device-tips" style="text-decoration-line: line-through;">{{servicePriceYear}}元</text>
				<text class="device-tips">/年 ]</text>
			</view>
			<text v-else-if="serviceExpertMonth || serviceExpert" class="device-tips" style="margin-left: 20px;">[
				到期可选择续费：{{expertPriceMonth}}元/月 | {{expertPriceYear}}元/年 ]</text>
			<view class="device-product-bottom">
				<view class="item-service-chat" @click="toService">
					<uni-icons type="headphones" size="15" color="#A0A0A0" />
				</view>
				<text class="device-tips" style="flex: 1;">{{deviceTips}}</text>
				<view class="device-product-amount">
					<image v-if="isNotOrdered" class="device-product-icon" mode="widthFix" @click.stop="decrease"
						src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/device/minus.png" />
					<text class="amount-text">{{`${product.amount}${isNotOrdered ? '' : ' 件 '}`}}</text>
					<image v-if="isNotOrdered" class="device-product-icon" mode="widthFix" @click.stop="increase"
						src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/device/plus.png" />
				</view>
			</view>
		</view>
		<view v-if="isPreorder || isPurchased" class="device-address">
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
		<view class="device-pay">
			<view class="device-pay-tips">
				<uni-icons v-if="!isNotOrdered" type="star-filled" size="15" color="#4C5382" />
				<uni-icons v-else type="star" size="15" color="#A0A0A0" />
				<text class="device-tip-text"
					style="flex: 1; font-size: 11px; margin-left: 3px;">{{orderCountDesc}}</text>
			</view>
			<button v-if="isNotOrdered" class="device-pay-button" @click="purchase">￥{{product.price * product.amount}}
				购买</button>
			<!-- <button v-if="isNotOrdered" class="device-pay-button" @click="preorder">￥{{100 * product.amount}}
					预订</button> -->
			<button v-if="(isPreorder || isPurchased) && !hasFreightId" class="device-pay-button"
				@click="chooseAddress">{{addressBtnText}}</button>
			<button v-if="isPreorder && hasAddress" class="device-pay-button" @click="purchase">交付尾款</button>
			<button v-if="isPurchased" class="device-pay-button" @click="bindDevice">绑定设备</button>
			<button v-if="isOrdered" class="device-share-button" open-type="share"
				@touchstart="onShareDevice">设备共享</button>
			<image v-if="isOrdered" class="device-icon" style="margin-left: 10px;" mode="heightFix"
				@click="showPopupProduct"
				src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/device/buy.png" />
		</view>
		<uni-popup ref="popupSelector" mask-background-color="rgba(0, 0, 0, 0.3)" type="top"
			@maskClick="closePopupSelector">
			<popup-selector mode="base" @closePopup="closePopupSelector" @click="closePopupSelector" />
		</uni-popup>
		<uni-popup ref="popupConfig" type="bottom" @maskClick="closePopupSelector">
			<popup-config mode="base" :product="product" :type="serviceType" @serviceChanged="serviceChanged"
				@closePopup="closePopupConfig" @click="closePopupConfig" />
		</uni-popup>
		<uni-popup v-if="product && isOrderFinished" ref="popupService" type="bottom" @maskClick="closePopupService">
			<popup-service ref="popupContent" mode="base" :product="product" @closePopup="closePopupService" />
		</uni-popup>
		<uni-popup ref="popupProduct" mask-background-color="rgba(0, 0, 0, 0.7)" type="bottom"
			@maskClick="closePopupProduct">
			<popup-product mode="base" @closePopup="closePopupProduct" />
		</uni-popup>
		<uni-popup ref="popupReceived" type="center" @maskClick="closePopupReceived">
			<popup-received ref="popupReceivedContent" mode="base" @closePopup="closePopupReceived"
				@onProduct="onProduct" />
		</uni-popup>
		<!-- </scroll-view> -->
	</view>
</template>

<script>
	import uaMarkDown from '@/components/ua-markdown/ua-markdown.vue';
	import bcgMonitor from '@/components/health/bcg-monitor.vue';
	import reportData from '@/components/health/report-data.vue';
	import popupSelector from '@/components/popup/popup-selector.vue';
	import popupConfig from '@/components/popup/popup-product-config.vue';
	import popupService from '@/components/popup/popup-service.vue';
	import popupProduct from '@/components/popup/popup-product.vue';
	import popupReceived from '@/components/popup/popup-product-received.vue';
	import {
		EXPERT_PRICE_MONTH,
		EXPERT_PRICE_YEAR,
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
				pulling: false, // 下拉刷新标志
				beating: false,
				interrupt: 0,
				currentIntro: 0, // 当前产品介绍索引
				introAutoPlay: true, // 产品介绍自动播放
				swiperStyle: {}, // 产品介绍滑动样式
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
			uaMarkDown,
			bcgMonitor,
			reportData,
			popupSelector,
			popupConfig,
			popupProduct,
			popupService,
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
			devicePrice: function() {
				return PRODUCT_PRICE_NORMAL;
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
			isPreorder: function() {
				return this.product?.state == 0;
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
			productImage: function() {
				return imageMap[this.product.type];
			},
			productImageHealth: function() {
				return "https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/device/product_intro_health.jpg";
			},
			productImageReport: function() {
				return "https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/device/product_intro_report.jpg";
			},
			productImageNotice: function() {
				return "https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/device/product_intro_notice.jpg";
			},
			productIntro: function() {
				const productDesc = this.serviceExpert ? 'ES 6 | 专家健康管理 1年' : (this.serviceAI ? 'ES 6 | 智能健康管理 1年' :
					'ES 6 | 智能健康管理 1月');
				return this.isOrderFinished ? (this.product.name + ' ' + productDesc) : '* 产品配置图片仅供参考';
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
				if (this.isPreorder) {
					desc = `￥${100 * this.product.amount}（已预订）`;
				} else if (this.isPurchased) {
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
				return store.userInfo.addresses?.length > 0;
			},
			username: function() {
				return this.hasAddress ? store.userInfo.addresses[0].username : store.userInfo.nickname;
			},
			addressText: function() {
				const address = store.userInfo.addresses[0];
				return `${address.provinceName}${address.cityname}${address.countyName}${address.detailInfo}`;
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
				return `已有${store.orderCount}人预订`;
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
			if (this.beating == false) {
				this.startMonitor();
			}
		},
		onHide() {
			console.log('Device, onHide');
			this.isPageHidden = true;
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
				const swiperHeight = Math.round(windowWidth * 2 / 3);
				this.swiperStyle.height = `${swiperHeight}px`;
				if (option.sid?.length > 0 && this.hasLogin) {
					receiveProduct(option.sid, product => {
						product.nickname = undefined;
						this.receivedProduct = product;
						this.showPopupReceived(product);
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
					console.log('Devices, 监测实时心率: ', beatInfo);
					const dataComponent = this.$refs.reportData;
					if (dataComponent) {
						dataComponent.onBeating(this.beating, beatInfo);
					}
					const bcgComponent = this.$refs.bcgMonitor;
					if (this.beating && bcgComponent) {
						this.$refs.bcgMonitor.onBeating(beatInfo);
						if (beatInfo.heartRate == 0) {
							this.interrupt += 1;
							if (this.interrupt >= 20) {
								this.stopMonitor();
							}
						} else {
							this.interrupt = 0;
						}
					} else if (beatInfo?.heartRate > 0) {
						this.beating = true;
					}
				};
				const onComplete = beats => {
					console.log('Devices, 监测实时心率完成：', beats);
				};
				const onFail = err => {
					console.log('Devices, 监测实时心率失败: ', err);
					this.stopMonitor();
				};
				uni.http.streamBeats(onComplete, onFail, onBeat, -1);
			},
			stopMonitor: function() {
				this.interrupt = 0;
				this.beating = false;
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
			showPopupConfig: function() {
				this.$refs.popupConfig.open();
			},
			closePopupConfig: function() {
				this.$refs.popupConfig.close();
			},
			showPopupService: function() {
				this.$refs.popupContent.update(this.product);
				this.$refs.popupService.open();
			},
			closePopupService: function() {
				this.$refs.popupService.close();
			},
			showPopupProduct: function() {
				this.$refs.popupProduct.open();
			},
			closePopupProduct: function() {
				this.$refs.popupProduct.close();
			},
			showPopupReceived: function(product) {
				this.$refs.popupReceivedContent.update(product);
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
					const product = createProduct(PRODUCT_TYPE_SLEEP_BELT);
					this.onProduct(product);
				}
				this.pullRestore();
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
			pullRefresh: function() {
				if (!this.pulling) {
					this.pulling = true;
					setTimeout(() => {
						this.fetchDetail();
					}, 400);
				}
			},
			pullRestore: function() {
				if (this.pulling) {
					this.pulling = false;
				}
			},
			fetchDetail: function() {
				store.fetchProducts((res) => {
					this.initProduct();
				}, (err) => {
					this.pullRestore();
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
			previewImage: function() {
				uni.previewImage({
					current: this.currentIntro,
					urls: [
						this.productImage,
						this.productImageHealth,
						this.productImageReport,
						this.productImageNotice
					]
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
			purchase: function() {
				if (!this.hasLogin) {
					this.toLogin();
					return;
				}
				const that = this;
				if (this.hasAddress) {
					uni.showModal({
						title: '购前须知：',
						content: `预计${getFreightDdl()}前发货。分享到朋友圈邀请好友注册，可获得积分优惠；每成功邀请一位获得 20 积分（抵扣 2 元)。`,
						confirmColor: '#4C5382',
						confirmText: "确定购买",
						showCancel: true,
						cancelText: "知道了",
						cancelColor: '#808080',
						success(res) {
							if (res.confirm) {
								const totalPrice = that.product.price * that.product.amount;
								const fee = that.isPreorder ? (totalPrice - 100 * that.product.amount) :
									totalPrice;
								const desc =
									`${that.product.name}${that.product.amount}件：${that.isPreorder ? '尾款' : '购买'}`;
								const state = 1;
								payForProduct(that.product.price, that.product.amount, fee, desc, state, that
									.product.type, that.poid);
							}
						}
					});
				} else {
					uni.showModal({
						content: `请先填写收件地址`,
						confirmColor: '#4C5382',
						confirmText: "去填写",
						showCancel: true,
						cancelText: "取消",
						cancelColor: '#808080',
						success(res) {
							if (res.confirm) {
								that.chooseAddress();
							}
						}
					});
				}
			},
			preorder: function() {
				const that = this;
				uni.showModal({
					title: '预售须知：',
					content: `预计${getFreightDdl()}前发货，请在发货前交付尾款。`,
					confirmColor: '#4C5382',
					confirmText: "确定预订",
					showCancel: true,
					cancelText: "取消",
					cancelColor: '#808080',
					success(res) {
						if (res.confirm) {
							const fee = 100 * that.product.amount;
							const desc = `${that.product.name}${that.product.amount}件：预订`;
							payForProduct(that.product.price, that.product.amount, fee, desc, 0, that.product
								.type);
						}
					}
				});
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
		color: #080808;
		font-size: 18px;
		font-weight: bold;
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

	.device-product-bottom {
		display: flex;
		flex-direction: row;
		align-items: center;
		margin: 12px 0px 0px 3px;
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
		font-size: 16px;
		font-weight: bold;
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
		margin: 0px 30px 20px;
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

	.device-product-config {
		display: flex;
		flex-direction: column;
		margin: 10px 20px;
		padding: 10px 20px;
		border-radius: 10px;
		background-color: white;
	}

	.device-product-info {
		display: flex;
		flex-direction: row;
		align-items: center;
		margin-top: 3px;
	}

	.device-product-text {
		font-size: 14px;
		color: #282828;
		vertical-align: middle;
	}

	.device-auto-tips {
		display: flex;
		flex-direction: row;
		align-items: center;
		margin: 6px 0px 0px 3px;
		padding-left: 6px;
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
		margin: 20px 20px 30px;
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
		font-weight: bold;
		border-radius: 20px;
		font-size: 12px;
		padding: 0px 20px;
		margin: 10px 0px 10px 10px;
	}

	.device-pay-button:active {
		opacity: 0.8;
	}
</style>