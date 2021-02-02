
-- Table Structure
-- Primary Key
-- Creation Time
-- Creator User Id (if applicable)
-- Everything else


drop table if exists password_reset;
create table password_reset(
  password_reset_key_hash char(64) not null primary key,
  creation_time integer not null,
  creator_user_id integer not null
);

drop table if exists password;
create table password( 
  password_id integer not null primary key,
  creation_time integer not null,
  creator_user_id integer not null,
  user_id integer not null,
  password_kind integer not null, -- CHANGE | RESET | CANCEL
  password_hash char(64) not null, -- only valid if RESET | CANCEL
  password_reset_key_hash char(64) not null -- only valid if RESET
);

drop table if exists verification_challenge;
create table verification_challenge(
  verification_challenge_key_hash char(64) not null primary key,
  creation_time integer not null,
  name varchar(100) not null,
  email varchar(100) not null,
  password_hash char(64) not null
);

drop table if exists user;
create table user(
  user_id integer not null primary key,
  creation_time integer not null,
  name varchar(100) not null,
  email varchar(100) not null unique,
  verification_challenge_key_hash char(64) not null unique
);

-- TODO add user data

drop table if exists subscription;
create table subscription(
  subscription_id integer not null primary key,
  creation_time integer not null,
  creator_user_id integer not null,
  subscription_kind integer not null, -- VALID | CANCEL
  max_uses integer not null -- only valid if VALID
);

drop table if exists invoice;
create table invoice(
  invoice_id integer not null primary key,
  creation_time integer not null,
  creator_user_id integer not null,
  subscription_id integer not null,
  amount_cents integer not null
);


drop table if exists api_key;
create table api_key(
  api_key_id integer not null primary key,
  creation_time integer not null,
  creator_user_id integer not null,
  api_key_hash char(64) not null,
  api_key_kind integer not null, -- VALID, CANCEL
  duration integer not null -- only valid if api_key_kind == VALID
);
