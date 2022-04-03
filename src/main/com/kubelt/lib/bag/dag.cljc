(ns com.kubelt.lib.bag.dag
  "Defines the DAGs that are stored in a BAG."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.lib.bag.check :as bag.check]
   [com.kubelt.lib.bag.node :as bag.node]
   [com.kubelt.lib.ipld :as ipld]))

;; Store list of all nodes in DAG
;; Store edges in separate list
;; Store hierarchical relationship separately? Makes it easier to tree-seq
;; - children are anonymous (part of a list)
;; - children are named (part of a map)
;; nodes have external links (CIDs to elsewhere)

;; (add-dag bag :label) -> bag
;; (add-node dag :label)  {data}
;; (add-link)

;; TODO test
;; TODO do this with (update m k f x)?
;; Feels like a macro...
(defn- assoc-missing-key
  "Takes a map, and if the given key is not set, sets it to the given
  value. Returns the updated map."
  [m k v]
  (if (contains? m k)
    m
    (assoc m k v)))

;; TODO test
(defn- add-node-defaults
  "Take a DAG and node, and if the node is missing any configuration
  options available in the DAG, set them, returning the updated node."
  [dag node]
  (let [codec (get dag :ipld/codec ipld/default-codec)
        hasher (get dag :ipld/hasher ipld/default-hasher)]
    (-> node
        (assoc-missing-key :ipld/codec codec)
        (assoc-missing-key :ipld/hasher hasher))))

