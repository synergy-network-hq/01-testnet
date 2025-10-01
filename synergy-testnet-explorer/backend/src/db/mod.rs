use sqlx::SqlitePool;
use std::env;

/// Initializes and returns a database connection pool
#[allow(dead_code)]
pub async fn connect() -> SqlitePool {
    let database_url = env::var("DATABASE_URL").unwrap_or_else(|_| "/tmp/synergy/explorer.db".to_string());
    SqlitePool::connect(&database_url)
        .await
        .expect("Failed to connect to database")
}
