# uni-image-menu

使用示例：
```
import uniImageMenu from 'uni_modules/uni-image-menu/js_sdk/uni-image-menu.js';
uniImageMenu.show({
	list:[{
			"img": "https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/cloudstorage/sharemenu/wechatfriend.png",
			"text": "微信好友"
		},
		{
			"img": "https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/cloudstorage/sharemenu/wechatmoments.png",
			"text": "微信朋友圈"
		}],
	cancelText:param.cancelText
}, e => {
	console.log(e)
})
```