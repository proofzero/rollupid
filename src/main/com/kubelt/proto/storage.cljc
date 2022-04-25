(ns com.kubelt.proto.storage
  "A protocol that enables SDK state to be serialized into the environment"
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"})

(defprotocol Storage
  "A simple Storage protocol"
  (init! [this]
    "inititalise")
  (init-state! [this state]
    "inititalise with initial state")
  (write! [this state]
    "serialize and io/write")
  (read
    [this]
    "read/deserialize all")
  (read-kw [this kw]
    "read/deserialize data at place/kw"))
