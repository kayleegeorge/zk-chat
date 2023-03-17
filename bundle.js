/**
 * @module zk-chat
 * @version 0.0.1
 * @file decentralized p2p chat library
 * @copyright Ethereum Foundation 2022
 * @license MIT
 * @see [Github]{@link https://github.com/kayleegeorge/zk-chat#readme}
*/
import { EncoderV0, DecoderV0 } from 'js-waku/lib/waku_message/version_0';
import 'ethers';
import { message, encodeMessage, decodeMessage } from 'protons-runtime';
import { RLN as RLN$1, Registry, Cache, genExternalNullifier } from 'rlnjs';
import { Protocols } from 'js-waku';
import { createLightNode } from 'js-waku/lib/create_waku';
import { waitForRemotePeer } from 'js-waku/lib/wait_for_remote_peer';

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __asyncValues(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
}

var RoomType;
(function (RoomType) {
    RoomType["PubGroup"] = "Public";
    RoomType["PrivGroup"] = "Private";
    /*
      * Future:
      * DM = 'DirectMessage',
      *SemaphoreGroup = 'Semaphore', // can join group if in a certain Semaphore group
      * GatekeepersGroup = 'Gatekeepers', // only appointed gatekeepers can add members
      */
})(RoomType || (RoomType = {}));

/*
 * Create a chat room
 */
var ChatRoom = /** @class */ (function () {
    function ChatRoom(chatRoomName, roomType, chatMembers, rlnInstance, connection, provider) {
        this.chatRoomName = chatRoomName;
        this.roomType = roomType;
        this.provider = provider;
        this.rlnInstance = rlnInstance;
        this.chatMembers = chatMembers;
        this.connection = connection;
    }
    /* retrieve Store Messages */
    ChatRoom.prototype.retrieveMessageStore = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.connection.retrieveMessageStore(this.chatRoomName)]; // content topic
            });
        });
    };
    /* send a message */
    ChatRoom.prototype.sendMessage = function (text, alias) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.connection.sendMessage(text, alias, this.chatRoomName)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _a.sent();
                        console.log('error sending message', text);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /* add chat member */
    ChatRoom.prototype.addChatMember = function (member) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.roomType == RoomType.PrivGroup && this.chatMembers.length == 5) {
                    console.error('Cannot add more than 5 members to a private group');
                }
                else {
                    this.chatMembers.push(member);
                }
                return [2 /*return*/, member];
            });
        });
    };
    ChatRoom.prototype.getChatMembers = function () {
        return this.chatMembers;
    };
    return ChatRoom;
}());

function dateToEpoch(timestamp) {
    var timeInMS = timestamp.getTime();
    return BigInt(Math.floor(timeInMS / 1000));
}
function strToArr(s) {
    return new TextEncoder().encode(s);
}
function arrToStr(b) {
    return new TextDecoder().decode(b);
}

/* eslint-disable @typescript-eslint/naming-convention */
var ChatMessage$1;
(function (ChatMessage) {
    var _codec;
    ChatMessage.codec = function () {
        if (_codec == null) {
            _codec = message(function (obj, w, opts) {
                if (opts === void 0) { opts = {}; }
                if (opts.lengthDelimited !== false) {
                    w.fork();
                }
                if ((obj.message != null && obj.message.byteLength > 0)) {
                    w.uint32(10);
                    w.bytes(obj.message);
                }
                if ((obj.epoch != null)) {
                    w.uint32(16);
                    w.uint64(obj.epoch);
                }
                if (obj.rlnProof != null) {
                    w.uint32(26);
                    w.bytes(obj.rlnProof);
                }
                if (obj.alias != null) {
                    w.uint32(34);
                    w.string(obj.alias);
                }
                if (opts.lengthDelimited !== false) {
                    w.ldelim();
                }
            }, function (reader, length) {
                var obj = {
                    message: new Uint8Array(0),
                    epoch: 0,
                };
                var end = length == null ? reader.len : reader.pos + length;
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                        case 1:
                            obj.message = reader.bytes();
                            break;
                        case 2:
                            obj.epoch = reader.uint64();
                            break;
                        case 3:
                            obj.rlnProof = reader.bytes();
                            break;
                        case 4:
                            obj.alias = reader.string();
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                    }
                }
                return obj;
            });
        }
        return _codec;
    };
    ChatMessage.encode = function (obj) {
        return encodeMessage(obj, ChatMessage.codec());
    };
    ChatMessage.decode = function (buf) {
        return decodeMessage(buf, ChatMessage.codec());
    };
})(ChatMessage$1 || (ChatMessage$1 = {}));

