<template>
	<view class="wave-dots">
		<view v-for="(dot, index) in dots" :key="index" :class="['dot', `dot-${index}`]"
			:style="`background-color: ${color};`"></view>
	</view>
</template>
<script>
	export default {
		data() {
			return {
				dots: [0, 1, 2]
			};
		},
		props: {
			color: {
				type: String,
				default: '#FFFFFF'
			},
		},
	}
</script>
<style>
	.wave-dots {
		display: flex;
		justify-content: space-between;
		width: 40px;
	}

	.dot {
		width: 5px;
		height: 10px;
		border-radius: 10px;
		animation: wave-anim 1.5s infinite;
	}

	.dot-0 {
		background-color: #FFFFFF;
	}

	.dot-1 {
		background-color: #FFFFFF;
		animation-delay: 0.375s;
	}

	.dot-2 {
		background-color: #FFFFFF;
		animation-delay: 0.75s;
	}


	@keyframes wave-anim {
		0% {
			transform: scaleY(1);
		}

		25% {
			transform: scaleY(1.4);
		}

		50% {
			transform: scaleY(1);
		}

		75% {
			transform: scaleY(1);
		}

		100% {
			transform: scaleY(1);
		}
	}
</style>