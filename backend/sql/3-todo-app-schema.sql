CREATE DATABASE todo_app;
\c todo_app

-- Table Structure
-- Primary Key
-- Creation Time
-- Creator User Id (if applicable)
-- Everything else

drop table if exists goal_intent cascade;
create table goal_intent(
  goal_intent_id bigserial primary key,
  creation_time bigint not null,
  creator_user_id bigint not null
);

drop table if exists goal_intent_data cascade;
create table goal_intent_data(
  goal_intent_data_id bigserial primary key,
  creation_time bigint not null,
  creator_user_id bigint not null,
  goal_intent_id bigint not null references goal_intent(goal_intent_id),
  name text not null,
  active bool not null
);

create view recent_goal_intent_data as
  select gid.* from goal_intent_data gid
  inner join (
   select max(goal_intent_data_id) id 
   from goal_intent_data 
   group by goal_intent_id
  ) maxids
  on maxids.id = gid.goal_intent_data_id;

drop table if exists goal cascade;
create table goal(
  goal_id bigserial primary key,
  creation_time bigint not null,
  creator_user_id bigint not null,
  goal_intent_id bigint references goal_intent(goal_intent_id)
);

drop table if exists time_utility_function cascade;
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
drop table if exists goal_data cascade;
create table goal_data(
  goal_data_id bigserial primary key,
  creation_time bigint not null,
  creator_user_id bigint not null,
  goal_id bigint not null references goal(goal_id),
  name text not null,
  duration_estimate bigint not null,
  time_utility_function_id bigint not null,
  abstract bool not null, -- whether the goal can't be sensibly turned into an event
  status bigint not null -- enum
);

create view recent_goal_data as
  select gd.* from goal_data gd
  inner join (
   select max(goal_data_id) id 
   from goal_data 
   group by goal_id
  ) maxids
  on maxids.id = gd.goal_data_id;

drop table if exists goal_event cascade;
create table goal_event(
  goal_event_id bigserial primary key,
  creation_time bigint not null,
  creator_user_id bigint not null,
  goal_id bigint not null references goal(goal_id),
  start_time bigint not null,
  end_time bigint not null,
  active bool not null
);

create view recent_goal_event as
  select ge.* from goal_event ge
  inner join (
   select max(goal_event_id) id 
   from goal_event 
   group by goal_id
  ) maxids
  on maxids.id = ge.goal_event_id;

-- represents a goal that must have status SUCCESS 
drop table if exists goal_dependency cascade;
create table goal_dependency(
  goal_dependency_id bigserial primary key,
  creation_time bigint not null,
  creator_user_id bigint not null,
  goal_id bigint not null references goal(goal_id),
  dependent_goal_id bigint not null references goal(goal_id), -- the goal waits for this goal to resolve before marking is allowed
  cascade_success bool not null, -- whether a success marks dependent goals as successes
  cascade_failure bool not null, -- whether a failure marks dependent goals as failures
  active bool not null
);

create view recent_goal_dependency as
  select ge.* from goal_dependency ge
  inner join (
   select max(goal_dependency_id) id 
   from goal_dependency 
   group by goal_id, dependent_goal_id
  ) maxids
  on maxids.id = ge.goal_dependency_id;


-- Maybe compiled functions
drop table if exists user_generated_code cascade;
create table user_generated_code(
  user_generated_code_id bigserial primary key,
  creation_time bigint not null,
  creator_user_id bigint not null,
  source_code text not null,
  source_lang text not null,
  wasm_cache bytea not null
);


-- how words trigger goal generation:
-- when we see a pattern, we invoke the 
drop table if exists goal_template cascade;
create table goal_template(
  goal_template_id bigserial primary key,
  creation_time bigint not null,
  creator_user_id bigint not null
);

