<template>
	<view @click="close">
		<view class="popup-selector-container">
			<view class="triangle" />
			<view v-if="products?.length > 0" v-for="(product, index) in products" :class="itemClasses(index)"
				:id="index" :key="index" @click.stop="select(product, index)">
				<text class="product-name">{{productName(product, index)}}</text>
			</view>
		</view>
	</view>
</template>
<script>
	import {
		PRODUCT_SLEEP_BELT,
		PRODUCT_SLEEP_BELT_NICK
	} from '@/common/js/productorder';
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store';
	import popup from '@/uni_modules/uni-popup/components/uni-popup/popup.js';

	export default {
		name: "popupSelector",
		mixins: [popup],
		emits: ['confirm', 'close', 'closePopup', 'request', 'pay'],
		data() {
			return {

			}
		},
		computed: {
			products: function() {
				return store.userInfo.products;
			}
		},
		methods: {
			itemClasses(index) {
				let classes = 'product-item';
				if (index == 0) {
					classes += ' border-top';
				}
				if (index == this.products?.length - 1) {
					classes += ' border-bottom';
				}
				return classes;
			},
			productName: function(product, index) {
				return product.nickname ? product.nickname : (product.name == PRODUCT_SLEEP_BELT ?
					`${PRODUCT_SLEEP_BELT_NICK} ${index + 1}` : product.name);
			},
			close() {
				this.popup.close();
			},
			closePopup() {
				this.$emit('closePopup')
			},
			select(product, index) {
				store.userConfig.productIndex = index;
				uni.$emit('productUpdate', product);
				this.closePopup();
			}
		}
	}
</script>

<style lang="scss">
	.popup-selector-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 170px;
		margin-top: 36px;
		overflow: hidden;
	}

	.triangle {
		border-left: 6px solid transparent;
		border-right: 6px solid transparent;
		border-bottom: 6px solid white;
	}

	.product-item {
		flex: 1;
		display: flex;
		flex-direction: row;
		align-items: center;
		background-color: white;
	}

	.product-item:active {
		background-color: #F0F0F0;
	}

	.border-top {
		border-top-left-radius: 4px;
		border-top-right-radius: 4px;
		padding-top: 6px;
	}

	.border-bottom {
		border-bottom-left-radius: 4px;
		border-bottom-right-radius: 4px;
		padding-bottom: 2px;
	}

	.product-name {
		font-size: 14px;
		color: #484848;
		height: 36px;
		line-height: 36px;
		width: 120px;
		text-align: center;
	}
</style>