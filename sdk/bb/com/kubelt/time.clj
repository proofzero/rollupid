(ns com.kubelt.time
  "Time-related utilities."
  (:import
   [java.time.format DateTimeFormatter]
   [java.time LocalDateTime])  )

(defn timestamp
  "Current the current timestamp as a string."
  []
  (let [date (LocalDateTime/now)
        formatter (DateTimeFormatter/ofPattern "yyyy-MM-dd HH:mm:ss")]
    (.format date formatter)))

(defn iso-date
  "Current the current timestamp as a string."
  []
  (let [date (LocalDateTime/now)
        formatter (DateTimeFormatter/ISO_DATE)]
    (.format date formatter)))
