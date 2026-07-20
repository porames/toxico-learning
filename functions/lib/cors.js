const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function handleCors(req, res) {
  res.set(corsHeaders);
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return true;
  }
  return false;
}