/* Wrapper for proto */
var ChatMessage = /** @class */ (function () {
    function ChatMessage(proto) {
        this.proto = proto;
    }
    /* Create Chat Message with a utf-8 string as payload. */
    ChatMessage.fromUtf8String = function (text, epoch, rlnProof, alias) {
        var message = strToArr(text);
        return new ChatMessage({
            message: message,
            epoch: epoch,
            rlnProof: rlnProof,
            alias: alias,
        });
    };
    /* decodes received msg payload from waku */
    ChatMessage.decodeWakuMessage = function (wakuMsg) {
        if (wakuMsg.payload) {
            try {
                return ChatMessage.decode(wakuMsg.payload);
            }
            catch (e) {
                console.error('Failed to decode chat message', e);
            }
        }
        return;
    };
    /**
     * Decode a protobuf payload to a ChatMessage.
     * @param bytes The payload to decode.
     */
    ChatMessage.decode = function (bytes) {
        var protoMsg = ChatMessage$1.decode(bytes);
        // might need to change this, reference zk chat app
        return new ChatMessage(protoMsg);
    };
    /**
     * Encode this ChatMessage to a byte array, to be used as a protobuf payload.
     * @returns The encoded payload.
     */
    ChatMessage.prototype.encode = function () {
        return ChatMessage$1.encode(this.proto);
    };
    Object.defineProperty(ChatMessage.prototype, "epoch", {
        get: function () {
            return this.epoch;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ChatMessage.prototype, "message", {
        get: function () {
            return arrToStr(this.proto.message);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ChatMessage.prototype, "rlnProof", {
        get: function () {
            return this.proto.rlnProof;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ChatMessage.prototype, "alias", {
        get: function () {
            var _a;
            return (_a = this.alias) !== null && _a !== void 0 ? _a : '';
        },
        enumerable: false,
        configurable: true
    });
    return ChatMessage;
}());

var TimePeriod;
(function (TimePeriod) {
    TimePeriod["Hour"] = "hour";
    TimePeriod["Day"] = "day";
    TimePeriod["Week"] = "week";
    TimePeriod["Month"] = "month";
})(TimePeriod || (TimePeriod = {}));
function getDates(timePeriod) {
    var startTime = new Date();
    switch (timePeriod) {
        case TimePeriod.Hour:
            startTime.setTime(Date.now() - 1000 * 60 * 60 * 1);
            break;
        case TimePeriod.Day:
            startTime.setTime(Date.now() - 1000 * 60 * 60 * 24 * 1);
            break;
        case TimePeriod.Week:
            startTime.setTime(Date.now() - 1000 * 60 * 60 * 24 * 7);
            break;
        case TimePeriod.Month:
            startTime.setTime(Date.now() - 1000 * 60 * 60 * 24 * 31);
            break;
    }
    var endTime = new Date();
    return { startTime: startTime, endTime: endTime };
}

/* initializes waku instance */
function createWakuNode() {
    return __awaiter(this, void 0, void 0, function () {
        var waku, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, createLightNode({ defaultBootstrap: true })];
                case 1:
                    waku = _a.sent();
                    return [4 /*yield*/, waku.start()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, waitForRemotePeer(waku, [Protocols.Store, Protocols.Filter, Protocols.LightPush])];
                case 3:
                    _a.sent();
                    console.log('success!');
                    return [2 /*return*/, waku];
                case 4:
                    e_1 = _a.sent();
                    console.error('Issue creating waku', e_1);
                    return [2 /*return*/];
                case 5: return [2 /*return*/];
            }
        });
    });
}

//import { Decoder } from 'js-waku/lib/interfaces'
// import { UnsubscribeFunction } from 'js-waku/lib/waku_filter/index'
var ConnectionStatus;
(function (ConnectionStatus) {
    ConnectionStatus["ready"] = "ready";
    ConnectionStatus["connecting"] = "connecting";
    ConnectionStatus["disconnected"] = "disconnected";
})(ConnectionStatus || (ConnectionStatus = {}));
/* Connecting with Waku as networking layer */
var WakuConnection = /** @class */ (function () {
    // updateChatStore: (value: ChatMessage[]) => void
    function WakuConnection(rlnInstance) {
        this.rlnInstance = rlnInstance;
        this.contentTopicFunctions = new Map();
    }
    /* subscribe to a certain contentTopic and add content topic functions */
    WakuConnection.prototype.subscribe = function (contentTopic) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var decoder, unsubscribe, functions;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        decoder = new DecoderV0(contentTopic);
                        return [4 /*yield*/, ((_a = this.waku) === null || _a === void 0 ? void 0 : _a.filter.subscribe([decoder], this.processIncomingMessage))];
                    case 1:
                        unsubscribe = _b.sent();
                        functions = {
                            encoder: new EncoderV0(contentTopic),
                            decoder: decoder,
                            unsubscribe: unsubscribe,
                        };
                        this.contentTopicFunctions.set(contentTopic, functions);
                        return [2 /*return*/];
                }
            });
        });
    };
    /* unsubscribe from a given room / content topic */
    WakuConnection.prototype.unsubscribe = function (contentTopic) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var unsub;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        unsub = (_a = this.contentTopicFunctions.get(contentTopic)) === null || _a === void 0 ? void 0 : _a.unsubscribe;
                        if (!unsub) return [3 /*break*/, 2];
                        return [4 /*yield*/, unsub()];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    /* connect to a waku node */
    WakuConnection.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, createWakuNode()];
                    case 1:
                        _a.waku = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /* disconnect waku node */
    WakuConnection.prototype.disconnect = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, ((_a = this.waku) === null || _a === void 0 ? void 0 : _a.stop())];
                    case 1:
                        _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _b.sent();
                        console.log('failed to stop waku');
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /* send a message using Waku */
    WakuConnection.prototype.sendMessage = function (payload, contentTopic) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var encoder;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        encoder = (_a = this.contentTopicFunctions.get(contentTopic)) === null || _a === void 0 ? void 0 : _a.encoder;
                        if (!this.waku || !encoder) {
                            throw new Error('waku not connected');
                        }
                        return [4 /*yield*/, this.waku.lightPush.push(encoder, { payload: payload }).then(function (msg) {
                                console.log("Sent Encoded Message: ".concat(msg));
                            })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /* process incoming received message and proof */
    WakuConnection.prototype.processIncomingMessage = function (msgBuf) {
        return __awaiter(this, void 0, void 0, function () {
            var chatMessage, message, epoch, rlnProof, alias, timestamp, proofResult, rlnFullProof;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!msgBuf.payload)
                            return [2 /*return*/];
                        chatMessage = ChatMessage.decodeWakuMessage(msgBuf);
                        if (!chatMessage)
                            return [2 /*return*/];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        message = chatMessage.message, epoch = chatMessage.epoch, rlnProof = chatMessage.rlnProof, alias = chatMessage.alias;
                        timestamp = new Date().setTime(Number(epoch) * 1000);
                        proofResult = void 0;
                        if (!!rlnProof) return [3 /*break*/, 2];
                        console.log('No Proof with Message');
                        return [3 /*break*/, 5];
                    case 2:
                        console.log("Proof attached: ".concat(rlnProof));
                        return [4 /*yield*/, RLN$1.fromJSRLNProof(rlnProof)];
                    case 3:
                        rlnFullProof = _a.sent();
                        return [4 /*yield*/, this.rlnInstance.verifyProof(rlnFullProof)];
                    case 4:
                        proofResult = _a.sent();
                        if (proofResult) {
                            //this.updateChatStore([chatMessage])
                            this.rlnInstance.addProofToCache(rlnFullProof); // add proof to RLN cache on success
                        }
                        _a.label = 5;
                    case 5:
                        console.log("Message Received from ".concat(alias, ": ").concat(message, ", sent at ").concat(timestamp));
                        return [3 /*break*/, 7];
                    case 6:
                        _a.sent();
                        console.log('Error receiving message');
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /* get all previous messages */
    WakuConnection.prototype.retrieveMessageStore = function (contentTopic, timePeriod) {
        var _a, e_3, _b, _c;
        var _d;
        return __awaiter(this, void 0, void 0, function () {
            var decoder, messages, _e, startTime, endTime, _f, _g, _h, msgPromises, wakuMessages, e_3_1, e_4;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        decoder = (_d = this.contentTopicFunctions.get(contentTopic)) === null || _d === void 0 ? void 0 : _d.decoder;
                        messages = [];
                        _e = getDates(timePeriod !== null && timePeriod !== void 0 ? timePeriod : TimePeriod.Week), startTime = _e.startTime, endTime = _e.endTime;
                        if (!this.waku || !decoder)
                            return [2 /*return*/];
                        _j.label = 1;
                    case 1:
                        _j.trys.push([1, 17, , 18]);
                        _j.label = 2;
                    case 2:
                        _j.trys.push([2, 10, 11, 16]);
                        _f = true, _g = __asyncValues(this.waku.store.queryGenerator([decoder], { timeFilter: { startTime: startTime, endTime: endTime } }));
                        _j.label = 3;
                    case 3: return [4 /*yield*/, _g.next()];
                    case 4:
                        if (!(_h = _j.sent(), _a = _h.done, !_a)) return [3 /*break*/, 9];
                        _c = _h.value;
                        _f = false;
                        _j.label = 5;
                    case 5:
                        _j.trys.push([5, , 7, 8]);
                        msgPromises = _c;
                        return [4 /*yield*/, Promise.all(msgPromises)];
                    case 6:
                        wakuMessages = _j.sent();
                        wakuMessages.map(function (wakuMsg) {
                            return wakuMsg ? ChatMessage.decodeWakuMessage(wakuMsg) : '';
                        })
                            .forEach(function (msg) { if (msg) {
                            messages.push(msg);
                        } });
                        return [3 /*break*/, 8];
                    case 7:
                        _f = true;
                        return [7 /*endfinally*/];
                    case 8: return [3 /*break*/, 3];
                    case 9: return [3 /*break*/, 16];
                    case 10:
                        e_3_1 = _j.sent();
                        e_3 = { error: e_3_1 };
                        return [3 /*break*/, 16];
                    case 11:
                        _j.trys.push([11, , 14, 15]);
                        if (!(!_f && !_a && (_b = _g.return))) return [3 /*break*/, 13];
                        return [4 /*yield*/, _b.call(_g)];
                    case 12:
                        _j.sent();
                        _j.label = 13;
                    case 13: return [3 /*break*/, 15];
                    case 14:
                        if (e_3) throw e_3.error;
                        return [7 /*endfinally*/];
                    case 15: return [7 /*endfinally*/];
                    case 16: return [3 /*break*/, 18];
                    case 17:
                        e_4 = _j.sent();
                        console.log('Failed to retrieve messages', e_4);
                        return [3 /*break*/, 18];
                    case 18: return [2 /*return*/, messages];
                }
            });
        });
    };
    return WakuConnection;
}());
/* note: can use this class to add more connection types in the future */
var Connection = /** @class */ (function () {
    function Connection(rlnInstance) {
        this.connectionStatus = ConnectionStatus.disconnected;
        this.rlnInstance = rlnInstance;
        this.connectionInstance = new WakuConnection(rlnInstance);
    }
    Connection.prototype.connect = function () {
        this.connectionInstance.connect();
    };
    Connection.prototype.disconnect = function () {
        this.connectionInstance.disconnect();
    };
    Connection.prototype.subscribeToRoom = function (contentTopic) {
        this.connectionInstance.subscribe(contentTopic);
    };
    Connection.prototype.unsubscribeFromRoom = function (contentTopic) {
        this.connectionInstance.unsubscribe(contentTopic);
    };
    /* send message by encoding to protobuf -> payload for waku message */
    Connection.prototype.sendMessage = function (text, alias, roomName) {
        return __awaiter(this, void 0, void 0, function () {
            var date, rawMessage, rlnProof, serializedRLNProof, protoMsg, payload;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        date = new Date();
                        rawMessage = { message: text, epoch: dateToEpoch(date) };
                        return [4 /*yield*/, this.rlnInstance.generateRLNProof(rawMessage.message, rawMessage.epoch)];
                    case 1:
                        rlnProof = _a.sent();
                        return [4 /*yield*/, RLN$1.toJSRLNProof(rlnProof)];
                    case 2:
                        serializedRLNProof = _a.sent();
                        protoMsg = new ChatMessage({
                            message: strToArr(text),
                            epoch: dateToEpoch(date),
                            rlnProof: serializedRLNProof,
                            alias: alias,
                        });
                        payload = protoMsg.encode() // encode to proto
                        ;
                        this.connectionInstance.sendMessage(payload, roomName);
                        return [2 /*return*/];
                }
            });
        });
    };
    Connection.prototype.retrieveMessageStore = function (contentTopic) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.connectionInstance.retrieveMessageStore(contentTopic);
                return [2 /*return*/];
            });
        });
    };
    return Connection;
}());

