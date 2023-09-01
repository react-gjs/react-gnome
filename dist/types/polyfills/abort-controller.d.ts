declare namespace AbortControllerPolyfill {
    enum Events {
        Abort = "abort"
    }
    class Event {
        type: Events;
        constructor(type: Events);
    }
    export class AbortError extends Error {
        constructor(message: string);
    }
    export class AbortSignal {
        static abort(reason?: any): AbortSignal;
        static timeout(time: number): AbortSignal;
        private readonly _events;
        private _isAborted;
        private _reason;
        onabort: ((ev: Event) => void) | null;
        get aborted(): boolean;
        get reason(): any;
        constructor();
        protected _abort(reason?: any): void;
        throwIfAborted(): void;
        addEventListener(event: Events, listener: (ev: Event) => void): void;
        removeEventListener(event: Events, listener: (ev: Event) => void): void;
    }
    export class AbortController {
        private readonly _signal;
        get signal(): AbortSignal;
        abort(): void;
    }
    export {};
}
export declare const AbortController: typeof AbortControllerPolyfill.AbortController;
export declare const AbortSignal: typeof AbortControllerPolyfill.AbortSignal;
export declare const AbortError: typeof AbortControllerPolyfill.AbortError;
export {};
