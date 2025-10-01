use actix_web::{get, web, HttpResponse, Responder};
use sqlx::SqlitePool;
use crate::models::{Block, Transaction};

#[get("/blocks")]
async fn get_blocks(db_pool: web::Data<SqlitePool>) -> impl Responder {
    match sqlx::query_as::<_, Block>("SELECT * FROM blocks ORDER BY block_index DESC LIMIT 20")
        .fetch_all(db_pool.get_ref())
        .await
    {
        Ok(blocks) => HttpResponse::Ok().json(blocks),
        Err(e) => {
            eprintln!("❌ Failed to fetch blocks: {}", e);
            HttpResponse::InternalServerError().body("Failed to load blocks")
        }
    }
}

#[get("/transactions")]
async fn get_transactions(db_pool: web::Data<SqlitePool>) -> impl Responder {
    match sqlx::query_as::<_, Transaction>(
        "SELECT * FROM transactions ORDER BY timestamp DESC LIMIT 20"
    )
    .fetch_all(db_pool.get_ref())
    .await
    {
        Ok(txs) => HttpResponse::Ok().json(txs),
        Err(e) => {
            eprintln!("❌ Failed to fetch transactions: {}", e);
            HttpResponse::InternalServerError().body("Failed to load transactions")
        }
    }
}

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(get_blocks)
       .service(get_transactions);
}
