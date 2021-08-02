-- Table Structure
-- Primary Key
-- Creation Time
-- Creator User Id (if applicable)
-- Everything else

CREATE DATABASE auth;
\c auth;

drop table if exists user_t;
create table user_t(
  user_id bigserial primary key,
  creation_time bigint not null
);

drop table if exists user_data_t;
create table user_data_t(
  user_data_id bigserial primary key,
  creation_time bigint not null,
  creator_user_id bigint not null,
  name text not null
);

drop table if exists verification_challenge_t;
create table verification_challenge_t(
  verification_challenge_key_hash varchar(64) not null primary key,
  creation_time bigint not null,
  creator_user_id bigint not null,
  to_parent bool not null,
  email text not null
);

drop table if exists email_t;
create table email_t(
  email_id bigserial primary key,
  creation_time bigint not null,
  creator_user_id bigint not null,
  verification_challenge_key_hash text not null
);

drop table if exists parent_permission_t;
create table parent_permission_t(
  parent_permission_id bigserial primary key,
  creation_time bigint not null,
  user_id bigint not null,
  -- INVARIANT: if email_verification_challege field is null, then user has self authorized
  verification_challenge_key_hash text -- NULLABLE
);

drop table if exists password_reset_t;
create table password_reset_t(
  password_reset_key_hash varchar(64) not null primary key,
  creation_time bigint not null,
  creator_user_id bigint not null
);

drop table if exists password_t;
create table password_t(
  password_id bigserial primary key,
  creation_time bigint not null,
  creator_user_id bigint not null,
  password_hash varchar(128) not null,
  password_reset_key_hash varchar(64) -- only valid if change was made by RESET
);

drop table if exists api_key_t;
create table api_key_t(
  api_key_id bigserial primary key,
  creation_time bigint not null,
  creator_user_id bigint not null,
  api_key_hash varchar(64) not null,
  api_key_kind bigint not null, -- VALID, CANCEL
  duration bigint not null -- only valid if api_key_kind == VALID
);
