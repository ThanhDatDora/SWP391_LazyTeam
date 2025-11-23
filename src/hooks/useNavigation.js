import { useNavigate } from 'react-router-dom';

/**
 * Custom navigation hook that provides a consistent way to navigate
 * Replaces direct window.location.href usage
 */
export const useNavigation = () => {
  const navigate = useNavigate();

  // Return the navigate function directly for simplicity
  return navigate;
};