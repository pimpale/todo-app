# Todo App Backend

## Table of Contents

* [Architecture](#architecture)
  * [Overview](#overview)
  * [Technologies](#technologies)
  * [Microservices](#microservices)
* [Data Model](#data-model)
* [Building And Deploying](#building-and-deploying)
  * [With Docker](#with-docker)
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

## Data Model

In this section, we'll describe how the data is laid out in SQL and what the semantic purpose of each field is.

* **Resource**: Material the user can use in order to accomplish a goal.
    Resource utilization is exclusive.
    If a resource is executing a task, it cannot execute another task at the same time.
    The primary resource available to the user is their time. 
    todo-app can also schedule goals on other resources, such as equipment,  and other people.

* **Goal**: A valuable goal to be accomplished.
    Goals are per user, not per resource by definition.
    However, different resources have may have differing goal affinities.
    This permits goals to be scheduled to other resources.
    Goals may depend on other goals.
    If a goal has multiple milestones, it is advantageous to make achieving each milestone a sub goal.
    Each subsequent milestone will have a dependency on the first.

    Goals must be converted into tasks, fixed time things on a user's calendar.
    The process of converting goals to tasks is called task allocation.


* **Goal Result**: The outcome of a goal.
    A Goal Result determines if other goals depending on this goal can be scheduled.
    When a goal is completed, it may have a favorable outcome (which awards utils to the user), 
    or an unfavorable outcome (which subtracts utils from the user).

* **Tasks**: Something the user can do with a resource.
    A task is an instantiation of a goal at a time on a calendar.
    Goals don't have a fixed time by definition, only a a time-utility distribution.
    If a goal's execution is preempted, then there may be multiple tasks for one goal.
    If a goal is dropped, then there may be zero tasks for that goal.

* **Solution**: A group of tasks that satisfy all goal constraints.
    There are many ways to allocate tasks to goals.
    The primary rules are:
    * No dependency cycles
    * Dependency order must be respected.
    * All tasks are scheduled for the future.
    However, not all solutions that obey these rules are optimal.
    It is a client side task to find the best solution and send it to the server.

* **Event**: Events are primarily there for compatibility when importing other programs' data. 
    They don't carry any metadata, just a name, time and description.
    Events can be generated from tasks, once they disappear into the past.
    However, events are not necessarily linked to goals.


