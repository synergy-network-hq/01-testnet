# Use Rust as the base image
FROM rust:latest AS builder

# Set working directory
WORKDIR /app

ENV DATABASE_URL="postgres://postgres:postgres@localhost:5432/synergy_explorer"


# Copy source code
COPY . .

# Build the release binary
RUN cargo build --release

# Use a minimal base image for running the binary
FROM debian:bullseye-slim

# Set working directory
WORKDIR /app

# Copy the compiled binary from the previous stage
COPY --from=builder /app/target/release/backend /app/backend

# Make sure it has execution permissions
RUN chmod +x /app/backend

# Expose port
EXPOSE 8080

# Run the application
CMD ["/app/backend"]
