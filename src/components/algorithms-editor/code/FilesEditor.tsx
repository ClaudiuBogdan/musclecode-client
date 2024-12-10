import { CodeEditor } from "@/components/code/CodeEditor";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileCode, TestTube2, Plus, Trash2 } from "lucide-react";
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
import { useNewAlgorithmStore } from "@/stores/newAlgorithm";
import { NewAlgorithmLanguageFiles } from "@/types/newAlgorithm";
import { CodeLanguage } from "@/stores/algorithm";

interface FilesEditorProps {
  isPreview?: boolean;
  languages: NewAlgorithmLanguageFiles[];
}

const SUPPORTED_LANGUAGES = [
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
] as const;

export const FilesEditor = ({ isPreview, languages }: FilesEditorProps) => {
  const [selectedLanguageId, setSelectedLanguageId] = useState<string | null>(
    null
  );
  const [activeFile, setActiveFile] = useState<"solution" | "test" | null>(
    null
  );
  const [showAddLanguage, setShowAddLanguage] = useState(false);
  const [newLanguage, setNewLanguage] = useState<CodeLanguage>("python");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { addLanguage, removeLanguage, updateSolutionFile, updateTestFile } =
    useNewAlgorithmStore();

  const selectedLanguage = languages.find((l) => l.id === selectedLanguageId);
  const availableLanguages = SUPPORTED_LANGUAGES.filter(
    (lang) => !languages.find((l) => l.language === lang.value)
  );

  const handleAddLanguage = () => {
    addLanguage(newLanguage);
    setShowAddLanguage(false);
    setNewLanguage("python");
  };

  const handleDeleteLanguage = () => {
    if (!selectedLanguageId) return;
    removeLanguage(selectedLanguageId);
    setSelectedLanguageId(languages[0]?.id ?? null);
    setActiveFile(null);
    setShowDeleteConfirm(false);
  };

  const handleFileContentChange = (content: string) => {
    if (!selectedLanguageId || !activeFile) return;

    if (activeFile === "solution") {
      updateSolutionFile(selectedLanguageId, content);
    } else {
      updateTestFile(selectedLanguageId, content);
    }
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
                    className={`p-3 rounded-lg ${
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
                            ? "bg-primary/10 text-primary"
                            : ""
                        }`}
                        onClick={() => {
                          setSelectedLanguageId(lang.id);
                          setActiveFile("solution");
                        }}
                      >
                        <FileCode className="h-3 w-3 mr-2" />
                        solution.{getFileExtension(lang.language)}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`w-full justify-start text-xs ${
                          selectedLanguageId === lang.id &&
                          activeFile === "test"
                            ? "bg-primary/10 text-primary"
                            : ""
                        }`}
                        onClick={() => {
                          setSelectedLanguageId(lang.id);
                          setActiveFile("test");
                        }}
                      >
                        <TestTube2 className="h-3 w-3 mr-2" />
                        test.{getFileExtension(lang.language)}
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
          <Select
            value={newLanguage}
            onValueChange={(value: CodeLanguage) => setNewLanguage(value)}
          >
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

function getFileExtension(language: string): string {
  switch (language) {
    case "typescript":
      return "ts";
    case "javascript":
      return "js";
    case "python":
      return "py";
    case "java":
      return "java";
    case "cpp":
      return "cpp";
    default:
      return "txt";
  }
}