function generateAppIdentifier (appName) {
    var result = '';
    for (var i = 0; i < appName.length; i++) {
        result += appName.charCodeAt(i).toString(16);
    }
    return BigInt(parseInt(result, 16));
}

var GOERLI = 5;

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// path.normalize(path)
// posix version
function normalize(path) {
  var isPathAbsolute = isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isPathAbsolute).join('/');

  if (!path && !isPathAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isPathAbsolute ? '/' : '') + path;
}
// posix version
function isAbsolute(path) {
  return path.charAt(0) === '/';
}

// posix version
function join() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
}
function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b' ?
    function (str, start, len) { return str.substr(start, len) } :
    function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

// import * as fs from 'fs'
/* needed file paths */
var vkeyPath = join('src', 'zkeyFiles', 'verification_key.json');
var vkey = JSON.parse(vkeyPath); // doesn't work
var wasmFilePath = join('./zkeyFiles', 'rln', 'rln.wasm');
var finalZkeyPath = join('./zkeyFiles', 'rln', 'rln_final.zkey');
var RLN = /** @class */ (function () {
    // private memIndex: number
    function RLN(onChain, existingIdentity, rlnIdentifier) {
        // RLN
        this.registry = new Registry();
        this.contract = onChain;
        this.rlnjs = new RLN$1(wasmFilePath, finalZkeyPath, vkey, rlnIdentifier, existingIdentity);
        this.rlnIdentifier = this.rlnjs.rlnIdentifier;
        this.identityCommitments = [];
        this.cache = new Cache(this.rlnjs.rlnIdentifier);
        // RLN member
        this.identityCommitment = this.rlnjs.identity.getCommitment();
        this.registry.addMember(this.identityCommitment);
    }
    /* handle init on chain stuff */
    RLN.prototype.initOnChain = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.contract)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.constructRLNMemberTree()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /* generate RLN Proof */
    RLN.prototype.generateRLNProof = function (msg, epoch) {
        return __awaiter(this, void 0, void 0, function () {
            var epochNullifier, merkleProof, proof;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        epochNullifier = genExternalNullifier(epoch.toString());
                        return [4 /*yield*/, this.registry.generateMerkleProof(this.identityCommitment)];
                    case 1:
                        merkleProof = _a.sent();
                        proof = this.rlnjs.generateProof(msg, merkleProof, epochNullifier);
                        return [2 /*return*/, proof];
                }
            });
        });
    };
    /* RLN proof verification */
    RLN.prototype.verifyProof = function (rlnProof) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, RLN$1.verifyProof(vkey, rlnProof)];
            });
        });
    };
    /* construct RLN member tree locally */
    RLN.prototype.constructRLNMemberTree = function () {
        return __awaiter(this, void 0, void 0, function () {
            var memRegEvent, registeredMembers;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.contract)
                            return [2 /*return*/];
                        memRegEvent = this.contract.filters.MemberRegistered();
                        return [4 /*yield*/, this.contract.queryFilter(memRegEvent)];
                    case 1:
                        registeredMembers = _a.sent();
                        registeredMembers.forEach(function (event) {
                            if (event.args)
                                _this.registry.addMember(event.args.memkey);
                        });
                        // listen to new members added to rln contract
                        this.contract.on(memRegEvent, function (event) {
                            _this.registry.addMember(event.args.memkey);
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    /* Allow new user registraction with rln contract for rln registry */
    RLN.prototype.registerUserOnRLNContract = function (provider) {
        return __awaiter(this, void 0, void 0, function () {
            var price, signer, rlnContractWithSigner, txResponse, txReceipt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.contract)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.contract.MEMBERSHIP_DEPOSIT()];
                    case 1:
                        price = _a.sent();
                        signer = provider.getSigner();
                        rlnContractWithSigner = this.contract.connect(signer);
                        return [4 /*yield*/, rlnContractWithSigner.register(this.identityCommitment, { value: price })];
                    case 2:
                        txResponse = _a.sent();
                        console.log('Transaction broadcasted: ', txResponse);
                        return [4 /*yield*/, txResponse.wait()];
                    case 3:
                        txReceipt = _a.sent();
                        console.log('Transaction receipt', txReceipt);
                        return [2 /*return*/];
                }
            });
        });
    };
    /* handle adding proof to cache */
    RLN.prototype.addProofToCache = function (proof) {
        var result = this.cache.addProof(proof);
        // if breached, slash the member id commitment
        if (result.secret) {
            this.registry.slashMember(BigInt(result.secret));
            console.log('member withdrawn: ', result.secret);
            // if on chain, slash
            if (this.contract) {
                var withdrawRes = this.contract.withdraw(result.secret); // might need to add payable receiver
                console.log('contract rest: ', withdrawRes);
            }
        }
    };
    /* returns rln member Identity */
    RLN.prototype.getIdentityAsString = function () {
        return this.rlnjs.identity.toString();
    };
    /* generate RLN credentials */
    RLN.prototype.generateRLNcredentials = function (appName) {
        return {
            'application': appName,
            'appIdentifier': this.rlnjs.rlnIdentifier,
            'credentials': [{
                    'key': this.rlnjs.identity.getNullifier(),
                    'commitment': this.identityCommitment,
                    'membershipGroups': [{
                            'chainId': GOERLI,
                            'contract': this.contract,
                            'treeIndex': this.registry.indexOf(this.identityCommitment),
                        }],
                }],
            'version': 1, // change
        };
    };
    return RLN;
}());

