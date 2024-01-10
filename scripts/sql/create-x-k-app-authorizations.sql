-- This script is used to generate a large number of nodes and edges for testing purposes.
-- Make sure to replace 100000 with the number of nodes/edges you want to generate.
-- Make sure to replace TEST with the name of the test you are running.
-- Make sure to replace 8861be514cda870274b57d4123a75ca9 with the client_id you are using.

INSERT INTO node (urn, nid, nss, fragment) 
WITH cnt AS (SELECT 1 x UNION SELECT x + 1 FROM cnt WHERE x < 100000)
SELECT 'urn:rollupid:identity/TEST' || x, 'rollupid', 'identity/TEST' || x, '' 
FROM cnt;

INSERT INTO node (urn, nid, nss, fragment) 
WITH cnt AS (SELECT 1 x UNION SELECT x + 1 FROM cnt WHERE x < 100000)
SELECT 'urn:rollupid:authorization/TEST' || x || '@8861be514cda870274b57d4123a75ca9', 'rollupid', 'authorization/TEST' || x || '@8861be514cda870274b57d4123a75ca9', ''
FROM cnt;

INSERT INTO node_rcomp (nodeUrn, key, value) 
WITH cnt AS (SELECT 1 x UNION SELECT x + 1 FROM cnt WHERE x < 100000)
SELECT 'urn:rollupid:authorization/TEST' || x || '@8861be514cda870274b57d4123a75ca9', 'client_id', '8861be514cda870274b57d4123a75ca9'
FROM cnt;

INSERT INTO edge (tag, src, dst, createdTimestamp) 
WITH cnt AS (SELECT 1 x UNION SELECT x + 1 FROM cnt WHERE x < 100000)
SELECT 'urn:edge-tag:authorizes/access', 'urn:rollupid:identity/TEST' || x, 'urn:rollupid:authorization/TEST' || x || '@8861be514cda870274b57d4123a75ca9', datetime('now')
FROM cnt;
