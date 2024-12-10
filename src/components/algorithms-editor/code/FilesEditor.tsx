import { CodeEditor } from "@/components/code/CodeEditor";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, FileCode, TestTube2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CodeEditorProps {
  isPreview?: boolean;
}

interface LanguageFiles {
  id: string;
  language: string;
  solutionFile: {
    content: string;
  };
  testFile: {
    content: string;
  };
}

const SUPPORTED_LANGUAGES = [
  {
    value: "python",
    label: "Python",
    solution: "solution.py",
    test: "test.py",
  },
  {
    value: "javascript",
    label: "JavaScript",
    solution: "solution.js",
    test: "test.js",
  },
  {
    value: "typescript",
    label: "TypeScript",
    solution: "solution.ts",
    test: "test.ts",
  },
  {
    value: "java",
    label: "Java",
    solution: "Solution.java",
    test: "Test.java",
  },
  { value: "cpp", label: "C++", solution: "solution.cpp", test: "test.cpp" },
];

export const FilesEditor = ({ isPreview }: CodeEditorProps) => {
  const [languages, setLanguages] = useState<LanguageFiles[]>([]);
  const [selectedLanguageId, setSelectedLanguageId] = useState<string | null>(
    null
  );
  const [activeFile, setActiveFile] = useState<"solution" | "test" | null>(
    null
  );
  const [showAddLanguage, setShowAddLanguage] = useState(false);
  const [newLanguage, setNewLanguage] = useState(SUPPORTED_LANGUAGES[0].value);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const selectedLanguage = languages.find((l) => l.id === selectedLanguageId);
  const availableLanguages = SUPPORTED_LANGUAGES.filter(
    (lang) => !languages.find((l) => l.language === lang.value)
  );

  const handleAddLanguage = () => {
    const langConfig = SUPPORTED_LANGUAGES.find((l) => l.value === newLanguage);
    if (!langConfig) return;

    const newLang: LanguageFiles = {
      id: crypto.randomUUID(),
      language: newLanguage,
      solutionFile: {
        content: "",
      },
      testFile: {
        content: "",
      },
    };

    setLanguages((prev) => [...prev, newLang]);
    setSelectedLanguageId(newLang.id);
    setActiveFile("solution");
    setShowAddLanguage(false);
    setNewLanguage(SUPPORTED_LANGUAGES[0].value);
  };

  const handleDeleteLanguage = () => {
    if (!selectedLanguageId) return;

    setLanguages((prev) => prev.filter((l) => l.id !== selectedLanguageId));
    setSelectedLanguageId(languages[0]?.id ?? null);
    setActiveFile(null);
    setShowDeleteConfirm(false);
  };

  const handleFileContentChange = (content: string) => {
    if (!selectedLanguageId || !activeFile) return;

    setLanguages((prev) =>
      prev.map((lang) => {
        if (lang.id !== selectedLanguageId) return lang;
        return {
          ...lang,
          [activeFile === "solution" ? "solutionFile" : "testFile"]: {
            content,
          },
        };
      })
    );
  };

  if (isPreview) {
    return <div>Preview</div>;
  }

  const getFileContent = () => {
    if (!selectedLanguage || !activeFile) return "";
    return activeFile === "solution"
      ? selectedLanguage.solutionFile.content
      : selectedLanguage.testFile.content;
  };

  const getFileName = () => {
    if (!selectedLanguage || !activeFile) return "";
    const langConfig = SUPPORTED_LANGUAGES.find(
      (l) => l.value === selectedLanguage.language
    );
    return activeFile === "solution" ? langConfig?.solution : langConfig?.test;
  };

  return (
    <div className="flex gap-4 h-full p-4">
      {/* Language Management Sidebar */}
      <div className="w-64 flex flex-col gap-4">
        {languages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="text-muted-foreground">No languages added yet</div>
            <Button onClick={() => setShowAddLanguage(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Language
            </Button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <h2 className="font-semibold">Languages</h2>
              {availableLanguages.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddLanguage(true)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="space-y-2">
              {languages.map((lang) => {
                const langConfig = SUPPORTED_LANGUAGES.find(
                  (l) => l.value === lang.language
                );
                return (
                  <div
                    key={lang.id}
                    className={`p-3 rounded-lg border ${
                      selectedLanguageId === lang.id
                        ? "bg-secondary"
                        : "hover:bg-secondary/50"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{langConfig?.label}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => {
                          setSelectedLanguageId(lang.id);
                          setShowDeleteConfirm(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`w-full justify-start text-xs ${
                          selectedLanguageId === lang.id &&
                          activeFile === "solution"
                            ? "bg-primary/10 text-primary hover:!bg-primary/10"
                            : ""
                        }`}
                        onClick={() => {
                          setSelectedLanguageId(lang.id);
                          setActiveFile("solution");
                        }}
                      >
                        <FileCode className="h-3 w-3 mr-2" />
                        {langConfig?.solution}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`w-full justify-start text-xs ${
                          selectedLanguageId === lang.id &&
                          activeFile === "test"
                            ? "bg-primary/10 text-primary hover:!bg-primary/10"
                            : ""
                        }`}
                        onClick={() => {
                          setSelectedLanguageId(lang.id);
                          setActiveFile("test");
                        }}
                      >
                        <TestTube2 className="h-3 w-3 mr-2" />
                        {langConfig?.test}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Code Editor */}
      <div className="flex-1 h-full">
        {selectedLanguage && activeFile ? (
          <CodeEditor
            initialValue={getFileContent()}
            lang={selectedLanguage.language}
            onChange={handleFileContentChange}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            {languages.length === 0
              ? "Add a language to start coding"
              : "Select a file to start coding"}
          </div>
        )}
      </div>

      {/* Add Language Dialog */}
      <Dialog open={showAddLanguage} onOpenChange={setShowAddLanguage}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Language</DialogTitle>
            <DialogDescription>
              Select a language to add solution and test files.
            </DialogDescription>
          </DialogHeader>
          <Select value={newLanguage} onValueChange={setNewLanguage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableLanguages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAddLanguage(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddLanguage}>Add Language</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Language</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete both the solution and test files for this
              language. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteLanguage}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
