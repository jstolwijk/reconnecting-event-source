import EventSource from "eventsource";
export class ReconnectingEventSource {
  private eventSource?: EventSource;
  private url: string;
  private eventSourceInitDict?: EventSourceInit;
  private reconnecting: boolean = false;

  onError: ((event: Event) => any) | null = null;
  onMessage: ((event: MessageEvent) => any) | null = null;
  onOpen: ((event: Event) => any) | null = null;
  onReconnected: ((event: Event) => any) | null = null;

  constructor(url: string, eventSourceInitDict?: EventSourceInit) {
    this.url = url;
    this.eventSourceInitDict = eventSourceInitDict;
    this.createEventSource();
  }

  private registerCallbacks = () => {
    const reconnectingEventSource = this;

    this.getEventSource().onerror = function (this: EventSource, ev: Event): any {
      const res = reconnectingEventSource.onError !== null ? reconnectingEventSource.onError(ev) : null;
      reconnectingEventSource.handleError(ev);
      return res;
    };
    this.getEventSource().onmessage = function (this: EventSource, ev: MessageEvent) {
      return reconnectingEventSource.onMessage !== null ? reconnectingEventSource.onMessage(ev) : null;
    };
    this.getEventSource().onopen = function (this: EventSource, ev: Event): any {
      const res = reconnectingEventSource.onOpen !== null ? reconnectingEventSource.onOpen(ev) : null;

      if (reconnectingEventSource.reconnecting) {
        if (reconnectingEventSource.onReconnected !== null) {
          reconnectingEventSource.onReconnected(new Event("reconnected"));
        }

        reconnectingEventSource.reconnecting = false;
      }
      return res;
    };
  };

  private getEventSource = (): EventSource => {
    if (!this.eventSource) {
      this.createEventSource();
      return this.eventSource!!;
    }

    return this.eventSource;
  };

  private handleError = (event: Event) => {
    this.getEventSource().close();

    setTimeout(() => {
      this.reconnecting = true;
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
