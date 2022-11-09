import protobuf from "protobufjs";
import protons from "protons";

export const proto = protons(`
message ChatMessage {
    string message = 1;
    uint64 epoch = 2;
    bytes rln_proof = 3;
}
`);

// protobuf msg packet
export const ChatMessage = new protobuf.Type("ChatMessage")
.add(new protobuf.Field("message", 1, "string"))
.add(new protobuf.Field("epoch", 2, "uint64"))
.add(new protobuf.Field("rln_proof", 3, "bytes"));