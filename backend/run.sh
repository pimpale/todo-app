#!/bin/bash

./target/debug/todo-app-service \
  --port=8080 \
  --database-url=postgres://postgres:toor@localhost/todo_app \
  --site-external-url=http://localhost:3000 \
  --auth-service-url=http://localhost:8079
