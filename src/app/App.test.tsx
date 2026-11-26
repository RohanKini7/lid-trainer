import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import App from './App';

describe('App Bundesland setup', () => {
  beforeEach(() => window.localStorage.clear());

  it('requires a Bundesland selection on first visit', () => {
    render(<MemoryRouter><App /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: /which bundesland are you preparing for/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/federal state/i)).toBeInTheDocument();
  });

  it('saves the selected Bundesland and shows the dashboard', () => {
    render(<MemoryRouter><App /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText(/federal state/i), { target: { value: 'by' } });
    expect(window.localStorage.getItem('lid-trainer-bundesland')).toBe('by');
    expect(screen.getByRole('heading', { name: /learn a little/i })).toBeInTheDocument();
    expect(screen.getByText('Bayern')).toBeInTheDocument();
  });

  it('restores a saved Bundesland on the next visit', () => {
    window.localStorage.setItem('lid-trainer-bundesland', 'by');
    render(<MemoryRouter><App /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: /learn a little/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /which bundesland/i })).not.toBeInTheDocument();
  });

  it('allows the user to change their Bundesland', () => {
    window.localStorage.setItem('lid-trainer-bundesland', 'by');
    render(<MemoryRouter><App /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: /change state/i }));
    expect(screen.getByRole('heading', { name: /which bundesland are you preparing for/i })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/federal state/i), { target: { value: 'he' } });
    expect(window.localStorage.getItem('lid-trainer-bundesland')).toBe('he');
    expect(screen.getByText('Hessen')).toBeInTheDocument();
  });
});
