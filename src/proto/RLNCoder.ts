import { RLNFullProof, RLNPublicSignals, Proof } from 'rlnjs'
import type { Codec } from 'protons-runtime'
import { encodeMessage, decodeMessage, message } from 'protons-runtime'


/* TODO
make writer/reader for StrBigInt[] typing compatibility
*/

// export namespace Pf {
//   let _codec: Codec<Proof>

//   export const codec = (): Codec<Proof> => {
//     if (_codec == null) {
//       _codec = message<Proof>(
//         (obj, writer, opts = {}) => {
//           if (opts.lengthDelimited !== false) {
//             writer.fork()
//           }
//           if (obj.pi_a != null) {
//             writer.uint32(10)
//             // writer.bytes(new Uint8Array(obj.pi_a))
//             writer.string(obj.pi_a.toString())
//           } else {
//             throw new Error('Proof: required field "pi_a" not found in proof')
//           }
//           if (obj.pi_b != null) {
//             writer.uint32(18)
//             //writer.string(obj.pi_a)
//           } else {
//             throw new Error('Proof: required field "pi_a" not found in proof')
//           }
//           if (obj.pi_c != null) {
//             writer.uint32(26)
//             //writer.string(obj.pi_c)
//           } else {
//             throw new Error('Proof: required field "pi_c" not found in proof')
//           }
//           if (obj.protocol != null) {
//             writer.uint32(34)
//             writer.string(obj.protocol)
//           } else {
//             throw new Error('Proof: required field "protocol" not found in proof')
//           }
//           if (obj.curve != null) {
//             writer.uint32(42)
//             writer.string(obj.curve)
//           } else {
//             throw new Error('Proof: required field "curve" not found in proof')
//           }
//         },
//         (reader, length) => {
//           const obj: any = {
//             pi_a: [],
//             pi_b: [[]],
//             pi_c: [],
//             protocol: '',
//             curve: '',
//           }

//           const end = length == null ? reader.len : reader.pos + length

//           while (reader.pos < end) {
//             const tag = reader.uint32()

//             switch (tag >>> 3) {
//               case 1:
//                 obj.pi_a = reader.bytes()
//                 break
//               case 2:
//                 obj.pi_b = reader.bytes()
//                 break
//               case 3:
//                 obj.pi_c = reader.bytes()
//                 break
//               case 4:
//                 obj.protocol = reader.string()
//                 break
//               case 5:
//                 obj.curve = reader.string()
//                 break
//               default:
//                 reader.skipType(tag & 7)
//                 break
//             }
//           }
//           return obj
//         },
//       )
//     }
//     return _codec
//   }
//   export const encode = (obj: Proof): Uint8Array => {
//     return encodeMessage(obj, Pf.codec())
//   }

//   export const decode = (buf: Uint8Array): Proof => {
//     return decodeMessage(buf, Pf.codec())
//   }
// }

// export namespace PublicSignals {
//   let _codec: Codec<RLNPublicSignals>

//   export const codec = (): Codec<RLNPublicSignals> => {
//     if (_codec == null) {
//       _codec = message<RLNPublicSignals>(
//         (obj, writer, opts = {}) => {
//           if (opts.lengthDelimited !== false) {
//             writer.fork()
//           }
//           if (obj.yShare != null) {
//             writer.uint32(10)
//             /* TODO: typing here */
//             writer.string(obj.yShare.toString())
//           } else {
//             throw new Error('Proof: required field "yshare" not found in proof')
//           }
//           if (obj.merkleRoot != null) {
//             writer.uint32(18)
//             writer.string(obj.merkleRoot.toString())
//           } else {
//             throw new Error('Proof: required field "merkleroot" not found in proof')
//           }
//           if (obj.internalNullifier != null) {
//             writer.uint32(26)
//             writer.string(obj.internalNullifier.toString())
//           } else {
//             throw new Error('Proof: required field "internalNullifer" not found in proof')
//           }
//           if (obj.signalHash != null) {
//             writer.uint32(34)
//             writer.string(obj.signalHash.toString())
//           } else {
//             throw new Error('Proof: required field "signalHash" not found in proof')
//           }
//           if (obj.epoch != null) {
//             writer.uint32(42)
//             writer.string(obj.epoch.toString())
//           } else {
//             throw new Error('Proof: required field "epoch" not found in proof')
//           }
//           if (obj.rlnIdentifier != null) {
//             writer.uint32(50)
//             writer.string(obj.rlnIdentifier.toString())
//           } else {
//             throw new Error('Proof: required field "rlnIdentifier" not found in proof')
//           }
//         },
//         (reader, length) => {
//           const obj: any = {
//             yShare: '',
//             merkleRoot: '',
//             internalNullifier: '',
//             signalHash: '',
//             epoch: '',
//             rlnIdentifier: '',
//           }

