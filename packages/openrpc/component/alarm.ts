// @kubelt/openrpc/:component/alarm.ts

import type { Duration } from 'date-fns'

import { add } from 'date-fns'

// RpcAlarm
// -----------------------------------------------------------------------------

/**
 * A utility class for setting an alarm time in a durable object.
 */
export class RpcAlarm {

  private _timestamp: Date | undefined

  /**
   * A read-only accessor the alarm time. Returns undefined if no alarm
   * has been set.
   *
   * @returns the alarm timestamp, if defined, as a Date instance
   */
  get timestamp() {
    return this._timestamp
  }

  /**
   * Schedule an alarm for a fixed time.
   *
   * @param timestamp - the Date at which the alarm should be triggered
   * @returns the scheduled alarm timestamp.
   */
  at(timestamp: Readonly<Date>): Date {
    this._timestamp = timestamp
    return this._timestamp
  }

  /**
   * Set an alarm for the current time plus the provided duration.
   *
   * A Duration has the following optional fields, each of which can
   * have a number value:
   * - years
   * - months
   * - weeks
   * - days
   * - hours
   * - minutes
   * - seconds
   *
   * @param duration - a map describing a time duration in common units
   * @returns the scheduled alarm timestamp
   */
  after(duration: Readonly<Duration>): Date {
    this._timestamp = add(Date.now(), duration)
    return this._timestamp
  }

}
