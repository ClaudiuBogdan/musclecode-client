import { CodeLanguage } from '@/stores/algorithm';

const LANGUAGES: { value: CodeLanguage; label: string }[] = [
  { value: 'typescript', label: 'TypeScript' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
];

interface LanguageSelectorProps {
  value: CodeLanguage;
  onChange: (language: CodeLanguage) => void;
}

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as CodeLanguage)}
      className="
        h-7 px-2 text-sm
        bg-gray-800 text-gray-200
        border border-gray-700 rounded
        focus:outline-none focus:border-blue-500
        hover:bg-gray-750
      "
    >
      {LANGUAGES.map((lang) => (
        <option key={lang.value} value={lang.value}>
          {lang.label}
        </option>
      ))}
    </select>
  );
} 