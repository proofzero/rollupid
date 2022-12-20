CREATE TABLE collections (
	`contract` text PRIMARY KEY,
	`name` text NOT NULL
);

CREATE TABLE tokens (
	`tokenId` text,
	`contract` text NOT NULL,
	`addressURN` text NOT NULL,
	`gallery_order` integer
);

CREATE INDEX IDX_tokens__addressURN ON tokens (`addressURN`);
CREATE INDEX IDX_tokens__contract ON tokens (`contract`);
CREATE UNIQUE INDEX IDX_token_addresses__addressURN__tokenId ON tokens (`tokenId`,`contract`);