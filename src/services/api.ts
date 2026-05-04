const RECIPIENT_NAME = 'Oreoluwa';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatMessage(value?: string) {
  return escapeHtml(value?.trim() || 'No message').replace(/\n/g, '<br />');
}

function buildEmailTemplate({
  title,
  intro,
  primaryLabel,
  primaryValue,
  details,
  messageTitle,
  message,
  footer,
}: {
  title: string;
  intro: string;
  primaryLabel: string;
  primaryValue: string;
  details: Array<{ label: string; value: string; href?: string }>;
  messageTitle: string;
  message: string;
  footer: string;
}) {
  const detailsHtml = details
    .map((detail) => {
      const value = detail.href
        ? `<a href="${escapeHtml(detail.href)}" style="color:#d41465;text-decoration:underline;">${escapeHtml(detail.value)}</a>`
        : escapeHtml(detail.value);

      return `
        <tr>
          <td style="padding:0 0 14px;">
            <div style="font-size:11px;font-weight:800;letter-spacing:.08em;color:#9c315d;text-transform:uppercase;margin-bottom:5px;">${escapeHtml(detail.label)}</div>
            <div style="font-size:15px;line-height:1.5;color:#25151d;">${value}</div>
          </td>
        </tr>
      `;
    })
    .join('');

  return `
    <!doctype html>
    <html>
      <body style="margin:0;padding:0;background:#f7e8f0;font-family:Arial,Helvetica,sans-serif;color:#25151d;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7e8f0;padding:34px 14px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:22px;overflow:hidden;box-shadow:0 22px 60px rgba(80,23,48,.12);">
                <tr>
                  <td style="padding:34px 30px 20px;background:linear-gradient(135deg,#fff7fb 0%,#ffffff 58%,#f5f8ff 100%);border-bottom:1px solid #f3d9e6;">
                    <div style="display:inline-block;background:#25151d;color:#ffffff;border-radius:999px;padding:7px 12px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;font-weight:800;margin-bottom:14px;">My wishlist</div>
                    <h1 style="margin:0;color:#d41465;font-size:26px;line-height:1.22;font-weight:800;">
                      <span style="display:inline-block;width:34px;height:34px;line-height:34px;text-align:center;background:#ffe2ef;border-radius:12px;font-size:20px;vertical-align:middle;margin-right:7px;">&#127873;</span>
                      ${escapeHtml(title)}
                    </h1>
                    <p style="margin:14px 0 0;color:#6a4a58;font-size:15px;line-height:1.65;">${escapeHtml(intro)}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 30px 30px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:26px;background:#fff6fa;border:1px solid #f3d4e4;border-radius:18px;padding:24px;">
                      <tr>
                        <td style="padding:0 0 22px;">
                          <div style="font-size:11px;font-weight:800;letter-spacing:.08em;color:#9c315d;text-transform:uppercase;margin-bottom:8px;">${escapeHtml(primaryLabel)}</div>
                          <div style="font-size:23px;line-height:1.35;color:#d41465;font-weight:800;">${escapeHtml(primaryValue)}</div>
                        </td>
                      </tr>
                      ${detailsHtml}
                    </table>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:18px;background:#fff1de;border:1px solid #f0d5b1;border-radius:18px;padding:20px 22px;">
                      <tr>
                        <td>
                          <div style="font-size:12px;font-weight:900;letter-spacing:.06em;text-transform:uppercase;color:#7a2600;margin-bottom:10px;">${escapeHtml(messageTitle)}</div>
                          <div style="font-size:15px;line-height:1.65;color:#4a2a19;">${formatMessage(message)}</div>
                        </td>
                      </tr>
                    </table>

                    <div style="height:1px;background:#f1c8dc;margin:24px 0 18px;"></div>
                    <p style="margin:0;color:#8a123d;font-size:13px;line-height:1.65;">${escapeHtml(footer)}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `.trim();
}

interface ClaimData {
  itemId: number;
  itemName: string;
  category: string;
  name: string;
  email?: string;
  phone?: string;
  message?: string;
  allowMultipleClaims?: boolean;
}

interface WishesData {
  name: string;
  email?: string;
  message: string;
}

async function sendBrevoEmail(subject: string, textContent: string, htmlContent: string) {
  const response = await fetch('/api/send-email', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      subject,
      textContent,
      htmlContent,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Brevo email request failed');
  }

  return response.json();
}

