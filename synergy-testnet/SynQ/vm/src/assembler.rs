use crate::opcode::OpCode;
use crate::vm::Header;

// Assembler for creating bytecode
pub struct Assembler {
    code: Vec<u8>,
    data: Vec<u8>,
}

impl Assembler {
    pub fn new() -> Self {
        Assembler {
            code: Vec::new(),
            data: Vec::new(),
        }
    }

    pub fn emit_op(&mut self, op: OpCode) {
        self.code.push(op as u8);
    }

    pub fn emit_i32(&mut self, value: i32) {
        self.code.extend_from_slice(&value.to_le_bytes());
    }

    pub fn emit_u32(&mut self, value: u32) {
        self.code.extend_from_slice(&value.to_le_bytes());
    }

    pub fn emit_bytes(&mut self, bytes: &[u8]) {
        self.emit_u32(bytes.len() as u32);
        self.code.extend_from_slice(bytes);
    }

    pub fn build(self) -> Vec<u8> {
        let mut bytecode = Vec::new();

        // Header
        bytecode.extend_from_slice(&Header::MAGIC.to_le_bytes());
        bytecode.push(1); // version
        bytecode.extend_from_slice(&15u16.to_le_bytes()); // header length
        bytecode.extend_from_slice(&(self.code.len() as u32).to_le_bytes());
        bytecode.extend_from_slice(&(self.data.len() as u32).to_le_bytes());

        // Code and data
        bytecode.extend_from_slice(&self.code);
        bytecode.extend_from_slice(&self.data);

        bytecode
    }
}
