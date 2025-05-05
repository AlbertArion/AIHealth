export function ArrayBufferToBase64(buffer) {
	var binary = '';
	var bytes = new Uint8ClampedArray(buffer);
	for (var len = bytes.byteLength, i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary);
}

export function Base64ToUint8ClampedArray(base64String) {
	const padding = '='.repeat((4 - base64String.length % 4) % 4);
	const base64 = (base64String + padding)
		.replace(/\-/g, '+')
		.replace(/_/g, '/');

	const rawData = uatob(base64);
	const outputArray = new Uint8ClampedArray(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}

export function uatob(input) {
	if (!input) {
		return;
	}
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
	let str = input.replace(/=+$/, '');
	let output = '';
	if (str.length % 4 === 1) {
		console.log("Tools, uatob InvalidLengthError: str.length = " + str.length);
		return;
	}
	for (let i = 0, len = str.length; i < len; i += 4) {
		const a = chars.indexOf(str.charAt(i));
		const b = chars.indexOf(str.charAt(i + 1));
		const c = chars.indexOf(str.charAt(i + 2));
		const d = chars.indexOf(str.charAt(i + 3));
		const sum = (a << 18) | (b << 12) | (c << 6) | d;
		output += String.fromCharCode((sum >> 16) & 0xFF, (sum >> 8) & 0xFF, sum & 0xFF);
	}
	return output;
}