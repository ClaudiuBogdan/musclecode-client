import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Link } from "@tanstack/react-router";

import { categories, difficulties } from "./data";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import { AlgorithmPreview } from "@/types/algorithm";

export const columns: ColumnDef<AlgorithmPreview>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Algorithm" />
    ),
    cell: ({ row }) => (
      <Link
        to={`/algorithms/${row.original.id}/view`}
        className="flex space-x-2"
      >
        <span className="max-w-[500px] truncate font-medium">
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

      if (!difficulty) {
        return null;
      }

      return (
        <div className="flex items-center">
          {difficulty.icon && (
            <difficulty.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span>{difficulty.label}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }) => {
      const category = categories.find(
        (category) => category.value === row.getValue("category")
      );

      if (!category) {
        return null;
      }

      return (
        <div className="flex w-[100px] items-center">
          <Badge variant="outline">
            {category.icon && (
              <category.icon className="mr-2 h-4 w-4 text-muted-foreground" />
            )}
            {category.label}
          </Badge>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
