import { render, screen } from '@testing-library/react';
import { ProcessingSection } from './ProcessingSection';
import { describe, it, expect } from 'vitest';

describe('ProcessingSection', () => {
  const mockProps = {
    loadingStep: 0,
    loadingMessages: ['Step 1', 'Step 2'],
  };

  it('should render correctly', () => {
    render(<ProcessingSection {...mockProps} />);
    expect(screen.getByText(/Step 1/i)).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should show the correct loading message', () => {
    render(<ProcessingSection {...mockProps} loadingStep={1} />);
    expect(screen.getByText(/Step 2/i)).toBeInTheDocument();
  });
});
