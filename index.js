const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;
const UPSTREAM_TIMEOUT_MS = 4000;

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/api/classify", async (req, res) => {
  const { name } = req.query;

  if (name === undefined || name === null || name === "") {
    return res
      .status(400)
      .json({ status: "error", message: "Missing or empty name parameter" });
  }

  if (typeof name !== "string") {
    return res.status(422).json({ status: "error", message: "name is not a string" });
  }

  const trimmedName = name.trim();
  if (!trimmedName) {
    return res
      .status(400)
      .json({ status: "error", message: "Missing or empty name parameter" });
  }

  try {
    const upstreamResponse = await fetch(
      `https://api.genderize.io/?name=${encodeURIComponent(trimmedName)}`,
      { signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS) }
    );

    if (!upstreamResponse.ok) {
      return res.status(502).json({ status: "error", message: "Upstream service failure" });
    }

    const payload = await upstreamResponse.json();
    const gender = payload.gender;
    const probability = Number(payload.probability);
    const sampleSize = Number(payload.count);

    if (Number.isNaN(probability) || Number.isNaN(sampleSize)) {
      return res.status(502).json({ status: "error", message: "Upstream service failure" });
    }

    if (gender === null || sampleSize === 0) {
      return res.status(200).json({
        status: "error",
        message: "No prediction available for the provided name"
      });
    }

    const isConfident = probability >= 0.7 && sampleSize >= 100;
    const processedAt = new Date().toISOString();

    return res.status(200).json({
      status: "success",
      data: {
        name: payload.name || trimmedName.toLowerCase(),
        gender,
        probability,
        sample_size: sampleSize,
        is_confident: isConfident,
        processed_at: processedAt
      }
    });
  } catch (error) {
    if (error.name === "TimeoutError") {
      return res.status(502).json({ status: "error", message: "Upstream service failure" });
    }

    return res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
