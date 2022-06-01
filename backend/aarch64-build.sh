#!/bin/sh
mkdir -p aarch64
cross build --release --target aarch64-unknown-linux-gnu && cp ./target/aarch64-unknown-linux-gnu/release/todo-app-service ./aarch64/todo-app-service
