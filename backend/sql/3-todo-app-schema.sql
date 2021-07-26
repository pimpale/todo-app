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
  goal_intent_id bigint not null,
  name text not null,
  active bool not null
);

drop table if exists goal;
create table goal(
  goal_id bigserial primary key,
  creation_time bigint not null,
  creator_user_id bigint not null,
  goal_intent_id bigint -- NULLABLE
);

drop table if exists time_utility_function;
create table time_utility_function(
  time_utility_function_id bigserial primary key,
  creation_time bigint not null,
  creator_user_id bigint not null,
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
  parent_goal_id bigint, -- NULLABLE
  status bigint not null -- enum
);

drop table if exists goal_event;
create table goal_event(
  goal_event_id bigserial primary key,
  creation_time bigint not null,
  creator_user_id bigint not null,
  goal_id bigint not null,
  start_time bigint not null,
  end_time bigint not null,
  active bool not null
);

-- Maybe compiled functions
drop table if exists user_generated_code;
create table user_generated_code(
  user_generated_code_id bigserial primary key,
  creation_time bigint not null,
  creator_user_id bigint not null,
  source_code text not null,
  source_lang text not null,
  wasm_cache text not null
);


-- how words trigger goal generation:
-- when we see a pattern, we invoke the 
drop table if exists goal_template;
create table goal_template(
  goal_template_id bigserial primary key,
  creation_time bigint not null,
  creator_user_id bigint not null
);

drop table if exists goal_template_data;
create table goal_template_data(
  goal_template_data_id bigserial primary key,
  creation_time bigint not null,
  creator_user_id bigint not null,
  name text not null,
  -- this function is passed in an array of entities, and returns a goal_data
  user_generated_code_id bigint not null,
  active bool not null
);

drop table if exists goal_template_pattern;
create table goal_template_pattern(
  goal_template_pattern_id bigserial primary key,
  creation_time bigint not null,
  creator_user_id bigint not null,
  goal_template_id bigint not null,
  pattern text not null,
  active bool not null
);

-- a named entity is basically a tag, we use it for searching for objects
drop table if exists named_entity; 
create table named_entity(
  named_entity_id bigserial primary key,
  creation_time bigint not null,
  creator_user_id bigint not null
);

drop table if exists named_entity_data;
create table named_entity_data(
  named_entity_data_id 
  creation_time bigint not null,
  creator_user_id bigint not null,
  named_entity_id bigint not null,
  name text not null, -- must be unique wrt to user
  kind bigint not null,
  active bool not null
);

-- different names to call entities
drop table if exists named_entity_pattern;
create table named_entity_pattern(
  named_entity_pattern_id bigserial primary key,
  creation_time bigint not null,
  creator_user_id bigint not null,
  named_entity_id bigint not null,
  pattern text not null,
  active bool not null
);

drop table if exists external_event;
create table external_event(
  extenal_event_id bigserial primary key,
  creation_time bigint not null,
  creator_user_id bigint not null
);

drop table if exists external_event_data;
create table external_event_data(
  external_event_data_id bigserial primary key,
  creation_time bigint not null,
  creator_user_id bigint not null,
  external_event_id bigint not null,
  name text not null,
  start_time bigint not null,
  end_time bigint not null,
  active bool not null
);