async function saveClaim(data: ClaimData) {
  const response = await fetch('/api/claims', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: string } | null;
    return {
      success: false,
      error: payload?.error || 'Failed to save claim',
      status: response.status,
    };
  }

  const payload = await response.json() as { isClaimed?: boolean };

  return {
    success: true,
    isClaimed: Boolean(payload.isClaimed),
  };
}

export async function submitClaim(data: ClaimData) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Validate required fields
  if (!data.itemName || !data.name) {
    return { success: false, error: 'Missing required fields' };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (data.email && !emailRegex.test(data.email)) {
    return { success: false, error: 'Invalid email format' };
  }

  try {
    const claimResult = await saveClaim(data);

    if (!claimResult.success) {
      return {
        success: false,
        error: claimResult.error,
      };
    }

    // Build email content
    const timestamp = new Date().toLocaleString();
    const emailBody = `
Hi ${RECIPIENT_NAME},

Great news! Someone just claimed a gift from your birthday wishlist.

Gift Details:
- Item: ${data.itemName}
- Category: ${data.category}

Claimed By:
- Name: ${data.name}
- Email: ${data.email || 'Not provided'}
- Phone: ${data.phone || 'Not provided'}
- Message: ${data.message || 'No message'}

Time: ${timestamp}

Warm wishes,
Your Birthday Wishlist App
    `.trim();
    const htmlBody = buildEmailTemplate({
      title: 'Someone just claimed a gift!',
      intro: 'Great news! Someone picked an item from your birthday wishlist.',
      primaryLabel: 'Gift name',
      primaryValue: data.itemName,
      details: [
        { label: 'Category', value: data.category },
        { label: 'Claimed by', value: data.name },
        { label: 'Email', value: data.email || 'Not provided', href: data.email ? `mailto:${data.email}` : undefined },
        { label: 'Phone', value: data.phone || 'Not provided' },
        { label: 'Time', value: timestamp },
      ],
      messageTitle: 'Message from claimer',
      message: data.message || 'No message',
      footer: `This is an automated message from your birthday wishlist. Please reach out to ${data.name} directly to coordinate gift details.`,
    });

    try {
      await sendBrevoEmail('Someone just claimed a gift!', emailBody, htmlBody);
    } catch (error) {
      console.warn('Claim was saved, but email notification failed.', error);
    }

    return { success: true, message: 'Gift claimed successfully', isClaimed: claimResult.isClaimed };
  } catch {
    return { success: false, error: 'Failed to process claim' };
  }
}

export async function submitWishes(data: WishesData) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));

  // Validate required fields
  if (!data.name || !data.message) {
    return { success: false, error: 'Missing required fields' };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (data.email && !emailRegex.test(data.email)) {
    return { success: false, error: 'Invalid email format' };
  }

  try {
    // Build email content
    const timestamp = new Date().toLocaleString();
    const emailBody = `
Hi ${RECIPIENT_NAME},

Someone sent you birthday wishes!

From:
- Name: ${data.name}
- Email: ${data.email || 'Not provided'}

Message:
${data.message}

Time: ${timestamp}

Warm wishes,
Your Birthday Wishlist App
    `.trim();
    const htmlBody = buildEmailTemplate({
      title: 'New birthday wishes for you!',
      intro: 'Someone sent a warm birthday message through your wishlist.',
      primaryLabel: 'Message from',
      primaryValue: data.name,
      details: [
        { label: 'Email', value: data.email || 'Not provided', href: data.email ? `mailto:${data.email}` : undefined },
        { label: 'Time', value: timestamp },
      ],
      messageTitle: 'Birthday message',
      message: data.message,
      footer: `This is an automated message from your birthday wishlist. You can reply directly to ${data.name} using the email above.`,
    });

    await sendBrevoEmail('New Birthday Wishes for You!', emailBody, htmlBody);

    return { success: true, message: 'Wishes sent successfully' };
  } catch {
    return { success: false, error: 'Failed to send wishes' };
  }
}

export async function getClaimedItems(): Promise<number[]> {
  try {
    const response = await fetch('/api/claimed-items');

    if (!response.ok) {
      return [];
    }

    const data = await response.json() as { claimedItemIds?: number[] };
    return data.claimedItemIds || [];
  } catch {
    return [];
  }
}
