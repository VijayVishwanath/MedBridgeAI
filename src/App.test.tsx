import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import { describe, it, expect } from 'vitest';

describe('App Triage Component', () => {
  it('renders without crashing and shows header', () => {
    render(<App />);
    expect(screen.getByText(/MedBridge AI \/\/ Triage v1.0/i)).toBeInTheDocument();
  });

  it('displays Hackathon demo mode hint', () => {
    render(<App />);
    expect(screen.getByText(/Hackathon Demo Mode Available/i)).toBeInTheDocument();
  });

  it('can load sample data via demo button', () => {
    render(<App />);
    const loadButton = screen.getByText(/Load Sample Case/i);
    fireEvent.click(loadButton);
    const processButton = screen.getByText(/Initiate Triage Analysis/i);
    expect(processButton).not.toBeDisabled();
  });
});
