<template>
	<view :class="`${pattern==='small' ? 'loading-dots-small' : 'loading-dots'}`">
		<view v-for="(dot, index) in dots" :key="index" :class="['dot', `dot-${index+1}`]"
			:style="`background-color: ${color};`"></view>
	</view>
</template>
<script>
	export default {
		data() {
			return {
				dots: [1, 2, 3, 4]
			};
		},
		props: {
			pattern: {
				type: String,
				default: ''
			},
			color: {
				type: String,
				default: '#4C5382'
			},
		},
	}
</script>
<style>
	.loading-dots-small {
		display: flex;
		justify-content: space-between;
		width: 20px;
		height: 5px;
	}

	.loading-dots {
		display: flex;
		justify-content: space-between;
		width: 40px;
		height: 10px;
	}

	.dot-small {
		width: 5px;
		height: 2px;
		border-radius: 50%;
		animation: loading 1.5s infinite;
	}

	.dot {
		width: 5px;
		height: 5px;
		border-radius: 50%;
		animation: loading 1.5s infinite;
	}

	.dot-1 {
		background-color: #4C5382;
	}

	.dot-2 {
		background-color: #4C5382;
		animation-delay: 0.375s;
	}

	.dot-3 {
		background-color: #4C5382;
		animation-delay: 0.75s;
	}

	.dot-4 {
		background-color: #4C5382;
		animation-delay: 1.125s;
	}

	@keyframes loading {
		0% {
			opacity: 0.2;
		}

		25% {
			opacity: 1;
		}

		50% {
			opacity: 0.2;
		}

		75% {
			opacity: 0.2;
		}

		100% {
			opacity: 0.2;
		}
	}
</style>