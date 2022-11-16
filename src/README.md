### Create instance of zkChat
```
import { ChatApp } from '@waku/zk-chat'
await ChatApp.create(appName, waku) // more to come
```

### Message usage
```
message ChatMessage {
    bytes payload = 1;
    string contentTopic = 2;
    uint32 version = 3;
    double timestamp = 4;
    string message = 5;
    RateLimitProof rate_limit_proof = 21;
}
```