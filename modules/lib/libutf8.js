export {
    canUseUTF8,
    decode,
    encode,
}
//验证字节流是否能通过utf转字符串，true可以，false不可以
function canUseUTF8(buffer) {
    if (buffer.length > 0 && buffer[0] == 0) {
        return false; //首字节为0的就不是可读字符串
    }
    var i = 0;
    while (i < buffer.length) {
        var b = buffer[i++];
        var count; //判断是否符合utf8格式，并且确定后续的字节数
        if (b <= 127) { //0xxxxxxx
            count = 0;
        } else if (b >= 194 && b <= 223) { //110xxxxx 10xxxxxx
            count = 1;
        } else if (b >= 224 && b <= 239) { //1110xxxx 10xxxxxx 10xxxxxx
            count = 2;
        } else if (b >= 240 && b <= 244) { //11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
            count = 3;
        } else {
            return false; //不符合utf8格式的首字节
        }
        while (count > 0 && i < buffer.length) {
            b = buffer[i++];
            if (b < 128 || b > 191) { //utf的非首字节处于128-191之间，因为10xxxxxx
                return false;
            }
            count--;
        }
    }
    return true;
}
/**
 * 将字节数组解码为字符串
 * @param {*} byteArray 
 */
function decode(byteArray) {
    return UTF8ArrToStr(byteArray);
}
/**
 * 将字符串编码为字节数组
 * @param {*} utf8String 
 */
function encode(utf8String) {
    var uint8Arr = strToUTF8Arr(utf8String);
    var arr = new Array();
    for (var i = 0; i < uint8Arr.byteLength; i++) {
        arr.push(uint8Arr[i]);
    }
    return arr;
}
//将字节数组按照utf8转成字符串
function UTF8ArrToStr(aBytes) {
    let sView = "";
    let nPart;
    const nLen = aBytes.length;
    for (let nIdx = 0; nIdx < nLen; nIdx++) {
        nPart = aBytes[nIdx];
        sView += String.fromCodePoint(
            nPart > 251 && nPart < 254 && nIdx + 5 < nLen /* six bytes */ ?
            /* (nPart - 252 << 30) may be not so safe in ECMAScript! So…: */
            (nPart - 252) * 1073741824 +
            ((aBytes[++nIdx] - 128) << 24) +
            ((aBytes[++nIdx] - 128) << 18) +
            ((aBytes[++nIdx] - 128) << 12) +
            ((aBytes[++nIdx] - 128) << 6) +
            aBytes[++nIdx] -
            128 :
            nPart > 247 && nPart < 252 && nIdx + 4 < nLen /* five bytes */ ?
            ((nPart - 248) << 24) +
            ((aBytes[++nIdx] - 128) << 18) +
            ((aBytes[++nIdx] - 128) << 12) +
            ((aBytes[++nIdx] - 128) << 6) +
            aBytes[++nIdx] -
            128 :
            nPart > 239 && nPart < 248 && nIdx + 3 < nLen /* four bytes */ ?
            ((nPart - 240) << 18) +
            ((aBytes[++nIdx] - 128) << 12) +
            ((aBytes[++nIdx] - 128) << 6) +
            aBytes[++nIdx] -
            128 :
            nPart > 223 && nPart < 240 && nIdx + 2 < nLen /* three bytes */ ?
            ((nPart - 224) << 12) +
            ((aBytes[++nIdx] - 128) << 6) +
            aBytes[++nIdx] -
            128 :
            nPart > 191 && nPart < 224 && nIdx + 1 < nLen /* two bytes */ ?
            ((nPart - 192) << 6) + aBytes[++nIdx] - 128 :
            /* nPart < 127 ? */
            /* one byte */
            nPart
        );
    }
    return sView;
}
//将字符串按照utf8转成Uint8Array
function strToUTF8Arr(sDOMStr) {
    let aBytes;
    let nChr;
    const nStrLen = sDOMStr.length;
    let nArrLen = 0;

    /* mapping… */
    for (let nMapIdx = 0; nMapIdx < nStrLen; nMapIdx++) {
        nChr = sDOMStr.codePointAt(nMapIdx);

        if (nChr >= 0x10000) {
            nMapIdx++;
        }

        nArrLen +=
            nChr < 0x80 ?
            1 :
            nChr < 0x800 ?
            2 :
            nChr < 0x10000 ?
            3 :
            nChr < 0x200000 ?
            4 :
            nChr < 0x4000000 ?
            5 :
            6;
    }

    aBytes = new Uint8Array(nArrLen);

    /* transcription… */
    let nIdx = 0;
    let nChrIdx = 0;
    while (nIdx < nArrLen) {
        nChr = sDOMStr.codePointAt(nChrIdx);
        if (nChr < 128) {
            /* one byte */
            aBytes[nIdx++] = nChr;
        } else if (nChr < 0x800) {
            /* two bytes */
            aBytes[nIdx++] = 192 + (nChr >>> 6);
            aBytes[nIdx++] = 128 + (nChr & 63);
        } else if (nChr < 0x10000) {
            /* three bytes */
            aBytes[nIdx++] = 224 + (nChr >>> 12);
            aBytes[nIdx++] = 128 + ((nChr >>> 6) & 63);
            aBytes[nIdx++] = 128 + (nChr & 63);
        } else if (nChr < 0x200000) {
            /* four bytes */
            aBytes[nIdx++] = 240 + (nChr >>> 18);
            aBytes[nIdx++] = 128 + ((nChr >>> 12) & 63);
            aBytes[nIdx++] = 128 + ((nChr >>> 6) & 63);
            aBytes[nIdx++] = 128 + (nChr & 63);
            nChrIdx++;
        } else if (nChr < 0x4000000) {
            /* five bytes */
            aBytes[nIdx++] = 248 + (nChr >>> 24);
            aBytes[nIdx++] = 128 + ((nChr >>> 18) & 63);
            aBytes[nIdx++] = 128 + ((nChr >>> 12) & 63);
            aBytes[nIdx++] = 128 + ((nChr >>> 6) & 63);
            aBytes[nIdx++] = 128 + (nChr & 63);
            nChrIdx++;
        } /* if (nChr <= 0x7fffffff) */
        else {
            /* six bytes */
            aBytes[nIdx++] = 252 + (nChr >>> 30);
            aBytes[nIdx++] = 128 + ((nChr >>> 24) & 63);
            aBytes[nIdx++] = 128 + ((nChr >>> 18) & 63);
            aBytes[nIdx++] = 128 + ((nChr >>> 12) & 63);
            aBytes[nIdx++] = 128 + ((nChr >>> 6) & 63);
            aBytes[nIdx++] = 128 + (nChr & 63);
            nChrIdx++;
        }
        nChrIdx++;
    }
    return aBytes;
}