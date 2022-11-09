### Create instance of zkChat
```
import { zkChat } from '@waku/zk-chat'
await zkChat.create(appName, waku) // more to come
```

### Message usage
```
message Message {
  optional string message = 1;
  optional uint64 epoch = 2; // unix time rounded to the minute
  optional Bytes rln_proof = 3;
}
```