import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';

describe('App Routing & Legacy Redirects', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders welcome message on home route', () => {
    render(<App />);
    const welcomeElement = screen.getByText(/Welcome to F3RVA/i);
    expect(welcomeElement).toBeInTheDocument();
  });

  it('redirects /member/detail.php?id=85 to /bigdata/pax/85', async () => {
    window.history.pushState({}, 'Test', '/member/detail.php?id=85');
    render(<App />);
    // Verify it doesn't render 404
    expect(screen.queryByText(/Page Not Found/i)).not.toBeInTheDocument();
  });

  it('redirects /ao/detail.php?id=12 to /bigdata/ao/12', async () => {
    window.history.pushState({}, 'Test', '/ao/detail.php?id=12');
    render(<App />);
    expect(screen.queryByText(/Page Not Found/i)).not.toBeInTheDocument();
  });

  it('redirects /report/attendance.php to /bigdata/attendance', async () => {
    window.history.pushState({}, 'Test', '/report/attendance.php');
    render(<App />);
    expect(screen.queryByText(/Page Not Found/i)).not.toBeInTheDocument();
  });

  it('redirects /self-service/alias.php to /bigdata/claim-alias', async () => {
    window.history.pushState({}, 'Test', '/self-service/alias.php');
    render(<App />);
    expect(screen.queryByText(/Page Not Found/i)).not.toBeInTheDocument();
  });

  it('redirects /index.php and /bigdata/index.php to /bigdata', async () => {
    window.history.pushState({}, 'Test', '/index.php');
    render(<App />);
    expect(screen.queryByText(/Page Not Found/i)).not.toBeInTheDocument();
  });

  it('redirects /bigdata/member/85 to /bigdata/pax/85', async () => {
    window.history.pushState({}, 'Test', '/bigdata/member/85');
    render(<App />);
    expect(screen.queryByText(/Page Not Found/i)).not.toBeInTheDocument();
  });

  it('redirects /bigdata/login.php to /bigdata/admin/login', async () => {
    window.history.pushState({}, 'Test', '/bigdata/login.php');
    render(<App />);
    expect(screen.queryByText(/Page Not Found/i)).not.toBeInTheDocument();
  });
});
