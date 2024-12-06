import React from 'react';

interface PredefinedQuestionsProps {
  onSelectQuestion: (question: string) => void;
}

export const PredefinedQuestions: React.FC<PredefinedQuestionsProps> = ({ onSelectQuestion }) => {
  const questions = [
    "What's the time complexity of this algorithm?",
    "Can you explain the key steps of this algorithm?",
    "How can I optimize this algorithm?",
  ];

  return (
    <div className="p-4 border-b">
      {questions.map((question, index) => (
        <button
          key={index}
          onClick={() => onSelectQuestion(question)}
          className="mr-2 mb-2 px-3 py-1 bg-gray-200 rounded text-sm"
        >
          {question}
        </button>
      ))}
    </div>
  );
};

