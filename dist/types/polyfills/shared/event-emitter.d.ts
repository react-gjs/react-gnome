export type EventListener<E = any> = ((ev: E) => void) | {
    handleEvent: (ev: E) => void;
};
export declare class Event<D extends Record<string, any> = object> {
    static create<D extends Record<string, any>>(data: D): Event<D>;
}
export declare class EventEmitter<EventType extends string, Ev extends Event<any>, Listener extends EventListener = EventListener<Ev>> {
    private listeners;
    private callListener;
    add(event: EventType, listener: Listener, options?: boolean | AddEventListenerOptions): void;
    remove(event: EventType, listener: Listener): void;
    emit(event: EventType, ev: Ev): void;
    clear(): void;
}
