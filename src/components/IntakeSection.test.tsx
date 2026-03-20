import { render, screen, fireEvent } from '@testing-library/react';
import { IntakeSection } from './IntakeSection';
import { describe, it, expect, vi } from 'vitest';

describe('IntakeSection', () => {
  const mockProps = {
    images: [],
    voiceInput: '',
    setVoiceInput: vi.fn(),
    onImageUpload: vi.fn(),
    onRemoveImage: vi.fn(),
    onProcess: vi.fn(),
    onLoadDemo: vi.fn(),
    showDemoHint: true,
    isOptimizing: false,
  };

  it('should render correctly', () => {
    render(<IntakeSection {...mockProps} />);
    expect(screen.getByLabelText(/Patient Triage Intake/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Describe symptoms/i)).toBeInTheDocument();
  });

  it('should call setVoiceInput on textarea change', () => {
    render(<IntakeSection {...mockProps} />);
    const textarea = screen.getByPlaceholderText(/Describe symptoms/i);
    fireEvent.change(textarea, { target: { value: 'New symptom' } });
    expect(mockProps.setVoiceInput).toHaveBeenCalledWith('New symptom');
  });

  it('should call onProcess when Initiate Triage Analysis button is clicked', () => {
    render(<IntakeSection {...mockProps} voiceInput="Test input" />);
    const button = screen.getByRole('button', { name: /Initiate neural triage analysis/i });
    fireEvent.click(button);
    expect(mockProps.onProcess).toHaveBeenCalled();
  });

  it('should show loading state when isOptimizing is true', () => {
    render(<IntakeSection {...mockProps} isOptimizing={true} />);
    expect(screen.getByText(/Optimizing Assets\.\.\./i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Optimizing assets\.\.\./i })).toBeDisabled();
  });

  it('should call onLoadDemo when Load Sample Case button is clicked', () => {
    render(<IntakeSection {...mockProps} />);
    const demoButton = screen.getByRole('button', { name: /Load Sample Case Data/i });
    fireEvent.click(demoButton);
    expect(mockProps.onLoadDemo).toHaveBeenCalled();
  });
});
