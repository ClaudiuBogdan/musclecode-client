import { http, HttpResponse } from "msw";

export const codeSubmissions = http.post(
  "/api/algorithms/:id/submissions",
  async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return HttpResponse.json({ success: true });
  }
);
