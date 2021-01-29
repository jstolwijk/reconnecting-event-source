# Reconnecting event source

Wrapper around the `EventSource` - a interface to server-sent events.

The `EventSource` implementation shipped in modern browsers is missing automatic reonnection on errors, this makes the `EventSource` not reliable enough to use as an event bus in production grade applications. In the `ReconnectingEventSource` I've implemented a basic auto-reconnect feature on top of the `EventSource` interface.

## Example usage

```js
import { ReconnectingEventSource } from "@jessestolwijk/reconnecting-event-source";

const eventSource = new ReconnectingEventSource("https://localhost:8080/events");

eventSource.onOpen((event) => {
  console.log("Connection opened");
});

eventSource.onMessage((event) => {
  console.log(`Received message ${event.body}`);
});

eventSource.onError((event) => {
  console.log(`Error ${event}`);
});

eventSource.onReconnected((event) => {
  console.log("Connection with the server restored");
});

// Close the event source after 1 minute
setTimeout(() => {
  eventSource.close();
}, 60000);
```
