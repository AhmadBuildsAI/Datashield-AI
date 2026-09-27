import api from './api';
import { ScanResponse, ScanListItem, DashboardData } from '../types';

export const scanText = async (text: string, maskMode = 'mask'): Promise<ScanResponse> => {
  const r = await api.post('/scans/text', { text, mask_mode: maskMode });
  return r.data;
};

export const scanFile = async (file: File, maskMode = 'mask'): Promise<ScanResponse> => {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('mask_mode', maskMode);
  const r = await api.post('/scans/file', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return r.data;
};

export const listScans = async (riskLevel?: string): Promise<ScanListItem[]> => {
  const params = riskLevel ? { risk_level: riskLevel } : {};
  const r = await api.get('/scans/', { params });
  return r.data;
};

export const getScan = async (id: string): Promise<ScanResponse> => {
  const r = await api.get(`/scans/${id}`);
  return r.data;
};

export const remask = async (id: string, maskMode: string): Promise<ScanResponse> => {
  const fd = new FormData();
  fd.append('mask_mode', maskMode);
  const r = await api.post(`/scans/${id}/remask`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return r.data;
};

export const getDashboard = async (): Promise<DashboardData> => {
  const r = await api.get('/analytics/dashboard');
  return r.data;
};

export const getModelInfo = async () => {
  const r = await api.get('/analytics/model-info');
  return r.data;
};