;; TODO test
(defn- link-node
  "Add a link between the parent and child nodes in the given DAG. Returns
  the updated DAG."
  [{:keys [kubelt.dag/edges] :as dag} parent child]
  ;; :kubelt.dag/edges is a map from parent node to a set of
  ;; children.
  (let [edges (if (contains? edges parent)
                ;; The edges map already has the parent node as a
                ;; key. Add the child node to its set of children.
                (update edges conj child)
                ;; The edges map doesn't yet have the parent node as a
                ;; key. Create a mapping from parent node to a set of
                ;; child nodes.
                (assoc edges parent #{child}))]
    (assoc dag :kubelt.dag/edges edges)))

;; TODO test
(defn- add-node
  "Add a node, returning the updated DAG. This is an internal utility; it
  only performs one part of the process of adding a node to a
  DAG. Use (add-child) or another public method from outside."
  [dag node]
  {:pre [(bag.check/dag? dag) (bag.check/node? node)]}
  (update-in dag [:kubelt.dag/nodes] conj node))

;; TODO
;; TODO test me
#_(defn as-tree
  "FIXME"
  [{:keys [kubelt.dag/nodes kubelt.dag/edges kubelt.dag/root]}]
  (letfn [(add-children [n]
            ;; For each node set an attribute :kubelt.node/child whose
            ;; value is the set of children. If the node has no
            ;; children, the node is returned unchanged.
            (if-let [edge-set (get edges n)]
              (assoc n :kubelt.node/child edge-set)
              n))]
    (let [nodes (map add-children nodes)]
      ;; ?? FIXME
      nodes)))

;; TODO
;; TODO test me
;; TODO use postwalk to visit nodes in depth-first, post-order traversal
;; of a given form. Pass in the encoder function that converts each node
;; into a block and replace each node with the result.
;;
;; TODO pass in transform fn; this will be our block encoder fn
;;
;; TODO implement with zippers? Bounded memory...
#_(defn dag-walk
  [{:keys [kubelt.dag/edges kubelt.dag/root] :as dag}]
  (letfn [(post-order [root]
            (if-let [edge-set (get edges root)]
              ;; There are children to handle.
              ;; We're at a leaf node.
              ))]
    ;; For each child...
    (post-order ...)
    ;; Finally, process the root
    (post-order root)
    ))

;; Public
;; -----------------------------------------------------------------------------

(defn make-dag
  "Returns an empty DAG using default codec and hasher settings. If an
  options map is provided, the keys :ipld/hasher and :ipld/codec can be
  used to override the default hashing algorithm and codec used to
  construct IPLD blocks."
  ([]
   (make-dag {}))
  ([options]
   {:pre [(map? options)]}
   (let [defaults {:ipld/codec ipld/default-codec
                   :ipld/hasher ipld/default-hasher}
         options (-> defaults
                     (merge options)
                     (select-keys [:ipld/codec :ipld/hasher]))]
     (merge options
            {:kubelt/type :kubelt.type/dag
             :kubelt.dag/edges {}
             :kubelt.dag/nodes #{}}))))

(defn has-root?
  "Returns true if the DAG has a root node, and false otherwise."
  [dag]
  {:pre [(bag.check/dag? dag)]}
  (contains? dag :kubelt.dag/root))

(defn has-node?
  "Returns true if the DAG already contains the given node, and false
  otherwise."
  [dag node]
  {:pre [(bag.check/dag? dag) (bag.check/node? node)]}
  (let [nodes (get dag :kubelt.dag/nodes)
        ;; When adding nodes, we set any missing configuration for the
        ;; node, e.g. :ipld/codec, :ipld/hasher. We have to do the same
        ;; thing to the node we're given here for an equality check to
        ;; pass.
        node (add-node-defaults dag node)]
    (contains? nodes node)))

(defn root
  "Returns the root node of the DAG, or nil if root has not been set."
  [dag]
  {:pre [(bag.check/dag? dag)]}
  (get dag :kubelt.dag/root))

(defn children
  "Returns a sequence of the node's child nodes."
  [dag node]
  {:pre [(bag.check/dag? dag) (bag.check/node? node)]}
  (let [edges (get dag :kubelt.dag/edges)
        node (add-node-defaults dag node)]
    (get edges node)))

(defn leaf?
  "Returns true if this node has no children, false otherwise."
  [dag node]
  (let [edges (get dag :kubelt.dag/edges)
        ;; When adding a node we assign any missing attributes,
        ;; e.g. codec, hasher. For an equality check to succeed we must
        ;; ensure given node undergoes the same addition.
        node (add-node-defaults dag node)]
    (not (contains? edges node))))

(defn branch?
  "Returns true if the node *may* have children (it also may not)."
  [dag node]
  {:pre [(bag.check/dag? dag) (bag.check/node? node)]}
  (not (leaf? dag node)))

;; TODO would it be clearer to have a separate fn for setting the root?
#_(defn set-root
  [dag node])

;; TODO test
(defn add-child
  ""
  ;; Add a node as the DAG root.
  ([dag node]
   {:pre [(bag.check/dag? dag) (bag.check/node? node)]}
   (let [;; If the codec or hasher aren't set for the node, adopt the
         ;; defaults set by the DAG (of the overall defaults if those
         ;; are missing for some reason).
         node+defaults (add-node-defaults dag node)]
     (-> dag
         ;; Add the node to our set of nodes.
         (add-node node+defaults)
         ;; Set the node as the DAG root.
         (assoc :kubelt.dag/root node+defaults))))
  ;; Add a node as the child of another node.
  ([dag parent child]
   {:pre [(bag.check/dag? dag) (bag.check/node? parent) (bag.check/node? child)]}
   (let [parent (add-node-defaults dag parent)
         child (add-node-defaults dag child)]
     ;; Add both parent and child to DAG if missing, then create an edge
     ;; between the two.
     (-> dag
         (add-node parent)
         (add-node child)
         (link-node parent child))))
  ;; Add a node as the named child of another node.
  #_([dag parent child label]
   {:pre [(bag.check/dag? dag)
          (bag.check/node? parent)
          (bag.check/node? child)
          (keyword? label)]}
   ;; TODO support labeled edges?
   ))

;; TODO add an external link (CID)
;; TODO should links be added to DAGs or to nodes or both?
#_(defn add-link
  ""
  [dag]
  {:pre [(bag.check/dag? dag)]}
  )

(defn node-seq
  "Given a DAG root node, return a lazy sequence of nodes obtained by
  depth-first walk of the DAG."
  [dag]
  {:pre [(bag.check/dag? dag)]}
  ;; Returns a lazy seq of the nodes in a DAG. If no root has been
  ;; set, returns an empty sequence.
  (if (has-root? dag)
    (let [root (get dag :kubelt.dag/root)
          branch? (partial branch? dag)
          children (partial children dag)]
      ;; NB: (children) is only called on nodes for which branch?
      ;; returns true.
      (tree-seq branch? children root))
    (seq [])))