drop table if exists goal_template_data cascade;
create table goal_template_data(
  goal_template_data_id bigserial primary key,
  creation_time bigint not null,
  creator_user_id bigint not null,
  goal_template_id bigint not null references goal_template(goal_template_id),
  name text not null,
  -- this function is run when a goal is templated
  user_generated_code_id bigint not null references user_generated_code(user_generated_code_id),
  duration_estimate bigint not null,
  active bool not null
);

create view recent_goal_template_data as
  select gtd.* from goal_template_data gtd
  inner join (
   select max(goal_template_data_id) id 
   from goal_template_data 
   group by goal_template_id
  ) maxids
  on maxids.id = gtd.goal_template_data_id;

drop table if exists goal_template_pattern cascade;
create table goal_template_pattern(
  goal_template_pattern_id bigserial primary key,
  creation_time bigint not null,
  creator_user_id bigint not null,
  goal_template_id bigint not null references goal_template(goal_template_id),
  pattern text not null,
  active bool not null
);

create view recent_goal_template_pattern as
  select gtp.* from goal_template_pattern gtp
  inner join (
   select max(goal_template_pattern_id) id 
   from goal_template_pattern 
   group by goal_template_id, pattern
  ) maxids
  on maxids.id = gtp.goal_template_pattern_id;

-- a named entity is basically a tag, we use it for searching for objects
drop table if exists named_entity cascade;  
create table named_entity(
  named_entity_id bigserial primary key,
  creation_time bigint not null,
  creator_user_id bigint not null
);

drop table if exists named_entity_data cascade;
create table named_entity_data(
  named_entity_data_id bigserial primary key,
  creation_time bigint not null,
  creator_user_id bigint not null,
  named_entity_id bigint not null references named_entity(named_entity_id),
  name text not null, -- must be unique wrt to user
  kind bigint not null,
  active bool not null
);

create view recent_named_entity_data as
  select ned.* from named_entity_data ned
  inner join (
   select max(named_entity_data_id) id 
   from named_entity_data 
   group by named_entity_id
  ) maxids
  on maxids.id = ned.named_entity_data_id;

-- different names to call entities
drop table if exists named_entity_pattern cascade;
create table named_entity_pattern(
  named_entity_pattern_id bigserial primary key,
  creation_time bigint not null,
  creator_user_id bigint not null,
  named_entity_id bigint not null references named_entity(named_entity_id),
  pattern text not null,
  active bool not null
);

create view recent_named_entity_pattern as
  select nep.* from named_entity_pattern nep
  inner join (
   select max(named_entity_pattern_id) id 
   from named_entity_pattern 
   group by named_entity_id, pattern
  ) maxids
  on maxids.id = nep.named_entity_pattern_id;

-- joining named entity to goal
drop table if exists goal_entity_tag cascade;
create table goal_entity_tag(
  goal_entity_tag_id bigserial primary key,
  creation_time bigint not null,
  creator_user_id bigint not null,
  named_entity_id bigint not null references named_entity(named_entity_id),
  goal_id bigint not null references goal(goal_id),
  active bool not null
);

create view recent_goal_entity_tag as
  select get.* from goal_entity_tag get
  inner join (
   select max(goal_entity_tag_id) id 
   from goal_entity_tag 
   group by goal_entity_id, named_entity_id
  ) maxids
  on maxids.id = get.goal_entity_tag_id;


drop table if exists external_event cascade;
create table external_event(
  external_event_id bigserial primary key,
  creation_time bigint not null,
  creator_user_id bigint not null
);

drop table if exists external_event_data cascade;
create table external_event_data(
  external_event_data_id bigserial primary key,
  creation_time bigint not null,
  creator_user_id bigint not null,
  external_event_id bigint not null references external_event(external_event_id),
  name text not null,
  start_time bigint not null,
  end_time bigint not null,
  active bool not null
);

create view recent_external_event_data as
  select eed.* from external_event_data eed
  inner join (
   select max(external_event_data_id) id 
   from external_event_data 
   group by external_event_id
  ) maxids
  on maxids.id = eed.external_event_data_id;

