# this dockerfile makes use of multi-stage builds:
# https://docs.docker.com/develop/develop-images/multistage-build/

# We use https://github.com/emk/rust-musl-builder
# to set the environment to build our binary
FROM ekidd/rust-musl-builder:nightly-2021-02-13 as builder

# copy source code to builder (give ownership to rust user on builder)
COPY --chown=rust:rust . .
# cargo install to the cargo cache
RUN cargo install --path .

# we use alpine to actually run it
FROM alpine
# copy the executable from where cargo installed it in builder to the root of alpine
COPY --from=builder /home/rust/.cargo/bin/todo-app-service "/bin/todo-app-service"

# this is how it actually gets run
# in kubernetes: you should probably provide some arguments though
CMD ["/bin/todo-app-service"]
