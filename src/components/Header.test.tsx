import { render, screen } from '@testing-library/react';
import { Header } from './Header';
import { describe, it, expect } from 'vitest';

describe('Header Component', () => {
  it('renders the application title', () => {
    render(<Header />);
    const title = screen.getByText(/MedBridge AI/i);
    expect(title).toBeInTheDocument();
  });

  it('shows the version number', () => {
    render(<Header />);
    const version = screen.getByText(/v2.0.4-stable/i);
    expect(version).toBeInTheDocument();
  });

  it('shows the system active status', () => {
    render(<Header />);
    const status = screen.getByText(/Neural Engine Active/i);
    expect(status).toBeInTheDocument();
  });
});
