import { useAlgorithms } from "@/lib/api/algorithm";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function AlgorithmsTable() {
  const { data: algorithms, isLoading, error } = useAlgorithms();

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Algorithm Challenges</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <div>Loading algorithms...</div>}
        {error && <div>Error loading algorithms: {error.message}</div>}
        {algorithms && <DataTable data={algorithms} columns={columns} />}
      </CardContent>
    </Card>
  );
}