//           const end = length == null ? reader.len : reader.pos + length

//           while (reader.pos < end) {
//             const tag = reader.uint32()

//             switch (tag >>> 3) {
//               case 1:
//                 obj.yShare = reader.bytes()
//                 break
//               case 2:
//                 obj.merkleRoot = reader.bytes()
//                 break
//               case 3:
//                 obj.internalNullifier = reader.bytes()
//                 break
//               case 4:
//                 obj.signalHash = reader.bytes()
//                 break
//               case 5:
//                 obj.epoch = reader.bytes()
//                 break
//               case 6:
//                 obj.rlnIdentifier = reader.bytes()
//                 break
//               default:
//                 reader.skipType(tag & 7)
//                 break
//             }
//           }
//           return obj
//         },
//       )
//     }
//     return _codec
//   }
//   export const encode = (obj: RLNPublicSignals ): Uint8Array => {
//     return encodeMessage(obj, PublicSignals.codec())
//   }

//   export const decode = (buf: Uint8Array): RLNPublicSignals => {
//     return decodeMessage(buf, PublicSignals.codec())
//   }
// }


// export namespace RLNProof {
//   let _codec: Codec<RLNFullProof>

//   export const codec = (): Codec<RLNFullProof> => {
//     if (_codec == null) {
//       _codec = message<RLNFullProof>(
//         (obj, writer, opts = {}) => {
//           if (opts.lengthDelimited !== false) {
//             writer.fork()
//           }

//           if (obj.proof != null) {
//             writer.uint32(10)
//             Pf.codec().encode(obj.proof, writer)
//           } else {
//             throw new Error(
//               'Protocol error: required field "proof" was not found in object',
//             )
//           }

//           if (obj.publicSignals != null) {
//             writer.uint32(18)
//             PublicSignals.codec().encode(obj.publicSignals, writer)
//           } else {
//             throw new Error(
//               'Protocol error: required field "merkleRoot" was not found in object',
//             )
//           }


//           if (opts.lengthDelimited !== false) {
//             writer.ldelim()
//           }
//         },
//         (reader, length) => {
//           const obj: any = {
//             proof: new Uint8Array(0),
//             PublicSignals: new Uint8Array(0),
//           }

//           const end = length == null ? reader.len : reader.pos + length

//           while (reader.pos < end) {
//             const tag = reader.uint32()

//             switch (tag >>> 3) {
//               case 1:
//                 obj.rateLimitProof = Pf.codec().decode(
//                   reader,
//                   reader.uint32(),
//                 )
//                 break
//               case 2:
//                 obj.rateLimitProof = PublicSignals.codec().decode(
//                   reader,
//                   reader.uint32(),
//                 )
//                 return
//               default:
//                 reader.skipType(tag & 7)
//                 break
//             }
//           }

//           if (obj.proof == null) {
//             throw new Error(
//               'Protocol error: value for required field "proof" was not found in protobuf',
//             )
//           }

//           if (obj.publicSignals == null) {
//             throw new Error(
//               'Protocol error: value for required field "publicSignals" was not found in protobuf',
//             )
//           }
//           return obj
//         },
//       )
//     }

//     return _codec
//   }

//   export const encode = (obj: RLNFullProof): Uint8Array => {
//     return encodeMessage(obj, RLNProof.codec())
//   }

//   export const decode = (buf: Uint8Array): RLNFullProof => {
//     return decodeMessage(buf, RLNProof.codec())
//   }
// }