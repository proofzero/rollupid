-- This script is used to generate a large number of nodes and edges for testing purposes.
-- Uncomment the INSERT statements after checking out the output of the script.

-- Creating a temporary table to store counter, test name, and client ID
CREATE TEMP TABLE IF NOT EXISTS temp_table (
    x INTEGER PRIMARY KEY,
    test_name TEXT,
    client_id TEXT
);
INSERT OR IGNORE INTO temp_table (x, test_name, client_id)
SELECT rowid, 
       'TEST_NAME',
       'MY_CLIENT_ID'
FROM generate_series(1, 100000);

-- Inserting needed nodes and edges into the database
-- INSERT INTO node (urn, nid, nss, fragment) 
SELECT 'urn:rollupid:identity/' || test_name || x, 
       'rollupid', 
       'identity/' || test_name || x, 
       '' 
FROM temp_table;

-- INSERT INTO node (urn, nid, nss, fragment) 
SELECT 'urn:rollupid:authorization/' || test_name || x || '@' || client_id, 
       'rollupid', 
       'authorization/' || test_name || x || '@' || client_id, 
       '' 
FROM temp_table;

-- INSERT INTO node_rcomp (nodeUrn, key, value) 
SELECT 'urn:rollupid:authorization/' || test_name || x || '@' || client_id, 
       'client_id', 
       client_id
FROM temp_table;

-- INSERT INTO edge (tag, src, dst, createdTimestamp) 
SELECT 'urn:edge-tag:authorizes/access', 
       'urn:rollupid:identity/' || test_name || x, 
       'urn:rollupid:authorization/' || test_name || x || '@' || client_id, 
       datetime('now')
FROM temp_table;

-- Cleaning up by dropping the temporary table
DROP TABLE temp_table;