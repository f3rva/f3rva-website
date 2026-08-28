import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import {
  PaxParamRedirect,
  AoParamRedirect,
  WorkoutParamRedirect,
  LegacyMemberQueryRedirect,
  LegacyAoQueryRedirect,
  LegacyWorkoutQueryRedirect,
} from './LegacyRedirects';

describe('LegacyRedirects', () => {
  describe('PaxParamRedirect', () => {
    it('redirects valid numeric member id to /bigdata/pax/:id', () => {
      render(
        <MemoryRouter initialEntries={['/pax/101']}>
          <Routes>
            <Route path="/pax/:id" element={<PaxParamRedirect />} />
            <Route path="/bigdata/pax/:id" element={<div>PAX Target Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('PAX Target Page')).toBeInTheDocument();
    });

    it('redirects invalid member id to /bigdata', () => {
      render(
        <MemoryRouter initialEntries={['/pax/abc']}>
          <Routes>
            <Route path="/pax/:id" element={<PaxParamRedirect />} />
            <Route path="/bigdata" element={<div>Big Data Hub</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Big Data Hub')).toBeInTheDocument();
    });
  });

  describe('AoParamRedirect', () => {
    it('redirects valid numeric AO id to /bigdata/ao/:id', () => {
      render(
        <MemoryRouter initialEntries={['/ao/42']}>
          <Routes>
            <Route path="/ao/:id" element={<AoParamRedirect />} />
            <Route path="/bigdata/ao/:id" element={<div>AO Target Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('AO Target Page')).toBeInTheDocument();
    });

    it('redirects invalid AO id to /bigdata/ao', () => {
      render(
        <MemoryRouter initialEntries={['/ao/invalid']}>
          <Routes>
            <Route path="/ao/:id" element={<AoParamRedirect />} />
            <Route path="/bigdata/ao" element={<div>AO Report Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('AO Report Page')).toBeInTheDocument();
    });
  });

  describe('WorkoutParamRedirect', () => {
    it('redirects valid numeric workout id to /bigdata/workout/:id', () => {
      render(
        <MemoryRouter initialEntries={['/workout/999']}>
          <Routes>
            <Route path="/workout/:id" element={<WorkoutParamRedirect />} />
            <Route path="/bigdata/workout/:id" element={<div>Workout Target Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Workout Target Page')).toBeInTheDocument();
    });
  });

  describe('LegacyMemberQueryRedirect', () => {
    it('redirects /member/detail.php?id=101 to /bigdata/pax/101', () => {
      render(
        <MemoryRouter initialEntries={['/member/detail.php?id=101']}>
          <Routes>
            <Route path="/member/detail.php" element={<LegacyMemberQueryRedirect />} />
            <Route path="/bigdata/pax/101" element={<div>PAX 101 Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('PAX 101 Page')).toBeInTheDocument();
    });

    it('redirects missing or invalid id query to /bigdata', () => {
      render(
        <MemoryRouter initialEntries={['/member/detail.php']}>
          <Routes>
            <Route path="/member/detail.php" element={<LegacyMemberQueryRedirect />} />
            <Route path="/bigdata" element={<div>Big Data Hub</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Big Data Hub')).toBeInTheDocument();
    });
  });

  describe('LegacyAoQueryRedirect', () => {
    it('redirects /ao/detail.php?id=15 to /bigdata/ao/15', () => {
      render(
        <MemoryRouter initialEntries={['/ao/detail.php?id=15']}>
          <Routes>
            <Route path="/ao/detail.php" element={<LegacyAoQueryRedirect />} />
            <Route path="/bigdata/ao/15" element={<div>AO 15 Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('AO 15 Page')).toBeInTheDocument();
    });
  });

  describe('LegacyWorkoutQueryRedirect', () => {
    it('redirects /workout/detail.php?id=500 to /bigdata/workout/500', () => {
      render(
        <MemoryRouter initialEntries={['/workout/detail.php?id=500']}>
          <Routes>
            <Route path="/workout/detail.php" element={<LegacyWorkoutQueryRedirect />} />
            <Route path="/bigdata/workout/500" element={<div>Workout 500 Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Workout 500 Page')).toBeInTheDocument();
    });
  });
});
