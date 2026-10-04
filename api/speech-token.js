export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const speechKey = process.env.AZURE_SPEECH_KEY;
  const speechRegion = process.env.AZURE_SPEECH_REGION;

  if (!speechKey || !speechRegion) {
    return res.status(500).json({
      error: "Azure Speech configuration missing"
    });
  }

  try {
    const response = await fetch(
      `https://${speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": speechKey,
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Unable to retrieve Azure Speech token"
      });
    }

    const token = await response.text();

    return res.status(200).json({
      token,
      region: speechRegion
    });
  } catch (error) {
    return res.status(500).json({
      error: "Azure Speech token request failed"
    });
  }
}
