use std::io::Write;
use std::net::TcpStream;
use crate::transaction::Transaction;

pub fn broadcast_transaction() {
    let tx = Transaction::new(
        "sYnQ1zxy8qhj4j59xp5lwkwpd5qws9aygz8pl9m3kmjx3".to_string(),
        "sYnQ1wlt52dlk9scmzphw7uc8p72v28j47yd8g0drmtc".to_string(),
        1000,
        1, // nonce
        "demo-signature-placeholder".to_string(), // dummy signature for now
        1, // gas_price
        21000, // gas_limit
        None, // data
    );

    let tx_data = tx.to_json();

    println!("\n📡 Broadcasting transaction:\n{}", tx_data);

    match TcpStream::connect("192.168.1.68:8545") {
        Ok(mut stream) => {
            if let Err(e) = stream.write_all(tx_data.as_bytes()) {
                eprintln!("❌ Failed to send transaction: {}", e);
            } else {
                println!("✅ Transaction sent successfully");
            }
        }
        Err(e) => {
            eprintln!("❌ Connection failed: {}", e);
        }
    }
}
