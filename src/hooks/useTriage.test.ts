import { renderHook, act } from '@testing-library/react';
import { useTriage } from './useTriage';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as geminiService from '../services/geminiService';
import * as imageUtils from '../utils/imageUtils';

// Mock the services
vi.mock('../services/geminiService', () => ({
  processMedicalData: vi.fn(),
}));

vi.mock('../utils/imageUtils', () => ({
  optimizeImage: vi.fn(),
}));

describe('useTriage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock URL.createObjectURL and URL.revokeObjectURL
    global.URL.createObjectURL = vi.fn(() => 'mock-url');
    global.URL.revokeObjectURL = vi.fn();
    
    // Mock navigator.geolocation
    const mockGeolocation = {
      getCurrentPosition: vi.fn().mockImplementation((success) => success({
        coords: {
          latitude: 10,
          longitude: 20,
        },
      })),
    };
    (global.navigator as any).geolocation = mockGeolocation;
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useTriage());
    expect(result.current.images).toEqual([]);
    expect(result.current.voiceInput).toBe('');
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.report).toBeNull();
  });

  it('should handle image upload', () => {
    const { result } = renderHook(() => useTriage());
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const fileList = {
      0: file,
      length: 1,
      item: (index: number) => file,
      [Symbol.iterator]: function* () { yield file; }
    } as unknown as FileList;

    act(() => {
      result.current.handleImageUpload(fileList);
    });

    expect(result.current.images).toHaveLength(1);
    expect(result.current.images[0].file).toBe(file);
    expect(result.current.images[0].preview).toBe('mock-url');
  });

  it('should handle image removal', () => {
    const { result } = renderHook(() => useTriage());
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const fileList = {
      0: file,
      length: 1,
      item: (index: number) => file,
      [Symbol.iterator]: function* () { yield file; }
    } as unknown as FileList;

    act(() => {
      result.current.handleImageUpload(fileList);
    });

    act(() => {
      result.current.removeImage(0);
    });

    expect(result.current.images).toHaveLength(0);
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('mock-url');
  });

  it('should handle processing successfully', async () => {
    const mockReport = {
      criticality: 'High',
      summary: 'Test summary',
      recommendations: ['Test rec'],
      status: 'Critical',
      groundingSources: []
    };
    (geminiService.processMedicalData as any).mockResolvedValue(mockReport);
    (imageUtils.optimizeImage as any).mockResolvedValue('base64-data');

    const { result } = renderHook(() => useTriage());
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const fileList = {
      0: file,
      length: 1,
      item: (index: number) => file,
      [Symbol.iterator]: function* () { yield file; }
    } as unknown as FileList;

    act(() => {
      result.current.handleImageUpload(fileList);
      result.current.setVoiceInput('Test input');
    });

    await act(async () => {
      await result.current.handleProcess();
    });

    expect(result.current.report).toEqual(mockReport);
    expect(result.current.isProcessing).toBe(false);
    expect(geminiService.processMedicalData).toHaveBeenCalled();
  });

  it('should handle processing failure', async () => {
    (geminiService.processMedicalData as any).mockRejectedValue(new Error('API Error'));
    (imageUtils.optimizeImage as any).mockResolvedValue('base64-data');

    const { result } = renderHook(() => useTriage());
    
    await act(async () => {
      await result.current.handleProcess();
    });

    expect(result.current.error).toContain('Triage Analysis Failed');
    expect(result.current.isProcessing).toBe(false);
  });

  it('should handle reset', () => {
    const { result } = renderHook(() => useTriage());
    
    act(() => {
      result.current.setVoiceInput('Test');
      result.current.handleReset();
    });

    expect(result.current.voiceInput).toBe('');
    expect(result.current.report).toBeNull();
    expect(result.current.images).toEqual([]);
  });
});
