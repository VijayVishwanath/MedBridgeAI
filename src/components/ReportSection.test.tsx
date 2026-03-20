import { render, screen, fireEvent } from '@testing-library/react';
import { ReportSection } from './ReportSection';
import { describe, it, expect, vi } from 'vitest';

describe('ReportSection', () => {
  const mockReport = {
    patientName: 'John Doe',
    age: '45',
    criticalityScore: 8,
    primaryCondition: 'Chest Pain',
    allergies: ['None'],
    medications: ['Aspirin'],
    summary: 'Patient has chest pain.',
    recommendedActions: ['Call 911'],
    groundingSources: [{ uri: 'https://example.com', title: 'Example' }],
    nearbyHospitals: [{ name: 'General Hospital', uri: 'https://maps.google.com/hospital' }]
  };

  const mockProps = {
    report: mockReport,
    isHandingOver: false,
    handoverComplete: false,
    onReset: vi.fn(),
    onHandover: vi.fn(),
  };

  it('should render correctly', () => {
    render(<ReportSection {...mockProps} />);
    expect(screen.getByText(/Triage Report/i)).toBeInTheDocument();
    // Use getAllByText because John Doe appears in the title and patient info
    expect(screen.getAllByText(/John Doe/i).length).toBeGreaterThan(0);
    // Use getAllByText because Chest Pain might appear in summary too
    expect(screen.getAllByText(/Chest Pain/i).length).toBeGreaterThan(0);
  });

  it('should call onReset when Reset Protocol button is clicked', () => {
    render(<ReportSection {...mockProps} />);
    const button = screen.getByRole('button', { name: /Reset triage protocol/i });
    fireEvent.click(button);
    expect(mockProps.onReset).toHaveBeenCalled();
  });

  it('should call onHandover when Initiate Handover button is clicked', () => {
    render(<ReportSection {...mockProps} />);
    const button = screen.getByRole('button', { name: /Initiate handover protocol/i });
    fireEvent.click(button);
    expect(mockProps.onHandover).toHaveBeenCalled();
  });

  it('should show handover status when isHandingOver is true', () => {
    render(<ReportSection {...mockProps} isHandingOver={true} />);
    expect(screen.getByText(/Syncing Handover\.\.\./i)).toBeInTheDocument();
  });

  it('should show handover complete status when handoverComplete is true', () => {
    render(<ReportSection {...mockProps} handoverComplete={true} />);
    expect(screen.getByText(/Handover Verified/i)).toBeInTheDocument();
  });

  it('should render grounding sources', () => {
    render(<ReportSection {...mockProps} />);
    expect(screen.getByText(/Example/i)).toBeInTheDocument();
    expect(screen.getByRole('listitem', { name: /View source: Example/i })).toHaveAttribute('href', 'https://example.com');
  });

  it('should render nearby hospitals', () => {
    render(<ReportSection {...mockProps} />);
    expect(screen.getByText(/General Hospital/i)).toBeInTheDocument();
    expect(screen.getByRole('listitem', { name: /View hospital: General Hospital/i })).toHaveAttribute('href', 'https://maps.google.com/hospital');
  });
});
