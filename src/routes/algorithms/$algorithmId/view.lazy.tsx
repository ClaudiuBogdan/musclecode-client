import { createLazyFileRoute, useParams } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/algorithms/$algorithmId/view")({
  component: Algorithm,
});

function Algorithm() {
  const { algorithmId } = useParams({
    from: "/algorithms/$algorithmId/view",
  });
  console.log("algorithmId", algorithmId);

  return (
    <>
      <div>Algorithm View</div>
      {algorithmId}
    </>
  );
}
