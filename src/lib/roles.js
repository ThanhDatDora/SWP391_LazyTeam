// Role constants and helper functions
export const ROLES = {
  ADMIN: 1,
  INSTRUCTOR: 2, 
  LEARNER: 3
};

// Role helper functions
export const isAdmin = (user) => user?.role_id === ROLES.ADMIN;
export const isInstructor = (user) => user?.role_id === ROLES.INSTRUCTOR;
export const isLearner = (user) => user?.role_id === ROLES.LEARNER;