import { NextRequest } from "next/server";
import { POST as handleCopilotPost } from "../route";

export async function POST(req: NextRequest) {
  return handleCopilotPost(req);
}
