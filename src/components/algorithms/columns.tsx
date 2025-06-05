import { Link } from "@tanstack/react-router";


import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";


import { categories, difficulties } from "./data";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";

import type { AlgorithmPreview } from "@/types/algorithm";
import type { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<AlgorithmPreview>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Algorithm" />
    ),
    cell: ({ row }) => (
      <Link
        to={`/algorithms/$algorithmId/view`}
        params={{ algorithmId: row.original.id }}
        className="group flex items-center space-x-3"
      >
        <span className="max-w-[300px] truncate font-medium group-hover:text-primary transition-colors">
          {row.getValue("title")}
        </span>
      </Link>
    ),
  },
  {
    accessorKey: "difficulty",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Difficulty" />
    ),
    cell: ({ row }) => {
      const difficulty = difficulties.find(
        (d) => d.value === row.getValue("difficulty")
      );

      return (
        <Badge
          variant="outline"
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium",
            difficulty?.value === "easy" &&
              "bg-green-100 text-green-800 border-green-200",
            difficulty?.value === "medium" &&
              "bg-yellow-100 text-yellow-800 border-yellow-200",
            difficulty?.value === "hard" &&
              "bg-red-100 text-red-800 border-red-200"
          )}
        >
          {difficulty?.icon && (
            <difficulty.icon className="mr-1.5 h-3.5 w-3.5" />
          )}
          {difficulty?.label}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return Array.isArray(value) && value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "categories",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Categories" />
    ),
    cell: ({ row }) => {
      const algorithmCategories: string[] = row.getValue("categories");

      return algorithmCategories.map((value) => {
        const category = categories.find((c) => c.value === value);
        return (
          <div className="flex items-center space-x-2" key={value}>
            {category?.icon && (
              <category.icon className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-sm text-muted-foreground">
              {category?.label}
            </span>
          </div>
        );
      });
    },
    filterFn: (row, _, value) => {
      return (
        Array.isArray(value) &&
        value.some((v: string) => row.original.categories.includes(v))
      );
    },
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
