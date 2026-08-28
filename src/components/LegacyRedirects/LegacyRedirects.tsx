import React, { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { isValidNumericId } from '../../utils/validation';

/**
 * Redirects shorthand entity URLs like /pax/:id or /member/:id -> /bigdata/pax/:id
 */
export const PaxParamRedirect: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (id && isValidNumericId(id)) {
      navigate(`/bigdata/pax/${id}`, { replace: true });
    } else {
      navigate('/bigdata', { replace: true });
    }
  }, [id, navigate]);

  return null;
};

/**
 * Redirects shorthand AO URLs like /ao/:id -> /bigdata/ao/:id
 */
export const AoParamRedirect: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (id && isValidNumericId(id)) {
      navigate(`/bigdata/ao/${id}`, { replace: true });
    } else {
      navigate('/bigdata/ao', { replace: true });
    }
  }, [id, navigate]);

  return null;
};

/**
 * Redirects shorthand Workout URLs like /workout/:id -> /bigdata/workout/:id
 */
export const WorkoutParamRedirect: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (id && isValidNumericId(id)) {
      navigate(`/bigdata/workout/${id}`, { replace: true });
    } else {
      navigate('/bigdata', { replace: true });
    }
  }, [id, navigate]);

  return null;
};

/**
 * Redirects legacy PHP detail URLs with query parameters (?id=...)
 * e.g., /member/detail.php?id=123 or /bigdata/member/detail.php?id=123 -> /bigdata/pax/123
 */
export const LegacyMemberQueryRedirect: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = searchParams.get('id');

  useEffect(() => {
    if (id && isValidNumericId(id)) {
      navigate(`/bigdata/pax/${id}`, { replace: true });
    } else {
      navigate('/bigdata', { replace: true });
    }
  }, [id, navigate]);

  return null;
};

/**
 * Redirects legacy PHP AO detail URLs with query parameters (?id=...)
 * e.g., /ao/detail.php?id=45 or /bigdata/ao/detail.php?id=45 -> /bigdata/ao/45
 */
export const LegacyAoQueryRedirect: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = searchParams.get('id');

  useEffect(() => {
    if (id && isValidNumericId(id)) {
      navigate(`/bigdata/ao/${id}`, { replace: true });
    } else {
      navigate('/bigdata/ao', { replace: true });
    }
  }, [id, navigate]);

  return null;
};

/**
 * Redirects legacy PHP workout detail URLs with query parameters (?id=...)
 * e.g., /workout/detail.php?id=789 or /bigdata/workout/detail.php?id=789 -> /bigdata/workout/789
 */
export const LegacyWorkoutQueryRedirect: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = searchParams.get('id');

  useEffect(() => {
    if (id && isValidNumericId(id)) {
      navigate(`/bigdata/workout/${id}`, { replace: true });
    } else {
      navigate('/bigdata', { replace: true });
    }
  }, [id, navigate]);

  return null;
};
