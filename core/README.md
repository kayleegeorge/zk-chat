### Message usage

```
message Message {
  optional string message = 1;
  optional uint64 epoch = 2; // unix time rounded to the minute
  optional Bytes rln_proof = 3;
}
```