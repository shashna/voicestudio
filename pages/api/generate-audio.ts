import { NextApiRequest, NextApiResponse } from "next";
import { generateSilentWav } from "@/utils/generateSilentWav";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { text } = req.body || {};
  if (typeof text !== "string" || !text.trim()) {
    res.status(400).json({ error: "Missing text" });
    return;
  }

  const wavBuffer = generateSilentWav();
  res.setHeader("Content-Type", "audio/wav");
  res.setHeader("Content-Length", wavBuffer.length.toString());
  res.status(200).send(wavBuffer);
}
