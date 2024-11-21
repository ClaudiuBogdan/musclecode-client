import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"

import { categories, difficulties } from "./data"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions"
import { AlgorithmPreview } from "@/types/algorithm"

export const columns: ColumnDef<AlgorithmPreview>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Algorithm" />
    ),
    cell: ({ row }) => {
      const category = categories.find(
        (category) => category.value === row.original.category
      )

      return (
        <div className="flex space-x-2">
          {category && <Badge variant="outline">{category.label}</Badge>}
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("title")}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "difficulty",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Difficulty" />
    ),
    cell: ({ row }) => {
      const difficulty = difficulties.find(
        (d) => d.value === row.getValue("difficulty")
      )

      if (!difficulty) {
        return null
      }

      return (
        <div className="flex items-center">
          {difficulty.icon && (
            <difficulty.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span>{difficulty.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
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
      )

      if (!category) {
        return null
      }

      return (
        <div className="flex w-[100px] items-center">
          {category.icon && (
            <category.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span>{category.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
