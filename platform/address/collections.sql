PRAGMA foreign_keys=OFF;

CREATE TABLE IF NOT EXISTS "address_tokens" ("addressURN" char(42) PRIMARY KEY NOT NULL, "tokenId" varchar NOT NULL);
CREATE TABLE IF NOT EXISTS "tokens" ("tokenId" varchar PRIMARY KEY NOT NULL, "contract" char(42) NOT NULL);
CREATE TABLE IF NOT EXISTS "collections" ("contract" char(42) PRIMARY KEY NOT NULL, "name" varchar NOT NULL);
CREATE TABLE IF NOT EXISTS "gallery" ("accountURN" char(42) PRIMARY KEY NOT NULL, "tokenId" varchar, "order" INTEGER NOT NULL);

CREATE UNIQUE INDEX IF NOT EXISTS "IDX_address_tokens__tokenId" ON "address_tokens" ("tokenId") ;
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_tokens__contract" ON "tokens" ("contract") ;
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_gallery__token" ON "gallery" ("tokenId") ;

