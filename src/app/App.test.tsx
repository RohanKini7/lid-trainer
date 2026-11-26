import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the LiD Trainer dashboard shell', () => {
    render(<MemoryRouter><App /></MemoryRouter>);
    expect(screen.getByRole('link', { name: /lid trainer home/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /learn a little/i })).toBeInTheDocument();
  });
});
