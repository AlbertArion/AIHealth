<template>
	<view class="page-index">
		<view class="header">
			<!-- 搜索栏 -->
			<view class="search">
				<cl-search v-model="keyword" placeholder="请输入关键词" @search="onSearch"></cl-search>
			</view>
			<!-- 轮播图 -->
			<swiper class="banner" indicator-dots autoplay>
				<swiper-item v-for="(item, index) in swiperList" :key="index">
					<image class="swiper-image" :src="item.url" mode="widthFix" />
				</swiper-item>
			</swiper>
		</view>
		<!-- 列表 -->
		<view class="content">
			<view class="tab">
				<text class="tab-text">精力提升</text>
				<view class="tab-indicator" />
			</view>
			<cl-tabs v-model="active" :labels="list" :border="false" :gutter="30" color="#5E8AFF" un-color="#747474"
				:swipeable="true" @tab-change="toChange">
			</cl-tabs>
			<view class="list">
				<view v-if="courseList[active]">
					<view class="subject" v-for="(item, index) in courseList[active].content" :key="index">
						<image class="picture" :src="item.picture" mode="aspectFill"></image>
						<view class="detail">
							<text class="item-text">{{item.name}}</text>
							<text class="item-tip">{{item.tip}}</text>
							<view style="display: flex; flex-direction: row; align-items: center;">
								<text class="item-price">单价：</text>
								<text class="item-price-label">￥</text>
								<text class="item-price-value">{{item.price}}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				selectIndex: 0,
				swiperList: [{
						url: "https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/cloudstorage/courses/banner1.png"
					},
					{
						url: "https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/cloudstorage/courses/banner2.png"
					},
					{
						url: "https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/cloudstorage/courses/banner3.png"
					},
				],
				courseList: [{
						title: "health",
						content: [
							// {
							// 	name: "给职场人的精力提升课",
							// 	tip: "健康·白领",
							// 	picture: "https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/cloudstorage/courses/course1.png",
							// 	price: "68.0",
							// },
							// {
							// 	name: "零基础写出赚钱的读书稿",
							// 	tip: "赚钱·干货",
							// 	picture: "https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/cloudstorage/courses/course2.png",
							// 	price: "52.0",
							// },
							// {
							// 	name: "网易零基础股票入门课",
							// 	tip: "股票·个人提升",
							// 	picture: "https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/cloudstorage/courses/course3.png",
							// 	price: "33.0",
							// }, {
							// 	name: "给职场人的精力提升课",
							// 	tip: "健康·白领",
							// 	picture: "https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/cloudstorage/courses/course1.png",
							// 	price: "68.0",
							// },
							// {
							// 	name: "零基础写出赚钱的读书稿",
							// 	tip: "赚钱·干货",
							// 	picture: "https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/cloudstorage/courses/course2.png",
							// 	price: "52.0",
							// },
							// {
							// 	name: "网易零基础股票入门课",
							// 	tip: "股票·个人提升",
							// 	picture: "https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/cloudstorage/courses/course3.png",
							// 	price: "33.0",
							// }
						],
					},
					{
						title: "work",
						content: [{
								name: "普通人也可执行的赚钱思路课程",
								tip: "赚钱·个人提升·干货",
								picture: "https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/cloudstorage/courses/course2.png",
								price: "52.0",
							},
							{
								name: "普通人也可执行的赚钱思路课程",
								tip: "赚钱·个人提升·干货",
								picture: "https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/cloudstorage/courses/course3.png",
								price: "33.0",
							},
						],
					},
					{
						title: "feeling",
						content: [{
								name: "普通人也可执行的赚钱思路课程",
								tip: "赚钱·个人提升·干货",
								picture: "https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/cloudstorage/courses/course2.png",
								price: "52.0",
							},
							{
								name: "普通人也可执行的赚钱思路课程",
								tip: "赚钱·个人提升·干货",
								picture: "https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/cloudstorage/courses/course3.png",
								price: "33.0",
							},
						],
					},
				],
				keyword: "",
				active: 0,
				list: [{
						label: "精力提升",
						name: 0,
					},
					{
						label: "亲子教育",
						name: 1,
					},
					{
						label: "职场提升",
						name: 2,
					}
				],
			};
		},
		methods: {
			toChange() {
				console.log(this.active);
			},
		},
	};
</script>

<style scoped lang="scss">
	page {
		background: #f5f5f5;
	}

	::v-deep .cl-search {
		background-color: rgba(0, 0, 0, 0);
	}

	::v-deep .cl-button .cl-button--primary {
		border-radius: 32rpx;
		background: linear-gradient(90deg, #8ebbff 0%, #618cfc 100%);
	}

	::v-deep .cl-search__input .cl-button {
		right: 12rpx;
		top: 8rpx;
		height: 64rpx;
	}

	::v-deep .cl-input {
		height: 80rpx;
	}

	::v-deep .cl-tabs__bar-item.is-active {
		// font-size: 32rpx;
		font-weight: 600;
	}

	// ::v-deep .cl-tabs__bar-item {
	// 	padding: 0px 15rpx !important;
	// }
	// ::v-deep .cl-tabs.is-border .cl-tabs__header {
	// 	border-bottom: none;
	// }
	.page-index {
		.header {
			padding: 40rpx 0rpx;
			background: linear-gradient(180deg, #5E8AFF 0%, #F5F5F5 100%);

			.banner {
				align-items: center;

				.swiper-image {
					position: relative;
					width: 90%;
					left: 5%;
				}
			}
		}

		.content {
			margin-top: 15rpx;
			background: #ffffff;

			.title {
				height: 78rpx;
			}

			.tab {
				display: flex;
				flex-direction: column;
				width: 60px;
				padding: 10rpx 30rpx;
				align-items: center;

				.tab-text {
					font-size: 14px;
					color: #5E8AFF;
					font-weight: bold;
				}

				.tab-indicator {
					position: relative;
					width: 30px;
					height: 1px;
					margin-top: 10rpx;
					align-self: center;
					background-color: #5E8AFF;
				}
			}

			.list {
				display: flex;
				flex-direction: column;

				.subject {
					margin: 0 auto;
					display: flex;
					align-items: center;
					height: 252rpx;
					width: 696rpx;
					border-bottom: 1px solid #f5f5f5;

					.picture {
						max-width: 342rpx;
						height: 192rpx;
					}

					.detail {
						margin-left: 30rpx;

						.item-text {
							font-size: 15px;
							color: #303030;
							font-weight: bold;
						}

						.item-tip {
							font-size: 10px;
							color: #C5C5C5;
							font-weight: bold;
							margin-top: 8px;
							margin-bottom: 4px;
							display: block;
						}

						.item-price {
							font-size: 13px;
							color: #303030;
						}

						.item-price-label {
							color: #FF724E;
							font-size: 16px;
							font-weight: bold;
						}

						.item-price-value {
							color: #FF724E;
							font-size: 16px;
							font-weight: bold;
						}
					}
				}
			}
		}
	}
</style>