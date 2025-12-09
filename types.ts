export type FileType = 'csv' | 'image' | 'audio' | 'unknown';

export interface AnalysisResponse {
  success: boolean;
  type: FileType;
  message?: string;
  files: string[]; // URLs to images or the uploaded file
}

export interface UploadState {
  isLoading: boolean;
  error: string | null;
  data: AnalysisResponse | null;
}