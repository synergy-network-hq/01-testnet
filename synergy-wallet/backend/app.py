from fastapi import FastAPI
from pydantic import BaseModel
from pqcrypto.sign.dilithium2 import generate_keypair, sign, verify
import base64

app = FastAPI()

class Message(BaseModel):
    private_key: str
    message: str

class VerifyRequest(BaseModel):
    public_key: str
    message: str
    signature: str

@app.get("/")
def root():
    return {"status": "PQC backend is running."}

@app.get("/generate_keypair")
def generate_keypair_route():
    pk, sk = generate_keypair()
    return {
        "public_key": base64.b64encode(pk).decode(),
        "private_key": base64.b64encode(sk).decode(),
    }

@app.post("/sign")
def sign_route(req: Message):
    sk = base64.b64decode(req.private_key)
    signature = sign(req.message.encode(), sk)
    return {"signature": base64.b64encode(signature).decode()}

@app.post("/verify")
def verify_route(req: VerifyRequest):
    pk = base64.b64decode(req.public_key)
    sig = base64.b64decode(req.signature)
    try:
        valid = verify(req.message.encode(), sig, pk)
        return {"valid": valid}
    except Exception:
        return {"valid": False}
