const welcomeTemplate = ({ name }) => ({
  subject: "Bienvenue sur G-Tech CV 🎉",
  text: `Bonjour ${name}, bienvenue sur G-Tech CV ! Créez votre premier CV professionnel dès maintenant.`,
  html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#1e40af,#3b82f6);padding:40px 48px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:28px;font-weight:800;">G‑Tech CV</h1>
            <p style="color:rgba(255,255,255,0.75);margin:8px 0 0;font-size:14px;">La plateforme n°1 pour votre carrière en Guinée</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 48px;">
            <h2 style="color:#0f172a;margin:0 0 16px;font-size:22px;">Bienvenue, ${name} ! 👋</h2>
            <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 28px;">
              Votre compte G-Tech CV est prêt. Créez un CV professionnel en moins de 5 minutes.
            </p>
            <div style="text-align:center;">
              <a href="${process.env.FRONTEND_URL}/templates"
                style="display:inline-block;background:linear-gradient(135deg,#1e40af,#3b82f6);color:#fff;text-decoration:none;padding:14px 36px;border-radius:12px;font-weight:700;font-size:15px;">
                Créer mon premier CV →
              </a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#f8fafc;padding:24px 48px;text-align:center;border-top:1px solid #e2e8f0;">
            <p style="color:#94a3b8;font-size:12px;margin:0;">© ${new Date().getFullYear()} G-Tech Academy · Conakry, Guinée</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim(),
});

export default welcomeTemplate;
