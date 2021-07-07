# Todo App Backend

## Table of Contents

* [Architecture](#architecture)
  * [Overview](#overview)
  * [Technologies](#technologies)
  * [Microservices](#microservices)
* [Data Model](#data-model)
  * [Goal](#goal)
  * [External Event](#external-event)
  * [Time Utility Function](#time-utility-function)
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
