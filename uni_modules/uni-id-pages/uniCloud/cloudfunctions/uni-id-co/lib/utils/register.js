const {
	userCollection,
	LOG_TYPE,
	inviteCollection,
	scoresCollection
} = require('../../common/constants')
const {
	ERROR
} = require('../../common/error')
const {
	findUser
} = require('./account')
const {
	getValidInviteCode,
	generateInviteInfo
} = require('./fission')
const {
	logout
} = require('./logout')
const PasswordUtils = require('./password')
const merge = require('lodash.merge')

async function realPreRegister(params = {}) {
	const {
		user
	} = params
	const {
		userMatched
	} = await findUser({
		userQuery: user,
		authorizedApp: this.getUniversalClientInfo().appId
	})
	if (userMatched.length > 0) {
		throw {
			errCode: ERROR.ACCOUNT_EXISTS
		}
	}
}

async function preRegister(params = {}) {
	try {
		await realPreRegister.call(this, params)
	} catch (error) {
		await this.middleware.uniIdLog({
			success: false,
			type: LOG_TYPE.REGISTER
		})
		throw error
	}
}

async function preRegisterWithPassword(params = {}) {
	const {
		user,
		password
	} = params
	await preRegister.call(this, {
		user
	})
	const passwordUtils = new PasswordUtils({
		clientInfo: this.getUniversalClientInfo(),
		passwordSecret: this.config.passwordSecret
	})
	const {
		passwordHash,
		version
	} = passwordUtils.generatePasswordHash({
		password
	})
	const extraData = {
		password: passwordHash,
		password_secret_version: version
	}
	return {
		user,
		extraData
	}
}

async function thirdPartyRegister({
	user = {}
} = {}) {
	return {
		mobileConfirmed: !!(user.mobile && user.mobile_confirmed) || false,
		emailConfirmed: !!(user.email && user.email_confirmed) || false
	}
}

async function postRegister(params = {}) {
	const {
		user,
		extraData = {},
		isThirdParty = false,
		inviteCode
	} = params
	const {
		appId,
		appName,
		appVersion,
		appVersionCode,
		channel,
		scene,
		clientIP,
		osName
	} = this.getUniversalClientInfo()
	const uniIdToken = this.getUniversalUniIdToken()

	merge(user, extraData)

	const registerChannel = channel || scene
	user.register_env = {
		appid: appId || '',
		uni_platform: this.clientPlatform || '',
		os_name: osName || '',
		app_name: appName || '',
		app_version: appVersion || '',
		app_version_code: appVersionCode || '',
		channel: registerChannel ? registerChannel + '' : '', // channel可能为数字，统一存为字符串
		client_ip: clientIP || ''
	}

	user.register_date = Date.now()
	user.dcloud_appid = [appId]
	// 新增逻辑 微信注册时绑定用户手机;
	if (user.phone) {
		user.mobile = user.phone;
	}
	if (user.username) {
		user.username = user.username.toLowerCase()
	}
	if (user.email) {
		user.email = user.email.toLowerCase()
	}

	const {
		autoSetInviteCode, // 注册时自动设置邀请码
		forceInviteCode, // 必须有邀请码才允许注册，注意此逻辑不可对admin生效
		userRegisterDefaultRole // 用户注册时配置的默认角色
	} = this.config
	if (autoSetInviteCode) {
		user.my_invite_code = await getValidInviteCode()
	}

	// 如果用户注册默认角色配置存在且不为空数组
	if (userRegisterDefaultRole && userRegisterDefaultRole.length) {
		// 将用户已有的角色和配置的默认角色合并成一个数组，并去重
		user.role = Array.from(new Set([...(user.role || []), ...userRegisterDefaultRole]))
	}

	const isAdmin = user.role && user.role.includes('admin')

	if (forceInviteCode && !isAdmin && !inviteCode) {
		throw {
			errCode: ERROR.INVALID_INVITE_CODE
		}
	}

	if (inviteCode) {
		const {
			inviterUid,
			inviteTime
		} = await generateInviteInfo({
			inviteCode
		});
		user.inviter_uid = inviterUid;
		user.invite_time = inviteTime;
		user.score = 20;
	}

	if (uniIdToken) {
		try {
			await logout.call(this)
		} catch (error) {}
	}

	const beforeRegister = this.hooks.beforeRegister
	let userRecord = user
	if (beforeRegister) {
		userRecord = await beforeRegister({
			userRecord,
			clientInfo: this.getUniversalClientInfo()
		})
	}

	const {
		id: uid
	} = await userCollection.add(userRecord)

	const createTokenRes = await this.uniIdCommon.createToken({
		uid
	})

	const {
		errCode,
		token,
		tokenExpired
	} = createTokenRes

	if (errCode) {
		throw createTokenRes
	}

	// 通过uid + 邀请码，记录下来后，给邀请人添加积分
	console.log(uid, 'uid');
	console.log(inviteCode, 'inviteCode');
	if (uid && inviteCode) {
		const {
			inviterUid,
			inviteTime
		} = await generateInviteInfo({
			inviteCode
		})
		await inviteCollection.add({
			uid,
			inviter_uid: inviterUid,
		})
		// 查出来用户当前有多少积分
		let inviterUser = await userCollection.where({
			_id: inviterUid[0],
		}).get();
		let balance = inviterUser.data[0].score || 0;
		// 给加积分
		let score = 20;
		balance += score
		await scoresCollection.add({
			user_id: inviterUid[0],
			balance,
			score,
			type: 1,
			create_date: Date.now(),
			comment: '邀请用户UID:' + uid + '注册账户',
		})
		await userCollection.where({
			_id: inviterUid[0],
		}).update({
			score: balance,
		})
	}

	await this.middleware.uniIdLog({
		data: {
			user_id: uid
		},
		type: LOG_TYPE.REGISTER
	})

	return {
		errCode: 0,
		uid,
		newToken: {
			token,
			tokenExpired
		},
		...(
			isThirdParty ?
			thirdPartyRegister({
				user: {
					...userRecord,
					_id: uid
				}
			}) : {}
		),
		passwordConfirmed: !!userRecord.password,
		isRegister: true,
	}
}

module.exports = {
	preRegister,
	preRegisterWithPassword,
	postRegister
}