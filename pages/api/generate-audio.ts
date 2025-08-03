import { NextApiRequest, NextApiResponse } from "next";

function generateSilentWav(duration = 1, sampleRate = 22050) {
  const totalSamples = Math.floor(duration * sampleRate);
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + totalSamples * 2, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(totalSamples * 2, 40);
  const data = Buffer.alloc(totalSamples * 2);
  return Buffer.concat([header, data]);
}

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
