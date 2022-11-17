import protobuf from "protobufjs"

export const ChatMessage = new protobuf.Type("ChatMessage")
.add(new protobuf.Field("payload", 1, "bytes"))
.add(new protobuf.Field("contentTopic", 2, "string"))
.add(new protobuf.Field("version", 3, "uint32"))
.add(new protobuf.Field("timestamp", 4, "double"))
.add(new protobuf.Field("rate_limit_proof", 5, "RateLimitProof"))

export const RateLimitProof = new protobuf.Type("RateLimitProof")
.add(new protobuf.Field("proof", 1, "bytes"))
.add(new protobuf.Field("merkle_root", 2, "bytes"))
.add(new protobuf.Field("epoch", 3, "bytes"))
.add(new protobuf.Field("share_x", 4, "bytes"))
.add(new protobuf.Field("share_y", 5, "bytes"))
.add(new protobuf.Field("nullifier", 6, "bytes"))


// const root = await protobuf.load('message.proto');
// export const ChatMessage = root.lookupType('messagepacket.ChatMessage');
// export const RateLimitProof = root.lookupType('messagepacket.RateLimitProof');


