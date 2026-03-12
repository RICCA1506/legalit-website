function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

const FIRM_COLOR = "#2e6884";
const FIRM_COLOR_LIGHT = "#e8f1f6";

function firmSignature(): string {
  return `
    <table style="width: 100%; border-collapse: collapse; margin-top: 32px; border-top: 2px solid ${FIRM_COLOR}; padding-top: 20px;">
      <tr>
        <td style="vertical-align: top; padding-top: 16px;">
          <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700; color: ${FIRM_COLOR}; letter-spacing: 1px;">
            LEGALIT
          </p>
          <p style="margin: 0 0 12px 0; font-size: 11px; color: #6b7280; letter-spacing: 0.5px;">
            Societ&agrave; tra Avvocati S.r.l.
          </p>
          <table style="border-collapse: collapse;">
            <tr>
              <td style="padding: 2px 0; font-size: 11px; color: #6b7280;">
                Roma &middot; Milano &middot; Napoli &middot; Palermo &middot; Latina
              </td>
            </tr>
            <tr>
              <td style="padding: 2px 0; font-size: 11px; color: #6b7280;">
                <a href="https://www.legalit.it" style="color: ${FIRM_COLOR}; text-decoration: none;">www.legalit.it</a>
                &nbsp;&middot;&nbsp;
                <a href="mailto:info@legalit.it" style="color: ${FIRM_COLOR}; text-decoration: none;">info@legalit.it</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 2px 0; font-size: 11px; color: #6b7280;">
                PEC: <a href="mailto:legalitsocieta@pec.it" style="color: ${FIRM_COLOR}; text-decoration: none;">legalitsocieta@pec.it</a>
              </td>
            </tr>
          </table>
          <p style="margin: 12px 0 0 0; font-size: 9px; color: #9ca3af; line-height: 1.4; max-width: 480px;">
            Questa comunicazione &egrave; riservata e destinata esclusivamente al destinatario indicato. Se avete ricevuto questo messaggio per errore, vi preghiamo di cancellarlo e di informarci immediatamente.
          </p>
        </td>
      </tr>
    </table>
  `;
}

