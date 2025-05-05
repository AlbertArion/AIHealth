
export const useDebounce = (func, delay = 1000, immediate = false) => {
    let timer: string | number | NodeJS.Timeout | undefined;
    return function (...args: any) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let that = this;
        if (immediate) {
            func.apply(that, args);
            // eslint-disable-next-line no-param-reassign
            immediate = false;
            return;
        }
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(that, args);
        }, delay);
    };
};