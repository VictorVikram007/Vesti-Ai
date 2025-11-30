from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import os
import base64
import json

class EncryptionService:
    def __init__(self):
        # In production, retrieve from secure key management service
        self.master_key = os.getenv("ENCRYPTION_MASTER_KEY", "your-secure-master-key-here")
    
    def _generate_key(self):
        """Generate a new encryption key"""
        return Fernet.generate_key()
    
    def _derive_key_from_password(self, password: str, salt: bytes):
        """Derive encryption key from password and salt"""
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        return base64.urlsafe_b64encode(kdf.derive(password.encode()))
    
    def encrypt_data(self, data_package: dict):
        """
        Encrypt data package using AES-256 (Fernet)
        Returns: (encrypted_data, decryption_key)
        """
        # Generate unique key for this upload
        encryption_key = self._generate_key()
        fernet = Fernet(encryption_key)
        
        # Serialize and encrypt data
        json_data = json.dumps(data_package).encode()
        encrypted_data = fernet.encrypt(json_data)
        
        # Return encrypted data and base64 encoded key
        return encrypted_data, base64.urlsafe_b64encode(encryption_key).decode()
    
    def decrypt_data(self, encrypted_data: bytes, decryption_key: str):
        """Decrypt data using provided key"""
        key = base64.urlsafe_b64decode(decryption_key.encode())
        fernet = Fernet(key)
        
        decrypted_data = fernet.decrypt(encrypted_data)
        return json.loads(decrypted_data.decode())