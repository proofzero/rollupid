CREATE TABLE urnq_component (
	`id` integer PRIMARY KEY,
	`key` text NOT NULL,
	`value` text NOT NULL
);

CREATE TABLE urnr_component (
	`id` integer PRIMARY KEY,
	`key` text NOT NULL,
	`value` text NOT NULL
);

CREATE TABLE edge (
	`id` integer PRIMARY KEY,
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
	PRIMARY KEY ("edgeId", "permissionId")
);

CREATE TABLE node (
	`urn` text PRIMARY KEY,
	`nid` text NOT NULL,
	`nss` text NOT NULL,
	`fragment` text NOT NULL
);

CREATE TABLE node_qcomp_urnq_component (
	`nodeUrn` text NOT NULL,
	`qcomp` integer NOT NULL,
	FOREIGN KEY (`nodeUrn`) REFERENCES node(`urn`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`qcomp`) REFERENCES urnq_component(`id`) ON UPDATE cascade ON DELETE cascade
	PRIMARY KEY ("nodeUrn", "qcomp")
);

CREATE TABLE node_rcomp_urnr_component (
	`nodeUrn` text NOT NULL,
	`rcomp` integer NOT NULL,
	FOREIGN KEY (`nodeUrn`) REFERENCES node(`urn`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`rcomp`) REFERENCES urnr_component(`id`) ON UPDATE cascade ON DELETE cascade
	PRIMARY KEY ("nodeUrn", "rcomp")
);

CREATE TABLE permission (
	`id` integer PRIMARY KEY,
	`name` text NOT NULL
);

CREATE UNIQUE INDEX IDX_urnq_component_key_value ON urnq_component (`key`,`value`);
CREATE UNIQUE INDEX IDX_urnr_component_key_value ON urnr_component (`key`,`value`);
CREATE UNIQUE INDEX IDX_edge_src_dst_tag ON edge (`src`,`dst`,`tag`);
-- CREATE UNIQUE INDEX IDX_edge_permission_pk ON edge_permission (`edgeId`,`permissionId`);
CREATE INDEX IDX_edge_permission_edgeId ON edge_permission (`edgeId`);
CREATE INDEX IDX_edge_permission_permission ON edge_permission (`permissionId`);
-- CREATE UNIQUE INDEX IDX_node_qcomp_urnq_component_pk ON node_qcomp_urnq_component (`nodeUrn`,`qcomp`);
CREATE INDEX IDX_node_qcomp_urnq_component_nodeUrn ON node_qcomp_urnq_component (`qcomp`);
-- CREATE UNIQUE INDEX IDX_node_rcomp_urnr_component_pk ON node_rcomp_urnr_component (`nodeUrn`,`rcomp`);
CREATE INDEX IDX_node_rcomp_urnr_component_nodeUrn ON node_rcomp_urnr_component (`rcomp`);