import { useState, useEffect } from 'react';
import { useAsyncState } from './useAsyncState';

/**
 * Custom hook for data fetching with loading states
 */
export const useFetch = (fetchFunction, dependencies = []) => {
  const { data, loading, error, execute, setError } = useAsyncState();

  useEffect(() => {
    if (fetchFunction) {
      execute(fetchFunction);
    }
  }, dependencies);

  const refetch = () => {
    if (fetchFunction) {
      execute(fetchFunction);
    }
  };

  return { data, loading, error, refetch, setError };
};

/**
 * Hook for courses data fetching
 */
export const useCoursesData = () => {
  const { data: courses, loading, error, execute } = useAsyncState([]);

  const loadCourses = async (params = {}) => {
    return execute(() => api.courses.getCourses(params));
  };

  const loadMyCourses = async () => {
    return execute(() => api.courses.getMyCourses());
  };

  const loadCourseById = async (courseId) => {
    return execute(() => api.courses.getCourseById(courseId));
  };

  return {
    courses: data,
    loading,
    error,
    loadCourses,
    loadMyCourses,
    loadCourseById
  };
};

/**
 * Hook for enrollment management
 */
export const useEnrollment = () => {
  const { loading, error, execute } = useAsyncState();

  const enrollInCourse = async (courseId) => {
    return execute(() => api.enrollments.enrollInCourse(courseId));
  };

  const getMyEnrollments = async () => {
    return execute(() => api.enrollments.getMyEnrollments());
  };

  return {
    loading,
    error,
    enrollInCourse,
    getMyEnrollments
  };
};

/**
 * Hook for user management (admin only)
 */
export const useUserManagement = () => {
  const { data: users, loading, error, execute } = useAsyncState([]);

  const loadUsers = async () => {
    return execute(() => api.admin.getAllUsers());
  };

  const updateUserRole = async (userId, roleId) => {
    return execute(() => api.admin.updateUserRole(userId, roleId));
  };

  const updateUserStatus = async (userId, status) => {
    return execute(() => api.admin.updateUserStatus(userId, status));
  };

  return {
    users: data,
    loading,
    error,
    loadUsers,
    updateUserRole,
    updateUserStatus
  };
};