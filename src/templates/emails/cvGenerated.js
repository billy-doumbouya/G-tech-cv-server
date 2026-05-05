const cvGeneratedTemplate = ({ name, cvTitle, downloadUrl }) => ({
  subject: `Votre CV "${cvTitle}" est prêt ! ✅`,
  text: `Bonjour ${name}, votre CV "${cvTitle}" est prêt. Téléchargez-le : ${downloadUrl}`,
  html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,#059669,#10b981);padding:32px 48px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800;">G‑Tech CV</h1>
        </td></tr>
        <tr><td style="padding:40px 48px;text-align:center;">
          <div style="font-size:52px;margin-bottom:20px;">🎉</div>
          <h2 style="color:#0f172a;margin:0 0 12px;">Félicitations, ${name} !</h2>
          <p style="color:#475569;font-size:15px;margin:0 0 32px;">
            Votre CV <strong>"${cvTitle}"</strong> est prêt à être téléchargé.
          </p>
          <a href="${downloadUrl}" style="display:inline-block;background:linear-gradient(135deg,#059669,#10b981);color:#fff;text-decoration:none;padding:14px 40px;border-radius:12px;font-weight:700;font-size:15px;">
            📄 Télécharger mon CV (PDF)
          </a>
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

export default cvGeneratedTemplate;
