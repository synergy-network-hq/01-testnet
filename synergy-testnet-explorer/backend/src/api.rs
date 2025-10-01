use actix_web::{get, web, App, HttpResponse, HttpServer, Responder};
use diesel::prelude::*;
use crate::db::establish_connection;
use crate::models::{Block, Transaction};
use crate::schema::{blocks::dsl::*, transactions::dsl::*};

#[get("/api/blocks")]
async fn get_blocks() -> impl Responder {
    let conn = &mut establish_connection();
    match blocks
        .order(number.desc())
        .limit(10)
        .load::<Block>(conn)
    {
        Ok(result) => HttpResponse::Ok().json(result),
        Err(_) => HttpResponse::InternalServerError().body("Failed to fetch blocks"),
    }
}

#[get("/api/transactions")]
async fn get_transactions() -> impl Responder {
    let conn = &mut establish_connection();
    match transactions
        .order(id.desc())
        .limit(10)
        .load::<Transaction>(conn)
    {
        Ok(result) => HttpResponse::Ok().json(result),
        Err(_) => HttpResponse::InternalServerError().body("Failed to fetch transactions"),
    }
}

pub fn app_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(get_blocks);
    cfg.service(get_transactions);
}
