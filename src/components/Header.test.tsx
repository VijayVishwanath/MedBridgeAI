import { render, screen } from '@testing-library/react';
import { Header } from './Header';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';

describe('Header Component', () => {
  it('renders the application title', () => {
    render(<Header />);
    const title = screen.getByText(/MedBridge AI \/\/ Triage v1.0/i);
    expect(title).toBeInTheDocument();
  });

  it('shows the system active status', () => {
    render(<Header />);
    const status = screen.getByText(/System Active/i);
    expect(status).toBeInTheDocument();
  });
});
