export class ReconnectingEventSource {
  private eventSource: EventSource;
  private url: string;
  private eventSourceInitDict?: EventSourceInit;

  onError: ((eventSource: EventSource, ev: Event) => any) | null = null;
  onMessage: ((eventSource: EventSource, ev: MessageEvent) => any) | null = null;
  onOpen: ((eventSource: EventSource, ev: Event) => any) | null = null;

  constructor(url: string, eventSourceInitDict?: EventSourceInit) {
    this.url = url;
    this.eventSourceInitDict = eventSourceInitDict;
    this.eventSource = this.createEventSource();
  }

  private registerCallbacks = () => {
    const reconnectingEventSource = this;

    this.eventSource.onerror = function (this: EventSource, ev: Event): any {
      const res = reconnectingEventSource.onError !== null ? reconnectingEventSource.onError(this, ev) : null;
      reconnectingEventSource.handleError();
      return res;
    };
    this.eventSource.onmessage = function (this: EventSource, ev: MessageEvent) {
      return reconnectingEventSource.onMessage !== null ? reconnectingEventSource.onMessage(this, ev) : null;
    };
    this.eventSource.onopen = function (this: EventSource, ev: Event): any {
      return reconnectingEventSource.onOpen !== null ? reconnectingEventSource.onOpen(this, ev) : null;
    };
  };

  private handleError = () => {
    this.eventSource.close();

    setTimeout(() => {
      this.eventSource = this.createEventSource();
    }, 1000);
  };

  private createEventSource = (): EventSource => {
    const eventSource = new EventSource(this.url, this.eventSourceInitDict);
    this.registerCallbacks();
    return eventSource;
  };

  close = () => {
    this.eventSource.close();
  };
}
