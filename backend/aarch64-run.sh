#!/bin/sh
exec ./aarch64/todo-app-service \
  --port=10080 \
  --database-url=postgres://postgres:toor@localhost/todo_app \
  --site-external-url=http://todoapp.eaucla.org \
  --auth-service-url=http://localhost:10079
