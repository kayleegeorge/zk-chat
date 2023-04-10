import RLN from './RLN';
declare enum ConnectionStatus {
    ready = "ready",
    connecting = "connecting",
    disconnected = "disconnected"
}
export declare class Connection {
    connectionStatus: ConnectionStatus;
    private connectionInstance;
    private rlnInstance;
    constructor(rlnInstance: RLN);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    subscribeToRoom(contentTopic: string): Promise<void>;
    unsubscribeFromRoom(contentTopic: string): Promise<void>;
    sendMessage(text: string, alias: string, roomName: string): Promise<void>;
    retrieveMessageStore(contentTopic: string): Promise<void>;
}
export {};
