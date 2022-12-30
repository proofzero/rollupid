#!/usr/bin/env bash
set +ex
ACCOUNT_ID="2906425795180ede5ac707178f96406d"
API_TOKEN="V8OcpIFJ4fDCBbQIEHom5MKRGThVICH_y1t7flqF"
curl -X POST "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/analytics_engine/sql" -H "Authorization: Bearer $API_TOKEN" -d "SELECT dataset, timestamp, _sample_interval, blob1 AS First, blob2 AS Second, blob3 AS Third, double1, double2, index1 FROM AccessAnalyticsDev" 

