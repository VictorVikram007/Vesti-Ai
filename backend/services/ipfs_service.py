import httpx
import os
from typing import Optional

class IPFSService:
    def __init__(self):
        # Configure IPFS gateway - use Pinata, Infura, or local node
        self.pinata_api_key = os.getenv("PINATA_API_KEY", "your-pinata-api-key")
        self.pinata_secret = os.getenv("PINATA_SECRET_KEY", "your-pinata-secret")
        self.pinata_url = "https://api.pinata.cloud/pinning/pinFileToIPFS"
        
        # Alternative: Local IPFS node
        self.local_ipfs_url = "http://localhost:5001/api/v0/add"
    
    async def upload_encrypted_data(self, encrypted_data: bytes) -> str:
        """
        Upload encrypted data to IPFS and return CID
        """
        try:
            # Using Pinata service
            if self.pinata_api_key != "your-pinata-api-key":
                return await self._upload_to_pinata(encrypted_data)
            else:
                # Fallback to local IPFS node
                return await self._upload_to_local_ipfs(encrypted_data)
        except Exception as e:
            raise Exception(f"IPFS upload failed: {str(e)}")
    
    async def _upload_to_pinata(self, encrypted_data: bytes) -> str:
        """Upload to Pinata IPFS service"""
        headers = {
            "pinata_api_key": self.pinata_api_key,
            "pinata_secret_api_key": self.pinata_secret
        }
        
        files = {
            "file": ("encrypted_clothing_data", encrypted_data, "application/octet-stream")
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.pinata_url,
                headers=headers,
                files=files,
                timeout=30.0
            )
            
            if response.status_code == 200:
                result = response.json()
                return result["IpfsHash"]
            else:
                raise Exception(f"Pinata upload failed: {response.text}")
    
    async def _upload_to_local_ipfs(self, encrypted_data: bytes) -> str:
        """Upload to local IPFS node"""
        files = {
            "file": ("encrypted_clothing_data", encrypted_data, "application/octet-stream")
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.local_ipfs_url,
                files=files,
                timeout=30.0
            )
            
            if response.status_code == 200:
                result = response.json()
                return result["Hash"]
            else:
                raise Exception(f"Local IPFS upload failed: {response.text}")
    
    async def retrieve_data(self, cid: str) -> bytes:
        """Retrieve data from IPFS using CID"""
        gateway_url = f"https://gateway.pinata.cloud/ipfs/{cid}"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(gateway_url, timeout=30.0)
            
            if response.status_code == 200:
                return response.content
            else:
                raise Exception(f"IPFS retrieval failed: {response.text}")