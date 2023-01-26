CREATE TABLE edge (
	`tag` text NOT NULL,
	`src` text NOT NULL,
	`dst` text NOT NULL,
	PRIMARY KEY(`src`, `dst`, `tag`),
	FOREIGN KEY (`src`) REFERENCES node(`urn`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`dst`) REFERENCES node(`urn`) ON UPDATE no action ON DELETE no action
);

CREATE TABLE node (
	`urn` text PRIMARY KEY NOT NULL,
	`nid` text NOT NULL,
	`nss` text NOT NULL,
	`fragment` text NOT NULL
);

CREATE TABLE node_qcomp (
	`nodeUrn` text NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	PRIMARY KEY(`nodeUrn`, `key`),
	FOREIGN KEY (`nodeUrn`) REFERENCES node(`urn`) ON UPDATE cascade ON DELETE cascade
);

CREATE TABLE node_rcomp (
	`nodeUrn` text NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	PRIMARY KEY(`nodeUrn`, `key`),
	FOREIGN KEY (`nodeUrn`) REFERENCES node(`urn`) ON UPDATE cascade ON DELETE cascade
);

CREATE INDEX IDX_node_qcomp_nodeUrn ON node_qcomp (`nodeUrn`);
CREATE INDEX IDX_node_qcomp_key ON node_qcomp (`key`);
CREATE INDEX IDX_node_qcomp_value ON node_qcomp (`value`);
CREATE INDEX IDX_node_rcomp_nodeUrn ON node_rcomp (`nodeUrn`);
CREATE INDEX IDX_node_rcomp_key ON node_rcomp (`key`);
CREATE INDEX IDX_node_rcomp_value ON node_rcomp (`value`);