export interface ApiMessage {
    message: string;
}

export function isString(value: unknown): value is string {
    return typeof value === 'string';
}

export function isApiMessage(value: unknown): value is ApiMessage {
    return typeof value === 'object'
        && value !== null
        && 'message' in value
        && isString(value.message);
}

export function readApiMessage(response: unknown): string {
    if (isString(response)) {
        return response;
    }

    if (isApiMessage(response)) {
        return response.message;
    }

    return '接口返回格式无法识别';
}

export type ApiResult =
    | { kind: 'text'; text: string }
    | { kind: 'user'; name: string };

function assertNever(value: never): never {
    throw new Error(`未处理的结果：${String(value)}`);
}

export function describeApiResult(result: ApiResult): string {
    switch (result.kind) {
        case 'text':
            return result.text;
        case 'user':
            return result.name;
        default:
            return assertNever(result);
    }
}
