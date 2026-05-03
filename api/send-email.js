const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const RECIPIENT_NAME = 'Oreoluwa';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.BREVO_API_KEY;
  const senderName = process.env.BREVO_SENDER_NAME || 'My wishlist';
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'odufowokanayotomiwa@gmail.com';
  const recipientEmail = process.env.BIRTHDAY_RECIPIENT_EMAIL || senderEmail;

  if (!apiKey) {
    return res.status(500).json({ error: 'Brevo API key is not configured' });
  }

  const { subject, textContent, htmlContent } = req.body || {};

  if (!subject || !textContent) {
    return res.status(400).json({ error: 'Missing email subject or content' });
  }

  const brevoResponse = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: {
        name: senderName,
        email: senderEmail,
      },
      to: [
        {
          email: recipientEmail,
          name: RECIPIENT_NAME,
        },
      ],
      subject,
      textContent,
      htmlContent,
    }),
  });

  if (!brevoResponse.ok) {
    const errorText = await brevoResponse.text();
    return res.status(brevoResponse.status).json({
      error: errorText || 'Brevo email request failed',
    });
  }

  const payload = await brevoResponse.json();
  return res.status(200).json(payload);
}
