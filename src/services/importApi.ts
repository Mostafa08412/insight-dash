// Import API service for CSV product imports

export interface UploadPreviewResponse {
  jobId: string;
}

export interface ImportStatusResponse {
  jobId: string;
  status: 'pending' | 'processing' | 'preview_ready' | 'importing' | 'completed' | 'failed';
  succeededCount?: number;
  failedCount?: number;
  errorMessage?: string;
}

const API_BASE = '/api';

export async function uploadForPreview(file: File): Promise<UploadPreviewResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/products/import-preview`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to upload file for preview');
  }

  return response.json();
}

export async function confirmImport(jobId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/products/confirm-import`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ jobId }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to confirm import');
  }
}

export async function getImportStatus(jobId: string): Promise<ImportStatusResponse> {
  const response = await fetch(`${API_BASE}/import/status/${jobId}`);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to get import status');
  }

  return response.json();
}
