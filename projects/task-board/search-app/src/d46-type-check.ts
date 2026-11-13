import { isString, readApiMessage } from './d46-narrowing.js';

const rawResponse: unknown = { message: '服务稍后恢复' };
const displayMessage = readApiMessage(rawResponse);

if (isString(rawResponse)) {
    rawResponse.toUpperCase();
}

// 移除此注释后，typecheck 会报告 unknown 尚未收窄。
// @ts-expect-error unknown must be narrowed before calling string methods
rawResponse.trim();

console.log(displayMessage);
