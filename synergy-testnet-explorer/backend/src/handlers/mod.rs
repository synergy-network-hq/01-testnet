use actix_web::{get, web, HttpResponse, Responder};
use sqlx::SqlitePool;
use sqlx::FromRow;
use time::PrimitiveDateTime;
use serde::Serialize;

#[derive(Debug, Serialize, FromRow)]
pub struct Block {
    pub id: i32,
    pub block_index: Option<i64>,
    pub hash: Option<String>,
    pub previous_hash: Option<String>,
    pub validator_id: Option<String>,
    pub nonce: Option<i64>,
    pub timestamp: Option<PrimitiveDateTime>,
}

#[derive(Debug, Serialize, FromRow)]
pub struct Transaction {
    pub id: i32,
    pub block_index: Option<i64>,
    pub sender: Option<String>,
    pub receiver: Option<String>,
    pub amount: Option<i64>,
    pub nonce: Option<i64>,
    pub signature: Option<String>,
    pub timestamp: Option<PrimitiveDateTime>,
}

#[get("/blocks")]
pub async fn get_blocks(db_pool: web::Data<SqlitePool>) -> impl Responder {
    let result = sqlx::query_as::<_, Block>(
        r#"
        SELECT id, block_index, hash, previous_hash, validator_id, nonce, timestamp
        FROM blocks
        ORDER BY block_index DESC
        LIMIT 20
        "#
    )
    .fetch_all(db_pool.get_ref())
    .await;

    match result {
        Ok(blocks) => HttpResponse::Ok().json(blocks),
        Err(e) => {
            eprintln!("❌ get_blocks DB error: {:?}", e);
            HttpResponse::InternalServerError().body("Failed to load blocks")
        }
    }
}

#[get("/transactions")]
pub async fn get_transactions(db_pool: web::Data<SqlitePool>) -> impl Responder {
    let result = sqlx::query_as::<_, Transaction>(
        r#"
        SELECT id, block_index, sender, receiver, amount, nonce, signature, timestamp
        FROM transactions
        ORDER BY timestamp DESC
        LIMIT 20
        "#
    )
    .fetch_all(db_pool.get_ref())
    .await;

    match result {
        Ok(txs) => HttpResponse::Ok().json(txs),
        Err(e) => {
            eprintln!("❌ get_transactions DB error: {:?}", e);
            HttpResponse::InternalServerError().body("Failed to fetch transactions")
        }
    }
}

#[allow(dead_code)]
pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(get_blocks).service(get_transactions);
}