function emailWrapper(title: string, bodyContent: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Helvetica Neue', Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 24px 16px;">
        <div style="background-color: ${FIRM_COLOR}; padding: 24px 28px; border-radius: 8px 8px 0 0;">
          <table style="width: 100%;">
            <tr>
              <td>
                <img src="https://legalit.it/attached_assets/logo_legalit_cropped.png" alt="LEGALIT" style="height: 40px; display: block;" />
              </td>
              <td style="text-align: right;">
                <p style="margin: 0; font-size: 10px; color: rgba(255,255,255,0.7); letter-spacing: 0.5px;">SOCIET&Agrave; TRA AVVOCATI</p>
              </td>
            </tr>
          </table>
        </div>
        <div style="background-color: white; border: 1px solid #e5e7eb; border-top: none; padding: 28px; border-radius: 0 0 8px 8px;">
          <h2 style="margin: 0 0 20px 0; font-size: 18px; color: #1f2937; font-weight: 600;">${title}</h2>
          ${bodyContent}
          ${firmSignature()}
        </div>
      </div>
    </body>
    </html>
  `;
}

async function sendBrevoEmail(params: {
  sender: { email: string; name: string };
  to: { email: string; name?: string }[];
  replyTo?: { email: string; name?: string };
  subject: string;
  htmlContent: string;
}): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.log("[Email] Brevo API key not configured - email not sent");
    return false;
  }

  try {
    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: params.sender,
        to: params.to,
        replyTo: params.replyTo,
        subject: params.subject,
        htmlContent: params.htmlContent,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[Email] Brevo API error:", response.status, errorBody);
      return false;
    }

    const result = await response.json();
    console.log("[Email] Sent via Brevo, messageId:", result.messageId);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send via Brevo:", error);
    return false;
  }
}

interface ContactEmailParams {
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  targetEmail: string;
}

export async function sendContactEmail(params: ContactEmailParams): Promise<boolean> {
  const safeName = escapeHtml(params.name);
  const safeEmail = escapeHtml(params.email);
  const safePhone = params.phone ? escapeHtml(params.phone) : null;
  const safeSubject = escapeHtml(params.subject);
  const safeMessage = escapeHtml(params.message);

  const subjectLine = `[Legalit.it] Nuovo messaggio: ${safeSubject}`;
  const bodyContent = `
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; font-weight: 600; color: #374151; width: 120px; font-size: 14px;">Nome:</td>
        <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">${safeName}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: 600; color: #374151; font-size: 14px;">Email:</td>
        <td style="padding: 8px 0; color: #1f2937; font-size: 14px;"><a href="mailto:${safeEmail}" style="color: ${FIRM_COLOR};">${safeEmail}</a></td>
      </tr>
      ${safePhone ? `<tr>
        <td style="padding: 8px 0; font-weight: 600; color: #374151; font-size: 14px;">Telefono:</td>
        <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">${safePhone}</td>
      </tr>` : ''}
      <tr>
        <td style="padding: 8px 0; font-weight: 600; color: #374151; font-size: 14px;">Oggetto:</td>
        <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">${safeSubject}</td>
      </tr>
    </table>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
    <div style="color: #1f2937; line-height: 1.6; font-size: 14px; white-space: pre-wrap;">${safeMessage}</div>
  `;

  const htmlContent = emailWrapper("Nuovo messaggio dal sito web", bodyContent);

  const sent = await sendBrevoEmail({
    sender: { email: "noreply@legalit.it", name: "LEGALIT" },
    to: [{ email: params.targetEmail }],
    replyTo: { email: params.email, name: params.name },
    subject: subjectLine,
    htmlContent,
  });

  if (sent) {
    console.log("[Email] Sent contact email to:", params.targetEmail);
  }
  return sent;
}

export async function sendPasswordResetEmail(email: string, resetUrl: string): Promise<boolean> {
  const safeEmail = escapeHtml(email);
  const subjectLine = "[LEGALIT] Reset della password";
  const bodyContent = `
    <p style="color: #1f2937; line-height: 1.6; font-size: 14px; margin: 0 0 16px 0;">
      Hai richiesto il reset della password per il tuo account <strong>${safeEmail}</strong>.
    </p>
    <p style="color: #1f2937; line-height: 1.6; font-size: 14px; margin: 0 0 24px 0;">
      Clicca il pulsante qui sotto per impostare una nuova password:
    </p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="${resetUrl}" style="background-color: ${FIRM_COLOR}; color: white; padding: 14px 36px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block; letter-spacing: 0.3px;">
        Reimposta Password
      </a>
    </div>
    <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0 0 16px 0;">
      Se non hai richiesto il reset della password, ignora questa email. Il link scadr&agrave; tra <strong>1 ora</strong>.
    </p>
    <div style="background-color: ${FIRM_COLOR_LIGHT}; border-radius: 6px; padding: 12px 16px; margin-top: 16px;">
      <p style="color: #6b7280; font-size: 11px; line-height: 1.4; margin: 0;">
        Se il pulsante non funziona, copia e incolla questo link nel tuo browser:<br/>
        <a href="${resetUrl}" style="color: ${FIRM_COLOR}; word-break: break-all; font-size: 11px;">${resetUrl}</a>
      </p>
    </div>
  `;

  const htmlContent = emailWrapper("Reset della Password", bodyContent);

  const sent = await sendBrevoEmail({
    sender: { email: "noreply@legalit.it", name: "LEGALIT" },
    to: [{ email }],
    subject: subjectLine,
    htmlContent,
  });

  if (sent) {
    console.log("[Email] Sent password reset email to:", email);
  }
  return sent;
}

export async function sendLoginCodeEmail(email: string, code: string): Promise<boolean> {
  const safeEmail = escapeHtml(email);
  const subjectLine = `[LEGALIT] Codice di accesso: ${code}`;
  const bodyContent = `
    <p style="color: #1f2937; line-height: 1.6; font-size: 14px; margin: 0 0 16px 0;">
      Hai richiesto un codice di accesso per il tuo account <strong>${safeEmail}</strong>.
    </p>
    <p style="color: #1f2937; line-height: 1.6; font-size: 14px; margin: 0 0 24px 0;">
      Inserisci il seguente codice nella pagina di accesso:
    </p>
    <div style="text-align: center; margin: 28px 0;">
      <div style="display: inline-block; background-color: ${FIRM_COLOR_LIGHT}; border: 2px solid ${FIRM_COLOR}; border-radius: 8px; padding: 16px 40px;">
        <span style="font-size: 32px; font-weight: 700; color: ${FIRM_COLOR}; letter-spacing: 8px; font-family: 'Courier New', monospace;">
          ${code}
        </span>
      </div>
    </div>
    <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0 0 8px 0;">
      Il codice scadr&agrave; tra <strong>10 minuti</strong>.
    </p>
    <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0;">
      Se non hai richiesto questo codice, ignora questa email. Nessun accesso verr&agrave; effettuato senza inserire il codice.
    </p>
  `;

  const htmlContent = emailWrapper("Codice di Accesso", bodyContent);

  const sent = await sendBrevoEmail({
    sender: { email: "noreply@legalit.it", name: "LEGALIT" },
    to: [{ email }],
    subject: subjectLine,
    htmlContent,
  });

  if (sent) {
    console.log("[Email] Sent login code email to:", email);
  }
  return sent;
}

export async function sendInviteEmail(email: string, inviteUrl: string, inviterName: string): Promise<boolean> {
  const safeEmail = escapeHtml(email);
  const safeInviterName = escapeHtml(inviterName);
  const subjectLine = "[LEGALIT] Invito alla piattaforma";
  const bodyContent = `
    <p style="color: #1f2937; line-height: 1.6; font-size: 14px; margin: 0 0 16px 0;">
      <strong>${safeInviterName}</strong> ti ha invitato a unirti alla piattaforma LEGALIT come partner.
    </p>
    <p style="color: #1f2937; line-height: 1.6; font-size: 14px; margin: 0 0 24px 0;">
      Clicca il pulsante qui sotto per completare la registrazione:
    </p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="${inviteUrl}" style="background-color: ${FIRM_COLOR}; color: white; padding: 14px 36px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block; letter-spacing: 0.3px;">
        Completa Registrazione
      </a>
    </div>
    <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0 0 16px 0;">
      L'invito &egrave; valido per <strong>48 ore</strong> ed &egrave; riservato all'indirizzo <strong>${safeEmail}</strong>.
    </p>
    <div style="background-color: ${FIRM_COLOR_LIGHT}; border-radius: 6px; padding: 12px 16px; margin-top: 16px;">
      <p style="color: #6b7280; font-size: 11px; line-height: 1.4; margin: 0;">
        Se il pulsante non funziona, copia e incolla questo link nel tuo browser:<br/>
        <a href="${inviteUrl}" style="color: ${FIRM_COLOR}; word-break: break-all; font-size: 11px;">${inviteUrl}</a>
      </p>
    </div>
  `;

  const htmlContent = emailWrapper("Invito alla Piattaforma", bodyContent);

  const sent = await sendBrevoEmail({
    sender: { email: "noreply@legalit.it", name: "LEGALIT" },
    to: [{ email }],
    subject: subjectLine,
    htmlContent,
  });

  if (sent) {
    console.log("[Email] Sent invite email to:", email);
  }
  return sent;
}

interface JobApplicationEmailParams {
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  position: string;
}

export async function sendJobApplicationEmail(params: JobApplicationEmailParams): Promise<boolean> {
  const safeName = escapeHtml(params.name);
  const safeEmail = escapeHtml(params.email);
  const safePhone = params.phone ? escapeHtml(params.phone) : null;
  const safePosition = escapeHtml(params.position);
  const safeMessage = escapeHtml(params.message);

  const subjectLine = `[Legalit.it] Nuova candidatura: ${safePosition}`;
  const bodyContent = `
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; font-weight: 600; color: #374151; width: 120px; font-size: 14px;">Posizione:</td>
        <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">${safePosition}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: 600; color: #374151; font-size: 14px;">Nome:</td>
        <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">${safeName}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: 600; color: #374151; font-size: 14px;">Email:</td>
        <td style="padding: 8px 0; color: #1f2937; font-size: 14px;"><a href="mailto:${safeEmail}" style="color: ${FIRM_COLOR};">${safeEmail}</a></td>
      </tr>
      ${safePhone ? `<tr>
        <td style="padding: 8px 0; font-weight: 600; color: #374151; font-size: 14px;">Telefono:</td>
        <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">${safePhone}</td>
      </tr>` : ''}
    </table>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
    <h3 style="color: #374151; margin: 0 0 8px 0; font-size: 14px;">Lettera di presentazione:</h3>
    <div style="color: #1f2937; line-height: 1.6; font-size: 14px; white-space: pre-wrap;">${safeMessage}</div>
  `;

  const htmlContent = emailWrapper("Nuova Candidatura", bodyContent);

  const sent = await sendBrevoEmail({
    sender: { email: "noreply@legalit.it", name: "LEGALIT" },
    to: [{ email: "recruitment@legalit.it" }],
    replyTo: { email: params.email, name: params.name },
    subject: subjectLine,
    htmlContent,
  });

  if (sent) {
    console.log("[Email] Sent job application email for:", params.position);
  }
  return sent;
}
