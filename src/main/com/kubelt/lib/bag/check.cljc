(ns com.kubelt.lib.bag.check
  "Checks for BAG and subsidiary types."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"})

(defn dag?
  "Return true if the given value is a DAG."
  [x]
  (and
   (map? x)
   (= :kubelt.type/dag (:kubelt/type x))))

(defn bag?
  "Return true if the given value is a BAG."
  [x]
  (and
   (map? x)
   (= :kubelt.type/bag (:kubelt/type x))))

(defn node?
  "Return true if the given value is a DAG node."
  [x]
  (and
   (map? x)
   (= :kubelt.type/node (:kubelt/type x))))

(defn data?
  "Return true if the given value is valid node data."
  [x]
  (or
   (map? x)
   (vector? x)))
