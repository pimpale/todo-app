
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

drop table if exists goal;
create table goal(
  goal_id integer not null primary key,
  creation_time integer not null,
  creator_user_id integer not null
);

drop table if exists time_utility_function;
create table time_utility_function(
  time_utility_function_id integer not null primary key,
  creation_time integer not null,
  creator_user_id integer not null
);

-- invariant: There must be at least two distribution points per time_utility_function (one at 0, and other at INT_MAX)
drop table if exists time_utility_function_point;
create table time_utility_function_point(
  time_utility_function_point_id integer not null primary key,
  creation_time integer not null,
  creator_user_id integer not null,
  time_utility_function_id integer not null,
  start_time integer not null,
  utils integer not null
);

-- invariant: goal_id is valid
drop table if exists goal_data;
create table goal_data(
  goal_data_id integer not null primary key,
  creation_time integer not null,
  creator_user_id integer not null,
  goal_id integer not null,
  name varchar(100) not null,
  description varchar(100) not null,
  duration integer not null,
  time_utility_function_id integer not null,
  wrapper integer not null, -- boolean
  status integer not null -- SUCCEED FAIL CANCEL UNRESOLVED
);

-- invariant: goal_id != dependent_goal_id
-- invariant: goal_id is valid
-- invariant: dependent_goal_id is valid
drop table if exists goal_dependency;
create table goal_description(
  goal_dependency_id integer not null primary key,
  creation_time integer not null,
  creator_user_id integer not null,
  goal_id integer not null,
  dependent_goal_id integer not null
);

-- invariant: goal_id is valid
drop table if exists task;
create table task(
  task_id integer not null primary key,
  creation_time integer not null,
  creator_user_id integer not null,
  goal_id integer not null,
  start_time integer not null,
);

drop table if exists past_event;
create table past_event(
  event_id integer not null primary key,
  creation_time integer not null,
  creator_user_id integer not null
);

drop table if exists past_event_data;
create table event_data(
  event_data_id integer not null,
  creation_time integer not null,
  creator_user_id integer not null,
  event_id integer not null,
  has_task_id integer not null, -- boolean
  start_time integer not null,
  duration integer not null,
  name varchar(100) not null,
  description varchar(100) not null,
  active integer not null -- boolean
);
