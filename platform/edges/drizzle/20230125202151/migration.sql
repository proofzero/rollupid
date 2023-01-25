CREATE TABLE edge (
	`id` integer PRIMARY KEY NOT NULL,
	`tag` text NOT NULL,
	`src` text NOT NULL,
	`dst` text NOT NULL,
	FOREIGN KEY (`src`) REFERENCES node(`urn`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`dst`) REFERENCES node(`urn`) ON UPDATE no action ON DELETE no action,
);

CREATE TABLE edge_permission (
	`edgeId` integer NOT NULL,
	`permissionId` integer NOT NULL,
	FOREIGN KEY (`edgeId`) REFERENCES edge(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`permissionId`) REFERENCES permission(`id`) ON UPDATE no action ON DELETE no action
);

CREATE TABLE node (
	`urn` text PRIMARY KEY NOT NULL,
	`nid` text NOT NULL,
	`nss` text NOT NULL,
	`fragment` text NOT NULL
);

CREATE TABLE node_qcomp (
	`nodeUrn` text PRIMARY KEY NOT NULL,
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	FOREIGN KEY (`nodeUrn`) REFERENCES node(`urn`) ON UPDATE cascade ON DELETE cascade,
);

CREATE TABLE node_rcomp (
	`nodeUrn` text NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	FOREIGN KEY (`nodeUrn`) REFERENCES node(`urn`) ON UPDATE cascade ON DELETE cascade,
);

CREATE TABLE permission (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);

CREATE UNIQUE INDEX IDX_edge_src_dst_tag ON edge (`src`,`dst`,`tag`);
CREATE UNIQUE INDEX IDX_edge_permission_pk ON edge_permission (`edgeId`,`permissionId`);
CREATE INDEX IDX_edge_permission_edgeId ON edge_permission (`edgeId`);
CREATE INDEX IDX_edge_permission_permission ON edge_permission (`permissionId`);
CREATE INDEX IDX_node_qcomp_nodeUrn ON node_qcomp (`nodeUrn`);
CREATE INDEX IDX_node_qcomp_key ON node_qcomp (`key`);
CREATE INDEX IDX_node_qcomp_value ON node_qcomp (`value`);
CREATE UNIQUE INDEX IDX_node_rcomp_pk ON node_rcomp (`nodeUrn`,`key`);
CREATE INDEX IDX_node_rcomp_nodeUrn ON node_rcomp (`nodeUrn`);
CREATE INDEX IDX_node_rcomp_key ON node_rcomp (`key`);
CREATE INDEX IDX_node_rcomp_value ON node_rcomp (`value`);