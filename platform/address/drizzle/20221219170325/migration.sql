CREATE TABLE address_tokens (
	`addressURN` text,
	`tokenId` text NOT NULL,
	`order` integer
);

CREATE TABLE collections (
	`contract` text PRIMARY KEY,
	`name` text NOT NULL
);

CREATE TABLE tokens (
	`tokenId` text PRIMARY KEY,
	`contract` text NOT NULL
);

CREATE UNIQUE INDEX IDX_address_tokens__addressURN__tokenId ON address_tokens (`addressURN`,`tokenId`);
CREATE INDEX IDX_address_tokens__addressURN ON address_tokens (`addressURN`);
CREATE INDEX IDX_address_tokens__tokenId ON address_tokens (`tokenId`);
CREATE INDEX IDX_tokens__contract ON tokens (`contract`);