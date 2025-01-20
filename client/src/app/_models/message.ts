export interface Message {
    id: number
    messageThreadId: number
    messageThread: string
    senderId: number
    senderMail: string
    recipientId: number
    recipientMail: string
    content: string
    dateRead?: Date
    messageSent: Date
}