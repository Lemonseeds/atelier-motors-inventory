import { expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CompanyAssistant } from './CompanyAssistant.jsx';
import { api } from '../api.js';

vi.mock('../api.js', () => ({ api: vi.fn() }));

it('opens, asks a question, and displays a grounded answer', async () => {
  api.mockResolvedValue({ answer: 'The Aurelia GT S starts at $89,400.', source: 'live-inventory' });
  render(<CompanyAssistant/>);
  await userEvent.click(screen.getByRole('button', { name: 'Open Atelier Assistant' }));
  expect(screen.getByText(/limited to Atelier Motors and our vehicles/i)).toBeInTheDocument();
  await userEvent.type(screen.getByRole('textbox', { name: 'Ask about Atelier Motors' }), 'How much is the Aurelia GT S?');
  await userEvent.click(screen.getByRole('button', { name: 'Send question' }));
  expect(await screen.findByText('The Aurelia GT S starts at $89,400.')).toBeInTheDocument();
  expect(api).toHaveBeenCalledWith('/assistant', { method: 'POST', body: JSON.stringify({ message: 'How much is the Aurelia GT S?' }) });
});

it('formats markdown lists and bold text into structured HTML elements', async () => {
  api.mockResolvedValue({
    answer: 'Here are our models:\n- **Aurelia GTS** - Starting at **$89,400**\n- **Solenne R8** - Convertible',
    source: 'groq',
  });
  render(<CompanyAssistant/>);
  await userEvent.click(screen.getByRole('button', { name: 'Open Atelier Assistant' }));
  await userEvent.type(screen.getByRole('textbox', { name: 'Ask about Atelier Motors' }), 'Which cars?');
  await userEvent.click(screen.getByRole('button', { name: 'Send question' }));
  expect(await screen.findByText('Aurelia GTS')).toBeInTheDocument();
  expect(screen.getByText('$89,400')).toBeInTheDocument();
  const listItems = screen.getAllByRole('listitem');
  expect(listItems.length).toBe(2);
});

