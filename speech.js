// Vercel Function: /api/speech
// Keeps AZURE_SPEECH_KEY server-side and exchanges it for a short-lived token.
export async function GET() {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;

  if (!key || !region) {
    return Response.json(
      { error: 'Configuration Azure Speech manquante.' },
      { status: 500 }
    );
  }

  const tokenUrl = `https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`;

  try {
    const azureResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Content-Length': '0'
      }
    });

    if (!azureResponse.ok) {
      const detail = await azureResponse.text();
      console.error('Azure Speech token error:', azureResponse.status, detail);
      return Response.json(
        { error: 'Azure Speech a refusé la demande de jeton.' },
        { status: 502 }
      );
    }

    const token = await azureResponse.text();
    return Response.json({ token, region });
  } catch (error) {
    console.error('Azure Speech connection error:', error);
    return Response.json(
      { error: 'Connexion à Azure Speech impossible.' },
      { status: 502 }
    );
  }
}
