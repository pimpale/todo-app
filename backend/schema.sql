-- Table Structure
-- Primary Key
-- Creation Time
-- Creator User Id (if applicable)
-- Everything else

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
  duration_estimate integer not null,
  time_utility_function_id integer not null,
  scheduled integer not null, -- boolean
  -- ONLY VALID WHEN scheduled is true
  start_time integer not null,
  duration integer not null,
  status integer not null -- PENDING SUCCEED FAIL CANCEL
);

-- invariant: goal_id != dependent_goal_id
-- invariant: goal_id is valid
-- invariant: dependent_goal_id is valid
drop table if exists goal_dependency;
create table goal_dependency(
  goal_dependency_id integer not null primary key,
  creation_time integer not null,
  creator_user_id integer not null,
  goal_id integer not null,
  dependent_goal_id integer not null
);

drop table if exists past_event;
create table past_event(
  past_event_id integer not null primary key,
  creation_time integer not null,
  creator_user_id integer not null
);

drop table if exists past_event_data;
create table past_event_data(
  past_event_data_id integer not null,
  creation_time integer not null,
  creator_user_id integer not null,
  past_event_id integer not null,
  name varchar(100) not null,
  description varchar(100) not null,
  start_time integer not null,
  duration integer not null,
  active integer not null -- boolean
);
