interface ExecutionResultProps {
  result: string;
}

export function ExecutionResult({ result }: ExecutionResultProps) {
  return (
    <div className="bg-gray-900 text-white p-4 h-full overflow-auto font-mono">
      {result || 'No execution results yet'}
    </div>
  );
} 