function compareScore(localScore, newScore) {
	console.log("Tool, 最近积分：本地 " + localScore + ", 云端 " + newScore);
	if (localScore && newScore && localScore > 0 && (newScore - localScore >= 20)) {
		const count = Math.round((newScore - localScore) / 20);
		uni.showModal({
			title: '积分奖励',
			content: `恭喜您邀请了 ${count} 位朋友注册「心脉AI」，增加 ${count * 20} 积分！`,
			confirmColor: '#4C5382',
			confirmText: '知道了',
			showCancel: false
		});
	}
}

function exitMiniProgram() {
	console.log('Tool, exitMiniProgram 当前环境：' + getApp().globalData.platform);
	wx.exitMiniProgram({
		success: function(res) {
			// 成功退出小程序
			console.log('uni.tool, 退出小程序成功', res);
		},
		fail: function(err) {
			// 退出小程序失败
			console.error('uni.tool, 当前环境不支持退出小程序', err);
		}
	});
}

export {
	compareScore,
	exitMiniProgram
}