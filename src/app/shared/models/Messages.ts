export interface Message {
    messageID: string;
    senderID: string;
    receiverID: string;
    content: string;
    timestamp: Date;
    readStatus: boolean;
  }
  