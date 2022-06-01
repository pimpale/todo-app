#!/bin/sh
exec ./aarch64/todo-app-service \
  --port=18080 \
  --database-url=postgres://postgres:toor@localhost/todo_app \
  --site-external-url=http://todoapp.innexgo.com \
  --auth-service-url=http://localhost:8079
