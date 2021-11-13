# Todo App Backend

## Table of Contents

* [Architecture](#architecture)
  * [Overview](#overview)
  * [Technologies](#technologies)
  * [Microservices](#microservices)
* [Data Model](#data-model)
* [Building And Deploying](#building-and-deploying)
  * [With Docker Compose](#with-docker-compose)
  * [Uncontainerized](#uncontainerized)

## Architecture

This section aims to describe at a high level how the backend works and what its purpose is.

### Overview

The backend of todo-app is designed to be simple and lightweight. 
Its only responsibility is to persist data between user sessions and devices.

Requests are made to the backend using POST requests with a JSON body.
The backend then returns a JSON string containing either an error or the persisted data.

You can try using `curl` to test the backend:

```sh
# this example shows how to get a new API key
curl --header "Content-Type: application/json" \
     --request POST \
     --data '{"userEmail": "alpha@example.com", "userPassword": "Boolean500", "duration": 500000000 }' \
     http://localhost:8080/public/api_key/new_valid

```

### Technologies

This service is written in Rust, and uses PostgreSQL as its database provider.

The most important libraries that play a role in our stack are:
* [warp]( https://github.com/seanmonstar/warp )
* [tokio-postgres]( https://docs.rs/tokio-postgres/0.7.2/tokio_postgres/ )

### Microservices

The todo-app backend utilizes Innexgo's [auth-service]( https://github.com/innexgo/auth-service ) to create, manage and authenticate user accounts.
This reduces the duplicated functionality between products (and therefore lowers the chance of bugs). 
In addition, handling user data on a seperate server from other data also makes it easier to support OAuth, if we decide to do so later.

However, there are some downsides:
* We can't join on other user data (such as name) in our queries, only user id.
* Retrieving user data is an expensive operation.

In order to interface with the auth-service, we use the rust client library for auth-service:
* https://github.com/innexgo/auth-service-api

You can read more documentation about the auth service here:
* https://github.com/innexgo/auth-service-api

## API Endpoints

* `public/goal_data/new`
  * Creates a new version of the mutible data related to a goal after validating proper inputs
* `public/goal_entity_tag/new`
  * Creates a new goal entity tag after validating proper inputs
  * This goal entity tag links a goal to a named entity, allowing it to be configued according to the data from other goals related to the same named entity
* `public/goal_template/new`
  * Creates a new goal template after validating proper inputs
  * This goal template provides a framework for how to complete certain long term goals such as losing weight
  * These can be user or admin created
* `public/goal_template_pattern/new`
  * Creates a new pattern that can activate a template after validating proper inputs
  * For example, the pattern "CS31 project" can activate the template for completing a CS31 project
* `public/named_entity_data/new`
  * Creates a new version of the mutible data related to a named entity after validating proper inputs
* `public/user_generated_code/new`
  * 
* `public/external_event/new`
  * Creates an external event after validating proper inputs
  * External events tend to come from integrating with other services such as Google calender
* `public/goal/view`
  * Lets the user view a snapshot of their goals after validating proper inputs
* `public/external_event/view`
  * Lets the user view a snapshot of their external events after validating proper inputs
* `public/goal_entity_tag/view`
  * Lets the user view a snapshot of their goal entity tags after validating proper inputs
* `public/named_entity/view`
  * Lets the user view a snapshot of their named entities after validating proper inputs
* `public/named_entity_pattern/view`
  * Lets the user view a snapshot of their named entity patterns after validating proper inputs
* `public/goal_template_data/view`
  * Lets the user view a snapshot of the latest version of the data related to the user's goal templates after validating proper inputs
* `public/external_event_data/view`
  * Lets the user view a snapshot of the latest version of the data related to the user's external events after validating proper inputs
* `public/user_generated_code/view`
  * Lets the user view a snapshot of IDK after validating proper inputs

## Data Model

In this section, we'll describe how the data is laid out in SQL and what the semantic purpose of each column is.

Our entire data model is designed to be append only: no updates or deletes.
However, we still need to represent mutable data, and to do this we use extra tables.

The immutable properties of a given resource are stored in the "core table", which has no suffix.
We store mutable properties of that resource in another "data table" with the suffix `_data`.
Instead of using an `UPDATE` statement, we insert an row into the data table.
Later, when we fetch from our core table, we can join the most recently inserted rows of the data table for any given row on the core table.

In order to handle deletes, our convention is to have a column on the "data table" of an object to signal that the object is inactive.

Since inserts are typically faster than updates and deletes, this approach is actually more performant than the alternative.
It also has the benefit that we can undo changes in a simple way, and that we maintain consistency in the db.

#### Example

Here's how GoalIntent is laid out in SQL:
```sql
create table goal_intent(
  goal_intent_id bigserial primary key,
  creation_time bigint not null,
  creator_user_id bigint not null
);

create table goal_intent_data(
  goal_intent_data_id bigserial primary key,
  creation_time bigint not null,
  creator_user_id bigint not null,
  goal_intent_id bigint not null,
  name text not null,
  active bool not null
);
```

Let's inspect the columns one by one:
* `goal_intent`: The "core table" storing immutable properties.
  * `goal_intent_id`: The ID of the goal intent itself.
  * `creation_time`: When the goal was first created. 
    * Unix timestamp
      * What you get from `Date.now()` or `System.currentTimeMillis()`.
  * `creator_user_id`: owner of the object. 
    * In our current permission model, you can only access objects which you have created.
    * So far, we don't allow transfering ownership of an object or sharing objects.
* `goal_intent_data`: The "data table" storing mutable properties.
  * `goal_intent_data_id`: The ID of the goal intent data.
    * Note that there may be more than one goal intent data for each goal intent.
  * `creation_time`: When goal intent data was created.
    * Effectively represents the time it was edited.
  * `creator_user_id`: Who created this goal intent data.
    * Should be the same as who created the goal intent.
  * `goal_intent_id`: The id of the goal intent this is for. 
  * `name`: The name of the goal intent.
  * `active`: This field tells us whether the goal intent should be counted as deleted.

To retrieve only recent data from this table, we would use:
```sql
SELECT gid.* FROM goal_intent_data gid
INNER JOIN (
  SELECT max(goal_intent_data_id) id 
  FROM goal_intent_data 
  GROUP BY goal_intent_id
) maxids 
ON maxids.id = gid.goal_intent_data_id
```

This approach creates a subquery containing only the maximum goal_intent_data_id for any given goal_intent_id.
We then inner join this table, thus selecting only the most recent rows.

## Building and Deploying

There are two ways to build and deploy the backend. The one you should choose depends on your use case.
If you are a frontend developer or end user, I recommend the docker-compose approach since it requires less configuration.
If you are a backend developer, or someone who wants to make changes to the backend frequently, I recommend building and deploying directly, since building on docker takes a lot more time and disk space.

### With Docker Compose

* **Warning**: Outdated
  * Install git
  * Install docker
  * Install docker-compose
  * `git clone https://github.com/pimpale/todo-app`
  * `cd todo-app/backend`
  * `docker-compose build`
  * `docker-compose up`

### Uncontainerized

#### Build
* Install git
* Install rustup & cargo
  * https://www.rust-lang.org/tools/install
* Add nightly rust
  * Run: `rustup toolchain install nightly`
  * Run: `rustup default nightly`
* Default to nightly rust
* Git clone the todo-app repository
  * Run: `git clone https://github.com/pimpale/todo-app`
* Build
  * `cd backend`
  * `cargo build`

* Install mail-service
  * Run: `git clone https://github.com/innexgo/mail-service`
  * Run: `cd mail-service`
  * Run: `cargo build`
* Install auth-service
  * Run: `git clone https://github.com/innexgo/auth-service`
  * Run: `cd auth-service`
  * Run: `cargo build`

* Install Postgres:
  * https://www.postgresql.org/download/

#### Initialization: Do this the first time, and every time database upgrades

* Initialize Mail
  * `cd mail-service/sql`
  * `psql -f 1-mail-schema.sql`
* Initialize Auth
  * `cd auth-service/sql`
  * `psql -f 1-auth-schema.sql`
  * `psql -f 2-mock-data.sql`
* Initialize TodoApp
  * `cd todo-app/backend/sql`
  * `psql -f 1-todo-app-schema.sql`

#### Run

* Start Mail
  * `cd mail-service`
  * `./run.sh`
* Start Auth
  * `cd auth-service`
  * `./run.sh`
* Start TodoApp
  * `cd todo-app/backend`
  * `./run.sh`

