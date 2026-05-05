const resetPasswordTemplate = ({ name, resetUrl }) => ({
  subject: "Réinitialisation de votre mot de passe — G-Tech CV",
  text: `Bonjour ${name}, réinitialisez votre mot de passe (valable 30 min) : ${resetUrl}`,
  html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:#0f172a;padding:32px 48px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800;">G‑Tech CV</h1>
        </td></tr>
        <tr><td style="padding:40px 48px;">
          <h2 style="color:#0f172a;margin:0 0 12px;font-size:20px;text-align:center;">Réinitialisation du mot de passe</h2>
          <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 8px;">Bonjour ${name},</p>
          <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 28px;">
            Ce lien est valable <strong>30 minutes</strong>.
          </p>
          <div style="text-align:center;margin-bottom:28px;">
            <a href="${resetUrl}" style="display:inline-block;background:#dc2626;color:#fff;text-decoration:none;padding:14px 36px;border-radius:12px;font-weight:700;font-size:15px;">
              Réinitialiser mon mot de passe
            </a>
          </div>
          <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:16px 20px;">
            <p style="color:#dc2626;font-size:13px;margin:0;font-weight:600;">⚠️ Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
          </div>
        </td></tr>
        <tr><td style="background:#f8fafc;padding:20px 48px;text-align:center;border-top:1px solid #e2e8f0;">
          <p style="color:#94a3b8;font-size:12px;margin:0;">© ${new Date().getFullYear()} G-Tech Academy · Conakry, Guinée</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim(),
});

export default resetPasswordTemplate;
