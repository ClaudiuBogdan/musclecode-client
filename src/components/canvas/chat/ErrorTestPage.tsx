import React from "react";
import { ErrorStreamTest } from "./ErrorStreamTest";

export const ErrorTestPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Error Stream Test Page</h1>
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <ErrorStreamTest />
      </div>
    </div>
  );
};
