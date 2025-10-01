use actix_cors::Cors;
use actix_web::{web, App, HttpServer, middleware::Logger};
use sqlx::SqlitePool;
use std::env;
mod models;
mod routes;
mod db;
mod handlers;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv::dotenv().ok();

    let database_url = env::var("DATABASE_URL").unwrap_or_else(|_| "/tmp/synergy/explorer.db".to_string());
    let db_pool = SqlitePool::connect(&database_url)
        .await
        .expect("Failed to connect to database");

    println!("🚀 Synergy Explorer API is running...");

    HttpServer::new(move || {
        App::new()
            .wrap(
                Cors::default()
                    .allowed_origin("http://localhost:3000")
                    .allowed_methods(vec!["GET", "POST", "PUT", "DELETE"])
                    .allowed_headers(&[actix_web::http::header::CONTENT_TYPE])
                    .max_age(3600),
            )
            .wrap(Logger::default())
            .app_data(web::Data::new(db_pool.clone()))
            .configure(routes::configure) // ✅ Register routes properly
    })
    .bind("0.0.0.0:8080")?
    .run()
    .await
}
