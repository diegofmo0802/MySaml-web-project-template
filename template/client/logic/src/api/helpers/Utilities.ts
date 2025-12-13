export class Utilities {
    /**
     * Convert a relative URL to an absolute URL.
     * @param join The path to join.
     * @param options The options to use.
     * @returns The absolute URL.
     */
    public static relativeUrl(join: string[], options: Utilities.relativeUrl.Options = {}): string {
        const params = options.params || {};
        join = join.map((fragment, index) => {
            fragment = index !== 0 && fragment.startsWith('/') ? fragment.slice(1) : fragment;
            fragment = fragment.endsWith('/') ? fragment.slice(0, -1) : fragment;
            return fragment;
        });
        let query = '';
        for (const key in params) {
            if (params[key] === null || params[key] === undefined) continue;
            const separator = query !== '' ? '&' : '?';
            const value = encodeURIComponent(params[key].toString());
            query += `${separator}${key}=${value}`;
        }
        return `${join.join('/')}${query}`;
    }
    /**
     * Convert an object to a FormData object.
     * @param data The object to convert.
     * @param options The options to use.
     * @returns The FormData object.
     */
    public static objectToFormdata(data: Utilities.FormData.Data, options: Utilities.FormData.Options = {}): FormData {
        const includedKeys = options.includedKeys || Object.keys(data);
        const excludedKeys = options.excludedKeys || [];
        const nullValues = options.nullValues || false;
        const undefinedValues = options.undefinedValues || false;

        const result = new FormData();
        for (let key in data) {
            if (excludedKeys.includes(key)) break;
            else if (includedKeys.includes(key)) {
                const value = data[key];
                if (!nullValues && value === null) break;
                if (!undefinedValues && value === undefined) break;
                result.append(key, value);
            }
        }
        return result
    }
}
export namespace Utilities {
    export namespace relativeUrl {
        export interface Options {
            params?: QueryParams;
        }
        export interface QueryParams {
            [key: string]: string | number | boolean | null | undefined;
        }
    }
    export namespace FormData {
        export interface Data {
            [key: string]: any;
        }
        export interface Options {
            includedKeys?: string[];
            excludedKeys?: string[];
            nullValues?: boolean;
            undefinedValues?: boolean;
        }
    }
    export namespace Response {
        export interface Base {
            success: boolean;
            code: number;
        }
        export interface Success<T extends any = any> extends Base {
            success: true;
            result: T;
        }
        export interface Error extends Base {
            success: false;
            reason: string;
        }
    }
    export type Response<T extends any = any> = (Response.Success<T> | Response.Error);
}
export default Utilities;