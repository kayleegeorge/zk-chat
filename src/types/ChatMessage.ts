var protobuf = require("protobufjs");

export const ProtoChatMessage = new protobuf.Type("ChatMessage")
   .add(new protobuf.Field("messageText", 1, "bytes"))
   .add(new protobuf.Field("nickname", 2, "string"))
   .add(new protobuf.Field("timestamp", 3, "uint64"))