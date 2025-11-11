import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';

export default function ExamHistoryPage() {
  const { courseId } = useParams();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadExamHistory();
  }, [courseId]);

  const loadExamHistory = async () => {
    try {
      setLoading(true);
      const response = await api.getExamHistory(courseId);
      setAttempts(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load exam history:', err);
      setError(err.message || 'Failed to load exam history');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exam history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadExamHistory}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Exam History</h1>

      {attempts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No exam attempts found</p>
          <Link
            to={`/courses/${courseId}/exam`}
            className="text-blue-600 hover:underline"
          >
            Take the exam
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {attempts.map((attempt) => (
            <div
              key={attempt.id}
              className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    Attempt #{attempt.attemptNumber || attempt.id}
                  </h3>
                  <p className="text-gray-600 mb-1">
                    Score: <span className="font-bold text-blue-600">{attempt.score}%</span>
                  </p>
                  <p className="text-gray-600 mb-1">
                    Status: <span className={`font-semibold ${
                      attempt.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {attempt.status}
                    </span>
                  </p>
                  <p className="text-gray-500 text-sm">
                    {new Date(attempt.submittedAt || attempt.createdAt).toLocaleString()}
                  </p>
                </div>
                <Link
                  to={`/courses/${courseId}/exam/results/${attempt.id}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
