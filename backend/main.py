from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
from services.encryption_service import EncryptionService
from services.ipfs_service import IPFSService
from services.masumi_service import log_agent_decision

app = FastAPI(title="VestiAI Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

encryption_service = EncryptionService()
ipfs_service = IPFSService()



class ClothingUploadResponse(BaseModel):
    cid: str
    decryption_key: str

class AgentDecisionRequest(BaseModel):
    agent_id: str
    decision_hash: str

class AgentDecisionResponse(BaseModel):
    success: bool
    transaction_hash: str = None
    message: str



@app.post("/api/clothing/upload", response_model=ClothingUploadResponse)
async def upload_clothing_item(
    image: UploadFile = File(...),
    metadata: str = Form(...)
):
    """
    Secure clothing item upload endpoint for Cardano integration.
    Encrypts image + metadata and uploads to IPFS.
    """
    try:
        # Validate file type
        if not image.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Parse metadata
        try:
            metadata_dict = json.loads(metadata)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid JSON metadata")
        
        # Read image data
        image_data = await image.read()
        
        # Create data package
        data_package = {
            "image": image_data.hex(),
            "metadata": metadata_dict,
            "filename": image.filename
        }
        
        # Encrypt data package
        encrypted_data, decryption_key = encryption_service.encrypt_data(data_package)
        
        # Upload to IPFS
        cid = await ipfs_service.upload_encrypted_data(encrypted_data)
        
        return ClothingUploadResponse(
            cid=cid,
            decryption_key=decryption_key
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@app.post("/api/agent/log-decision", response_model=AgentDecisionResponse)
async def log_agent_decision_endpoint(request: AgentDecisionRequest):
    """
    Log VestiAI agent decision to Masumi Payment Service
    """
    try:
        result = await log_agent_decision(request.agent_id, request.decision_hash)
        
        if isinstance(result, str):
            # Transaction hash returned
            return AgentDecisionResponse(
                success=True,
                transaction_hash=result,
                message="Decision logged successfully with transaction hash"
            )
        else:
            # Boolean True returned
            return AgentDecisionResponse(
                success=True,
                message="Decision logged successfully"
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to log decision: {str(e)}")

@app.post("/api/style/try-on", response_model=VirtualTryOnResponse)
async def virtual_try_on(
    person_image: UploadFile = File(...),
    cloth_image: UploadFile = File(...)
):
    """
    Perform virtual try-on using HR-VITON model
    """
    try:
        # Validate file types
        if not person_image.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Person image must be an image file")
        if not cloth_image.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Cloth image must be an image file")
        
        # Load images
        person_img_data = await person_image.read()
        cloth_img_data = await cloth_image.read()
        
        person_img = Image.open(io.BytesIO(person_img_data)).convert('RGB')
        cloth_img = Image.open(io.BytesIO(cloth_img_data)).convert('RGB')
        
        # Perform virtual try-on
        try:
            result_image_b64, decision_hash = await perform_virtual_tryon(person_img, cloth_img)
        except Exception as vto_error:
            print(f"VTO Error: {vto_error}")
            raise HTTPException(status_code=500, detail=f"VTO processing failed: {str(vto_error)}")
        
        # Log decision to Masumi (Cardano)
        agent_id = "did:vestiai:vto-agent"
        try:
            tx_hash = await log_agent_decision(agent_id, decision_hash)
            transaction_hash = tx_hash if isinstance(tx_hash, str) else None
        except Exception as e:
            print(f"Warning: Failed to log VTO decision: {e}")
            transaction_hash = None
        
        return VirtualTryOnResponse(
            success=True,
            result_image=result_image_b64,
            decision_hash=decision_hash,
            transaction_hash=transaction_hash,
            message="Virtual try-on completed successfully"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Virtual try-on failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)