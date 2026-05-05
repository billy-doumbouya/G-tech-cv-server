const paymentReminderTemplate = ({ name, cvTitle, paymentUrl, completionScore }) => ({
  subject: `💼 Votre CV "${cvTitle}" attend d'être débloqué`,
  text: `Bonjour ${name}, votre CV "${cvTitle}" est complété à ${completionScore}% mais pas encore payé. Débloquez-le : ${paymentUrl}`,
  html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,#d97706,#f59e0b);padding:32px 48px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800;">G‑Tech CV</h1>
        </td></tr>
        <tr><td style="padding:40px 48px;">
          <h2 style="color:#0f172a;margin:0 0 12px;">Bonjour ${name},</h2>
          <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 20px;">
            Votre CV <strong>"${cvTitle}"</strong> est complété à <strong>${completionScore}%</strong>. Il ne reste qu'une étape !
          </p>
          <div style="background:#fffbeb;border:2px solid #fcd34d;border-radius:12px;padding:20px 24px;text-align:center;margin-bottom:28px;">
            <p style="color:#92400e;font-size:28px;font-weight:800;margin:0;">50 000 GNF</p>
            <p style="color:#b45309;font-size:12px;margin:4px 0 0;">Orange Money ou MTN MoMo</p>
          </div>
          <div style="text-align:center;">
            <a href="${paymentUrl}" style="display:inline-block;background:linear-gradient(135deg,#d97706,#f59e0b);color:#fff;text-decoration:none;padding:14px 40px;border-radius:12px;font-weight:700;font-size:15px;">
              🔓 Débloquer mon CV
            </a>
          </div>
        </td></tr>
        <tr><td style="background:#f8fafc;padding:20px 48px;text-align:center;border-top:1px solid #e2e8f0;">
          <p style="color:#94a3b8;font-size:11px;margin:0;">© ${new Date().getFullYear()} G-Tech Academy · Conakry, Guinée</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim(),
});

export default paymentReminderTemplate;
