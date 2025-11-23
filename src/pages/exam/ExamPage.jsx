import React from 'react';
import { useParams } from 'react-router-dom';

export default function ExamPage() {
  const { moocId } = useParams();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Exam System</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600">Exam functionality will be implemented here.</p>
          <p className="text-sm text-gray-500 mt-2">
            MOOC ID: {moocId}
          </p>
        </div>
      </div>
    </div>
  );
}
