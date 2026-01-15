export type ChatMessage = {
  type: "message";
  username: string;
  content: string;
};

export type ServerMessage = ChatMessage & {
  createdAt: string;
};
