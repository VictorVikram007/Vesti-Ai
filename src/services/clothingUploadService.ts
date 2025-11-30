interface ClothingMetadata {
  color: string;
  type: string;
  brand?: string;
  size?: string;
  season?: string;
}

interface UploadResponse {
  cid: string;
  decryption_key: string;
}

export async function uploadClothingItem(
  imageFile: File,
  metadata: ClothingMetadata
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('metadata', JSON.stringify(metadata));

  const response = await fetch('http://localhost:8000/api/clothing/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  return response.json();
}