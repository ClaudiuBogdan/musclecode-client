import { FileCode, TestTube2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { CodeEditor } from "@/components/code/CodeEditor";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import type { AlgorithmFile, CodeLanguage } from "@/types/algorithm";

interface FilesEditorProps {
  isPreview?: boolean;
  files: AlgorithmFile[];
  onLanguageAdd: (language: CodeLanguage) => void;
  onLanguageRemove: (languageId: string) => void;
  onFileContentChange: (fileId: string, content: string) => void;
}

const SUPPORTED_LANGUAGES = [
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
] as const;

export const FilesEditor = ({
  isPreview,
  files,
  onLanguageAdd,
  onLanguageRemove,
  onFileContentChange,
}: FilesEditorProps) => {
  const [activeFile, setActiveFile] = useState<AlgorithmFile | null>(null);
  const [activeDeleteLanguage, setActiveDeleteLanguage] =
    useState<CodeLanguage | null>(null);
  const [showAddLanguage, setShowAddLanguage] = useState(false);
  const [newLanguage, setNewLanguage] = useState<CodeLanguage>("python");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const availableLanguages = SUPPORTED_LANGUAGES.filter(
    (lang) => !files.find((l) => l.language === lang.value)
  );

  const languages = files.reduce(
    (acc, file) => {
      acc[file.language] = [...(acc[file.language] || []), file];
      return acc;
    },
    {} as Record<CodeLanguage, AlgorithmFile[]>
  );

  const handleAddLanguage = () => {
    onLanguageAdd(newLanguage);
    setShowAddLanguage(false);
    setNewLanguage("python");
  };

  const handleDeleteLanguage = () => {
    if (!activeDeleteLanguage) return;

    onLanguageRemove(activeDeleteLanguage);
    setActiveFile(files[0] || null);
    setActiveDeleteLanguage(null);
    setShowDeleteConfirm(false);
  };

  const handleFileContentChange = (content: string) => {
    if (!activeFile) return;
    onFileContentChange(activeFile.id, content);
  };

  if (isPreview) {
    return <div>Preview</div>;
  }

  return (
    <div className="flex gap-4 h-full p-4">
      {/* Language Management Sidebar */}
      <div className="w-64 flex flex-col gap-4">
        {files.length === 0 ? (
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
              {Object.entries(languages).map(([language, files]) => {
                const langConfig = SUPPORTED_LANGUAGES.find(
                  (l) => l.value === language
                );
                return (
                  <div
                    key={language}
                    className={`p-3 rounded-lg ${
                      activeFile?.language === language
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
                          setActiveDeleteLanguage(language as CodeLanguage);
                          setShowDeleteConfirm(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-1">
                      {files.map((file) => (
                        <Button
                          key={file.id}
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "w-full justify-start text-xs hover:bg-secondary/50",
                            activeFile?.id === file.id &&
                              "bg-primary/20 hover:bg-primary/50"
                          )}
                          onClick={() => {
                            setActiveFile(file);
                          }}
                        >
                          {file.type === "solution" ? (
                            <FileCode className="h-3 w-3 mr-2" />
                          ) : (
                            <TestTube2 className="h-3 w-3 mr-2" />
                          )}
                          {file.name}
                        </Button>
                      ))}
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
        {activeFile ? (
          <CodeEditor
            initialValue={activeFile.content}
            lang={activeFile.language}
            onChange={handleFileContentChange}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            {files.length === 0
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
