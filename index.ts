import EventSource from "eventsource";

export class ReconnectingEventSource {
  private eventSource?: EventSource;
  private url: string;
  private eventSourceInitDict?: EventSourceInit;

  onError: ((eventSource: EventSource, ev: Event) => any) | null = null;
  onMessage: ((eventSource: EventSource, ev: MessageEvent) => any) | null = null;
  onOpen: ((eventSource: EventSource, ev: Event) => any) | null = null;

  constructor(url: string, eventSourceInitDict?: EventSourceInit) {
    this.url = url;
    this.eventSourceInitDict = eventSourceInitDict;
    this.createEventSource();
  }

  private registerCallbacks = () => {
    const reconnectingEventSource = this;

    this.getEventSource().onerror = function (this: EventSource, ev: Event): any {
      const res = reconnectingEventSource.onError !== null ? reconnectingEventSource.onError(this, ev) : null;
      reconnectingEventSource.handleError();
      return res;
    };
    this.getEventSource().onmessage = function (this: EventSource, ev: MessageEvent) {
      return reconnectingEventSource.onMessage !== null ? reconnectingEventSource.onMessage(this, ev) : null;
    };
    this.getEventSource().onopen = function (this: EventSource, ev: Event): any {
      return reconnectingEventSource.onOpen !== null ? reconnectingEventSource.onOpen(this, ev) : null;
    };
  };

  private getEventSource = (): EventSource => {
    if (!this.eventSource) {
      this.createEventSource();
      return this.eventSource!!;
    }

    return this.eventSource;
  };

  private handleError = () => {
    this.getEventSource().close();

    setTimeout(() => {
      this.createEventSource();
    }, 1000);
  };

  private createEventSource = () => {
    this.eventSource = new EventSource(this.url, this.eventSourceInitDict);
    this.registerCallbacks();
  };

  close = () => {
    this.eventSource?.close();
  };
}
