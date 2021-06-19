CREATE DATABASE todo_app;
\c todo_app

-- Table Structure
-- Primary Key
-- Creation Time
-- Creator User Id (if applicable)
-- Everything else

drop table if exists goal_intent;
create table goal_intent(
  goal_intent_id bigserial primary key,
  creation_time bigint not null,
  creator_user_id bigint not null
);

drop table if exists goal_intent_data;
create table goal_intent_data(
  goal_intent_data_id bigserial primary key,
  creation_time bigint not null,
  creator_user_id bigint not null,
  name text not null
);

drop table if exists goal;
create table goal(
  goal_id bigserial primary key,
  creation_time bigint not null,
  creator_user_id bigint not null,
  goal_intent bigint -- NULLABLE
);

drop table if exists time_utility_function;
create table time_utility_function(
  time_utility_function_id bigserial primary key,
  creation_time bigint not null,
  creator_user_id bigint not null
  -- invariant: There must be at least one number in start_times
  -- invariant: There must be the same number of elements in start_times and utils
  start_times bigint[] not null,
  utils bigint[] not null
);

-- invariant: goal_id is valid
drop table if exists goal_data;
create table goal_data(
  goal_data_id bigserial primary key,
  creation_time bigint not null,
  creator_user_id bigint not null,
  goal_id bigint not null,
  name text not null,
  duration_estimate bigint not null,
  time_utility_function_id bigint not null,
  parent_goal_id bigint not null, -- NULLABLE
  status bigint not null -- enum
);

drop table if exists task_event;
create table task_event(
  task_event_id bigserial primary key,
  creation_time bigint not null,
  creator_user_id bigint not null,
  goal_id bigint not null,
  start_time bigint not null,
  duration bigint not null,
  active bigint not null -- boolean
);
