# We use glibc rust for dev purposes
# to set the environment to build our binary

# see these resources for an explanation:
# https://www.lpalmieri.com/posts/fast-rust-docker-builds/
# https://github.com/LukeMathWalker/cargo-chef

FROM rustlang/rust:nightly as planner
WORKDIR app
# We only pay the installation cost once, 
# it will be cached from the second build onwards
# To ensure a reproducible build consider pinning 
# the cargo-chef version with `--version X.X.X`
RUN cargo install cargo-chef 
COPY . .
RUN cargo chef prepare  --recipe-path recipe.json

FROM rustlang/rust:nightly as cacher
WORKDIR app
RUN cargo install cargo-chef
COPY --from=planner /app/recipe.json recipe.json
RUN cargo chef cook --recipe-path recipe.json

FROM rustlang/rust:nightly as builder
WORKDIR app
COPY . .
# Copy over the cached dependencies
COPY --from=cacher /app/target target
COPY --from=cacher /usr/local/cargo /usr/local/cargo
RUN cargo build

FROM rustlang/rust:nightly as runtime
WORKDIR app
COPY --from=builder /app/target/debug/todo-app-service /bin/todo-app-service
CMD ["/bin/todo-app-service"]
