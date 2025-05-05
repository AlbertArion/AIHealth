export default function() {
	let userprotocol = uni.getStorageSync('userprotocol');
	console.log('userprotocol', userprotocol);
	if (!userprotocol) {
		uni.navigateTo({
			url: '/pages/uni-agree/uni-agree',
			animationType: "none"
		})
	}
}