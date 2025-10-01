
+26
-0

import base64
from pqcrypto.sign import dilithium3

def py_generate_keypair():
    pk, sk = dilithium3.generate_keypair()
    return {"publicKey": pk.tobytes() if hasattr(pk, 'tobytes') else pk,
            "privateKey": sk.tobytes() if hasattr(sk, 'tobytes') else sk}

def py_sign_message(private_key, message):
    if isinstance(private_key, (bytes, bytearray)):
        sk = private_key
    else:
        sk = bytes(private_key, 'utf-8') if isinstance(private_key, str) else bytes(private_key)
    msg = message if isinstance(message, bytes) else bytes(message, 'utf-8')
    sig = dilithium3.sign(msg, sk)
    return sig

def py_verify_signature(public_key, message, signature):
    pk = public_key if isinstance(public_key, bytes) else bytes(public_key)
    msg = message if isinstance(message, bytes) else bytes(message, 'utf-8')
    sig = signature if isinstance(signature, bytes) else bytes(signature)
    try:
        dilithium3.verify(msg, sig, pk)
        return True
    except Exception:
        return False
