-- EDGE
DROP TABLE IF EXISTS bkp_edge;
CREATE TABLE bkp_edge AS SELECT * FROM edge;

DROP TABLE IF EXISTS temp_edge;
CREATE TABLE temp_edge AS SELECT * FROM edge;

-- EDGE.TAG
UPDATE temp_edge SET tag = replace(tag, 'urn:edge-tag:owns/access', 'urn:edge-tag:owns/authorization');
UPDATE temp_edge SET tag = replace(tag, 'urn:edge-tag:owns/address', 'urn:edge-tag:owns/account');

-- EDGE.SRC
UPDATE temp_edge SET src = replace(src, 'urn:rollupid:access', 'urn:rollupid:authorization');
UPDATE temp_edge SET src = replace(src, 'urn:rollupid:account', 'urn:rollupid:identity');

-- EDGE.DST
UPDATE temp_edge SET dst = replace(dst, 'urn:rollupid:access', 'urn:rollupid:authorization');
UPDATE temp_edge SET dst = replace(dst, 'urn:rollupid:address', 'urn:rollupid:account');

-- NODE

DROP TABLE IF EXISTS bkp_node;
CREATE TABLE bkp_node AS SELECT * FROM node;

DROP TABLE IF EXISTS temp_node;
CREATE TABLE temp_node AS SELECT * FROM node;

-- NODE.urn
UPDATE temp_node SET urn = replace(urn, 'urn:rollupid:access', 'urn:rollupid:authorization');
UPDATE temp_node SET urn = replace(urn, 'urn:rollupid:account', 'urn:rollupid:identity');
UPDATE temp_node SET urn = replace(urn, 'urn:rollupid:address', 'urn:rollupid:account');

-- NODE.nss
UPDATE temp_node SET nss = replace(nss, 'access', 'authorization');
UPDATE temp_node SET nss = replace(nss, 'account', 'identity');
UPDATE temp_node SET nss = replace(nss, 'address', 'account');

-- NODE_QCOMP
DROP TABLE IF EXISTS bkp_node_qcomp;
CREATE TABLE bkp_node_qcomp AS SELECT * FROM node_qcomp;

DROP TABLE IF EXISTS temp_node_qcomp;
CREATE TABLE temp_node_qcomp AS SELECT * FROM node_qcomp;

-- NODE_QCOMP.nodeUrn
UPDATE temp_node_qcomp SET nodeUrn = replace(nodeUrn, 'urn:rollupid:account', 'urn:rollupid:identity');
UPDATE temp_node_qcomp SET nodeUrn = replace(nodeUrn, 'urn:rollupid:address', 'urn:rollupid:account');

-- NODE_QCOMP.key
UPDATE temp_node_qcomp SET key = replace(key, 'primaryAddressURN', 'primaryAccountURN');

-- NODE_QCOMP.value
UPDATE temp_node_qcomp SET value = replace(value, 'urn:rollupid:address', 'urn:rollupid:account');

-- NODE_RCOMP
DROP TABLE IF EXISTS bkp_node_rcomp;
CREATE TABLE bkp_node_rcomp AS SELECT * FROM node_rcomp;

DROP TABLE IF EXISTS temp_node_rcomp;
CREATE TABLE temp_node_rcomp AS SELECT * FROM node_rcomp;

-- NODE_RCOMP.nodeUrn
UPDATE temp_node_rcomp SET nodeUrn = replace(nodeUrn, 'urn:rollupid:access', 'urn:rollupid:authorization');
UPDATE temp_node_rcomp SET nodeUrn = replace(nodeUrn, 'urn:rollupid:address', 'urn:rollupid:account');

-- NODE_RCOMP.key

-- NODE_RCOMP.value
UPDATE temp_node_rcomp SET value = replace(value, 'urn:rollupid:address', 'urn:rollupid:account');

-- DELETE existing data
DELETE FROM node_qcomp;
DELETE FROM node_rcomp;
DELETE FROM edge;
DELETE FROM node;

-- CLEANUP OLD INVALID RECORDS (WITH FOREIGN KEY CONSTRAINT FAILURES)
DELETE FROM temp_edge WHERE src NOT IN (SELECT urn FROM temp_node);
DELETE FROM temp_edge WHERE dst NOT IN (SELECT urn FROM temp_node);
DELETE FROM temp_node_qcomp WHERE nodeUrn NOT IN (SELECT urn FROM temp_node);
DELETE FROM temp_node_rcomp WHERE nodeUrn NOT IN (SELECT urn FROM temp_node);

-- COPY updated data
INSERT INTO node SELECT * FROM temp_node;
INSERT INTO node_qcomp SELECT * FROM temp_node_qcomp;
INSERT INTO node_rcomp SELECT * FROM temp_node_rcomp;
INSERT INTO edge SELECT * FROM temp_edge;

-- DROP temp tables
DROP TABLE temp_node_qcomp;
DROP TABLE temp_node_rcomp;
DROP TABLE temp_edge;
DROP TABLE temp_node;