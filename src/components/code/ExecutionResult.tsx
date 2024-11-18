import { CodeRunResponse } from "@/lib/api/code";
import React from "react";

interface ExecutionResultProps {
  result: CodeRunResponse | null;
}

export function ExecutionResult({ result }: ExecutionResultProps) {
  const formatOutput = (output: string) => {
    // Split output into lines for processing
    return output.split('\n').map((line, index) => {
      // Handle console.error (typically red)
      if (line.includes('[Error]')) {
        return <span key={index} className="text-red-400">{line}</span>;
      }
      // Handle console.warn (typically yellow)
      if (line.includes('[Warning]')) {
        return <span key={index} className="text-yellow-400">{line}</span>;
      }
      // Handle console.info (typically blue)
      if (line.includes('[Info]')) {
        return <span key={index} className="text-blue-400">{line}</span>;
      }
      // Default console.log (white)
      return <span key={index} className="text-gray-100">{line}</span>;
    }).map((element, index) => (
      // Add line breaks between elements
      <React.Fragment key={`fragment-${index}`}>
        {element}
        <br />
      </React.Fragment>
    ));
  };

  return (
    <div className="bg-gray-900 text-white p-4 h-full overflow-auto font-mono whitespace-pre">
      {result?.output ? formatOutput(result.output) : 'No execution results yet'}
    </div>
  );
}