import { createDurable } from 'itty-durable'

import type { Environment, IttyDurableObjectState } from '../types'

export default class ReplyMessage extends createDurable({
  autoReturn: true,
  autoPersist: false,
}) {
  state: IttyDurableObjectState

  constructor(state: IttyDurableObjectState, env: Environment) {
    super(state, env)
    this.state = state
  }

  async init(message: string): Promise<object> {
    // Update the value of the 'message' field.
    return await this.state.storage.put('message', message)
  }

  async message(): Promise<object> {
    const message = this.state.storage.get('message')
    return message
  }

  async schedule(message: string, delay: number): Promise<object> {
    // Store the pending message. It will be read by the alarm handler.
    this.state.storage.put('pending', message)

    // Schedule the alarm.
    const timestamp = Date.now() + delay
    this.state.storage.setAlarm(timestamp)

    return {
      message,
      timestamp,  
    }
  }

  async alarm() {
    const pending = this.state.storage.get('pending')

    this.state.storage.set('pending', '')
    this.state.storage.set('message', pending)

    // Schedule another alarm.
    //alarm.after({"seconds": 5})

    console.log(`scheduled update of message to '${pending}'`)
  }
}
