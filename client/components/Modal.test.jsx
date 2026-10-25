import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from './Modal.jsx';

describe('Modal component', () => {
  it('renders with pinned header and scrollable body marked with data-lenis-prevent', () => {
    const handleClose = vi.fn();
    const { container } = render(
      <Modal title="Test Modal Title" subtitle="Test Subtitle" onClose={handleClose} width="wide">
        <div data-testid="modal-content">Long scrollable modal content goes here</div>
      </Modal>
    );

    // Title and subtitle are in the pinned header
    expect(screen.getByText('Test Modal Title')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();

    // The scrollable body has class modal-scroll-body and data-lenis-prevent="true"
    const scrollBody = container.querySelector('.modal-scroll-body');
    expect(scrollBody).toBeInTheDocument();
    expect(scrollBody).toHaveAttribute('data-lenis-prevent', 'true');
    expect(scrollBody).toContainElement(screen.getByTestId('modal-content'));

    // Pinned header is outside modal-scroll-body
    const titleEl = screen.getByText('Test Modal Title');
    expect(scrollBody).not.toContainElement(titleEl);

    // Dialog card has data-lenis-prevent and max height
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('data-lenis-prevent', 'true');
    expect(dialog.className).toContain('max-h-');
    expect(dialog.className).toContain('overflow-hidden');
  });

  it('triggers onClose when close button is clicked or Escape key is pressed', () => {
    const handleClose = vi.fn();
    render(
      <Modal title="Dismissible Modal" onClose={handleClose}>
        <p>Content</p>
      </Modal>
    );

    // Click close button
    const closeBtn = screen.getByLabelText('Close dialog');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    // Press Escape
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(2);
  });
});
