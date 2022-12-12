//  @kubelt.platform/ping:/src/node/reply/index.ts
/**
 * An example Durable Object "component" that stores a reply message to
 * be returned in response to a "kb_ping" request.
 */

import * as openrpc from '@kubelt/openrpc'

import type {
  RpcAlarm,
  RpcInput,
  RpcOutput,
  RpcParams,
  RpcResult,
} from '@kubelt/openrpc/component'

import {
  FieldAccess,
  alarm,
  component,
  field,
  method,
  requiredField,
  requiredScope,
  scopes,
} from '@kubelt/openrpc/component'

// The OpenRPC schema that defines the RPC API provided by the Durable Object.
import schema from './schema'

// ReplyMessage
// -----------------------------------------------------------------------------
// An example Durable Object component that stores and returns a message.

/**
 * Stores the message that should be returned in response to a PING
 * service request. Intended to serve as a convenient example and
 * development tool.
 *
 * @note This class needs to implement all of the methods defined in
 * the OpenRPC schema or an error will be thrown upon construction.
 */
@component(schema)
@scopes(['owner'])
@field({
  name: 'message',
  doc: 'A message to return in response to a PING',
  defaultValue: 'hola!',
})
@field({
  name: 'pending',
  doc: 'The text of a pending message update',
  defaultValue: '',
})
export class ReplyMessage {
  // init
  // -----------------------------------------------------------------------------
  // Store the initial copy of the application record.

  @method('init')
  @requiredField('message', [FieldAccess.Write])
  init(
    params: RpcParams,
    input: RpcInput,
    output: RpcOutput
  ): Promise<RpcResult> {
    // Get the message sent in the request.
    const message = params.get('message')
    // Update the value of the 'message' field.
    output.set('message', message)

    // NB: we only have FieldAccess.Write permission, so we can update
    // the stored value but can't read it.

    return Promise.resolve(message)
  }

  // message
  // -----------------------------------------------------------------------------

  @method('message')
  @requiredField('message', [FieldAccess.Read])
  message(
    params: RpcParams,
    input: RpcInput,
    output: RpcOutput
  ): Promise<RpcResult> {
    // Read the stored message from the field.
    const message = input.get('message')

    return message
  }

  // schedule
  // -----------------------------------------------------------------------------

  @method('schedule')
  @requiredField('pending', [FieldAccess.Write])
  schedule(
    params: RpcParams,
    input: RpcInput,
    output: RpcOutput,
    alarm: RpcAlarm
  ): Promise<RpcResult> {
    // Read the message that will be set.
    const message = params.get('message')
    // Read the object that describes the time delay.
    const delay = params.get('delay')

    // Store the pending message. It will be read by the alarm handler.
    output.set('pending', message)

    // Schedule the alarm.
    alarm.after(delay)

    return {
      message,
      timestamp: alarm.timestamp,
    }
  }

  // alarm
  // ---------------------------------------------------------------------------

  @alarm()
  @requiredField('pending', [FieldAccess.Read, FieldAccess.Write])
  @requiredField('message', [FieldAccess.Write])
  example(input: RpcInput, output: RpcOutput, alarm: RpcAlarm): void {
    const pending = input.get('pending')

    output.set('pending', '')
    output.set('message', pending)

    // Schedule another alarm.
    //alarm.after({"seconds": 5})

    console.log(`scheduled update of message to '${pending}'`)
  }
} // END ReplyMessage
