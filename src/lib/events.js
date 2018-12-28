// @flow
import type {
  CallbackType,
  ListenerListType,
  EventType
} from '../../types/events';

/**
 * A simple class to extend from to gain event emitting capabilities.
 */
export default class Events {
  listeners: ListenerListType = {};

  /**
   * Adds an event listener for a given event type.
   * Source: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget
   * @param  {string} type  The event type for which the callback will be called
   * @param  {function} callback  The callback which will be called for the
   *   given type.
   */
  on(type: string, callback: CallbackType) {
    if (!(type in this.listeners)) {
      this.listeners[type] = [];
    }

    this.listeners[type].push(callback);
  }

  /**
   * Removes an event listener for a given type from the layer.
   * Source: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget
   * @param  {string} type  The event type for which the callback will be called
   * @param  {function} callback  The callback which will be removed as a
   *   listener
   */
  off(type: string, callback: CallbackType) {
    if (!(type in this.listeners)) {
      return;
    }

    for (let index = 0; index < this.listeners[type].length; index++) {
      if (this.listeners[type][index] === callback) {
        this.listeners[type].splice(index, 1);
        this.off(type, callback);
        return;
      }
    }
  }

  /**
   * Calls all registered event listeners for the event's type.
   * Source: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget
   * @param  {Event} event  The event to be dispatched
   */
  dispatchEvent(event: EventType) {
    const {type} = event;
    if (!(type in this.listeners)) {
      return;
    }

    const listeners = this.listeners[type];
    event.target = this;

    listeners.forEach((listener: CallbackType): void =>
      listener.call(this, event)
    );
  }
}



// WEBPACK FOOTER //
// ./app/lib/events.js