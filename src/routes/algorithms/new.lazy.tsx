import { DescriptionEditor } from "@/components/algorithms-editor/description/DescriptionEditor";
import { FilesEditor } from "@/components/algorithms-editor/code/FilesEditor";
import { createLazyFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const Route = createLazyFileRoute("/algorithms/new")({
  component: RouteComponent,
});

function RouteComponent() {
  const [activeTab, setActiveTab] = useState("metadata");

  return (
    <div className="container mx-auto py-6 h-[calc(100vh-5rem)] flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Create New Algorithm</h1>
        <Button>Save Algorithm</Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="solutions">Solutions</TabsTrigger>
        </TabsList>

        <TabsContent value="metadata" className="flex-1">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Algorithm title..." />
              </div>
              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <select
                  id="difficulty"
                  className="w-full p-2 rounded-md border dark:bg-background"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  placeholder="Add tags separated by commas..."
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="description" className="h-full">
          <Card className="h-full">
            <DescriptionEditor isPreview={false} />
          </Card>
        </TabsContent>

        <TabsContent value="solutions" className="h-full">
          <Card className="h-full">
            <FilesEditor isPreview={false} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