var ChatApp = /** @class */ (function () {
    function ChatApp(appName, onChain, provider, existingIdentity, rlnIdentifier) {
        this.appName = appName;
        this.onChain = onChain;
        this.provider = provider;
        rlnIdentifier = rlnIdentifier ? rlnIdentifier : generateAppIdentifier(appName);
        this.rln = new RLN(onChain, existingIdentity, rlnIdentifier); // might need to pass provider?
        this.connection = new Connection(this.rln);
        this.chatRoomStore = new Map();
    }
    /* app-level user registration: add user to chatApp and RLN registry */
    ChatApp.prototype.registerUserOnChain = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.provider) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.rln.registerUserOnRLNContract(this.provider)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/, this.rln.rlnjs.identity];
                }
            });
        });
    };
    /* create chat room */
    ChatApp.prototype.createChatRoom = function (name, roomType, chatMembers) {
        if (chatMembers === void 0) { chatMembers = []; }
        var chatRoomName = "/".concat(this.appName, "/").concat(roomType, "-").concat(name, "/");
        // no duplicate chat room names
        var i = 0;
        while (chatRoomName + i.toString() in this.chatRoomStore) {
            i += 1;
        }
        chatRoomName += i.toString();
        var chatroom = new ChatRoom(chatRoomName, roomType, chatMembers, this.rln, this.connection, this.provider);
        this.chatRoomStore.set(chatRoomName, chatroom);
        return chatroom;
    };
    /* fetch all chat room messages for a given chatroom */
    ChatApp.prototype.fetchChatRoomMsgs = function (contentTopic) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                return [2 /*return*/, (_a = this.chatRoomStore.get(contentTopic)) === null || _a === void 0 ? void 0 : _a.retrieveMessageStore()];
            });
        });
    };
    /* get chat room names */
    ChatApp.prototype.fetchChatRoomsNames = function () {
        return Array.from(this.chatRoomStore.keys());
    };
    return ChatApp;
}());

export { ChatApp, ChatRoom, RLN };
