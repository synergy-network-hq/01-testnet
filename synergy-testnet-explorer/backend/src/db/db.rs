use sqlx::{SqlitePool, Error};

pub async fn init_db(pool: &SqlitePool) -> Result<(), Error> {
    sqlx::query!(
        "CREATE TABLE IF NOT EXISTS blocks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            hash TEXT NOT NULL,
            previous_hash TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )"
    )
    .execute(pool)
    .await?;

    Ok(())
}
