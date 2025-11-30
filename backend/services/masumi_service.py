import httpx
import os
from typing import Union

async def log_agent_decision(agent_id: str, decision_hash: str) -> Union[str, bool]:
    """
    Log agent decision to Masumi Payment Service
    Returns transaction hash on success or True if successful
    """
    base_url = os.getenv("MASUMI_PAYMENT_BASE_URL", "masumi-payment-service-production-8d2b.up.railway.app")
    token = os.getenv("MASUMI_PAYMENT_TOKEN", "very_secure_long_and_strong_admin_key")
    
    # Ensure base_url has protocol
    if not base_url.startswith(('http://', 'https://')):
        base_url = f"https://{base_url}"
    
    payload = {
        "agent_id": agent_id,
        "decision_hash": decision_hash,
        "service": "vestiai",
        "action": "outfit_recommendation"
    }
    
    headers = {
        "Authorization": f"token: {token}",
        "Content-Type": "application/json"
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{base_url}/api/log-decision",
                json=payload,
                headers=headers,
                timeout=30.0
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get("transaction_hash", True)
            else:
                raise Exception(f"Masumi API error: {response.status_code} - {response.text}")
                
    except Exception as e:
        raise Exception(f"Failed to log decision to Masumi: {str(e)}")