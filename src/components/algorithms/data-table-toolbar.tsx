"use client"

import { Table } from "@tanstack/react-table"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";

import { difficulties, categories } from "./data"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { Link } from "@tanstack/react-router";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between gap-4 p-1">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Search algorithms..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="h-9 w-[200px] lg:w-[300px] rounded-lg border-muted-foreground/30 focus:ring-1 focus:ring-primary"
        />
        {table.getColumn("categories") && (
          <DataTableFacetedFilter
            column={table.getColumn("categories")}
            title="Categories"
            options={categories}
          />
        )}
        {table.getColumn("difficulty") && (
          <DataTableFacetedFilter
            column={table.getColumn("difficulty")}
            title="Difficulty"
            options={difficulties}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <Link to="/algorithms/new">
        <Button
          size="sm"
          className="h-9 rounded-lg bg-gradient-to-r from-primary to-primary/90 text-white shadow-sm hover:shadow-md hover:from-primary/90 hover:to-primary transition-all"
        >
          New Algorithm
        </Button>
      </Link>
    </div>
  );
}
