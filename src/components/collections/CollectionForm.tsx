import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { AlgorithmSelector } from "@/components/algorithms/AlgorithmSelector";
import { AlgorithmTemplate } from "@/types/algorithm";

const collectionFormSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be less than 50 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters"),
  isPublic: z.boolean().default(false),
  algorithms: z.array(z.string()).min(1, "Select at least one algorithm"),
  tags: z.array(z.string()),
});

export type CollectionFormData = z.infer<typeof collectionFormSchema>;

interface CollectionFormProps {
  initialData?: CollectionFormData;
  onSubmit: (data: CollectionFormData) => void;
  isLoading?: boolean;
  availableAlgorithms?: AlgorithmTemplate[];
}

export function CollectionForm({
  initialData,
  onSubmit,
  isLoading,
  availableAlgorithms = [],
}: CollectionFormProps) {
  const form = useForm<CollectionFormData>({
    resolver: zodResolver(collectionFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      isPublic: initialData?.isPublic || false,
      algorithms: initialData?.algorithms || [],
      tags: initialData?.tags || [],
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Data Structures 101" {...field} />
              </FormControl>
              <FormDescription>
                Give your collection a descriptive name
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A collection of fundamental data structures..."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Describe what algorithms and concepts this collection covers
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isPublic"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Make Public</FormLabel>
                <FormDescription>
                  Allow other users to view and copy this collection
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="algorithms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Algorithms</FormLabel>
              <FormControl>
                <AlgorithmSelector
                  value={field.value}
                  onChange={field.onChange}
                  algorithms={availableAlgorithms}
                />
              </FormControl>
              <FormDescription>
                Select the algorithms to include in this collection
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? "Saving..."
            : initialData
              ? "Update Collection"
              : "Create Collection"}
        </Button>
      </form>
    </Form>
  );
}
