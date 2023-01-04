import { DOProxy } from 'do-proxy'

export default class ReplyMessage extends DOProxy {
  declare state: DurableObjectState

  constructor(state: DurableObjectState) {
    super(state)
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
    const pendingMessage = this.state.storage.get('pending')

    this.state.storage.put('pending', '')
    this.state.storage.put('message', pendingMessage)

    // Schedule another alarm.
    //alarm.after({"seconds": 5})

    console.log(`scheduled update of message to '${pendingMessage}'`)
  }
}
