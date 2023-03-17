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
    connect(): void;
    disconnect(): void;
    subscribeToRoom(contentTopic: string): void;
    unsubscribeFromRoom(contentTopic: string): void;
    sendMessage(text: string, alias: string, roomName: string): Promise<void>;
    retrieveMessageStore(contentTopic: string): Promise<void>;
}
export {};
