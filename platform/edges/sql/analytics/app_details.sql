SELECT n.nss, q.key, q.value FROM node as n
  LEFT JOIN node_qcomp as q ON n.urn = q.nodeUrn
  WHERE n.nss LIKE "application/%" AND q.key = "name" AND q.value NOT LIKE "%test%";