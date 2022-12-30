import { createDurable } from 'itty-durable'
import { Node } from '@kubelt/types'
import type { Environment } from '../types'

export default class ReplyMessage extends createDurable({
  autoReturn: true,
  autoPersist: false,
}) {
  declare state: Node.IttyDurableObjectState<Environment>

  constructor(
    state: Node.IttyDurableObjectState<Environment>,
    env: Environment
  ) {
    super(state, env)
    this.state = state
  }

  async init(message: string): Promise<void> {
    // Update the value of the 'message' field.
    return this.state.storage.put('message', message)
  }

  async message(): Promise<string | undefined> {
    const message = this.state.storage.get<string>('message')
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

    this.state.storage.put('pending', '')
    this.state.storage.put('message', pending)

    // Schedule another alarm.
    //alarm.after({"seconds": 5})

    console.log(`scheduled update of message to '${pending}'`)
  }
}
