import { ContactCard } from "./types";
import { getWhatsAppUrl } from "./utils/whatsapp";

export function generateStyleSheetHtml(heroCards: ContactCard[], cards: ContactCard[]): string {
  // 1. Process Hero Cards
  const hero1 = heroCards.find(c => c.id === "hero-1") || {
    title: "Atención al cliente",
    phone: "(0341) 4202900",
    emails: ["info@drogueria20dejunio.com.ar"]
  };
  const hero2 = heroCards.find(c => c.id === "hero-2") || {
    title: "Express20",
    phone: "+54 9 3412 50-0806",
    extraText: "Enviar mensaje"
  };

  const cleanWaNumber = hero2.phone ? hero2.phone.replace(/[^0-9]/g, "") : "5493412500806";
  const hero2WaUrl = getWhatsAppUrl(hero2.phone) || `https://wa.me/${cleanWaNumber}`;

  const hero1EmailsHtml = hero1.emails && hero1.emails.length > 0
    ? hero1.emails.map(email => `<div class="hero-email"><a href="mailto:${email}" class="directorio-link">${email}</a></div>`).join("")
    : "";

  // 2. Process Grid Cards by sections
  const getCardsListHtml = (cardsList: ContactCard[]) => {
    return cardsList
      .map((card) => {
        let subtitleHtml = "";
        if (card.subtitle) {
          subtitleHtml = `\n      <div class="directorio-subtitle">${card.subtitle}</div>`;
        }

        let phoneHtml = "";
        if (card.phone) {
          const waUrl = getWhatsAppUrl(card.phone);
          if (waUrl) {
            phoneHtml = `\n      <div class="directorio-item"><a href="${waUrl}" target="_blank" class="directorio-link" style="font-weight: 600;">${card.phone}</a></div>`;
          } else {
            phoneHtml = `\n      <div class="directorio-item">${card.phone}</div>`;
          }
        }

        let secPhoneHtml = "";
        if (card.secondaryPhone) {
          const waUrl = getWhatsAppUrl(card.secondaryPhone);
          if (waUrl) {
            secPhoneHtml = `\n      <div class="directorio-item"><a href="${waUrl}" target="_blank" class="directorio-link" style="font-weight: 600;">${card.secondaryPhone}</a></div>`;
          } else {
            secPhoneHtml = `\n      <div class="directorio-item">${card.secondaryPhone}</div>`;
          }
        }

        let contactsHtml = "";
        if (card.contacts) {
          contactsHtml = `\n      <div class="directorio-item">${card.contacts}</div>`;
        }

        let emailsHtml = "";
        if (card.emails && card.emails.length > 0) {
          emailsHtml = card.emails
            .map((email) => {
              return `\n      <div class="directorio-item">Email: <a href="mailto:${email}" class="directorio-link">${email}</a></div>`;
            })
            .join("");
        }

        let extraHtml = "";
        if (card.extraText) {
          extraHtml = `\n      <div class="directorio-item">${card.extraText}</div>`;
        }

        return `    <!-- Tarjeta: ${card.title} -->
    <div class="directorio-card">
      <h3 class="directorio-title">${card.title}</h3>${subtitleHtml}
      <div class="directorio-content">${phoneHtml}${secPhoneHtml}${contactsHtml}${emailsHtml}${extraHtml}
      </div>
    </div>`;
      })
      .join("\n\n");
  };

  const ejecutivosCards = cards.filter(c => c.subtitle === "Ejecutivo de cuentas");
  const otrosCards = cards.filter(c => c.subtitle !== "Ejecutivo de cuentas");

  const ejecutivosHtml = getCardsListHtml(ejecutivosCards);
  const otrosHtml = getCardsListHtml(otrosCards);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contactos internos - Droguería 20 de Junio</title>
  <style>
    /* Estilos generales */
    body {
      background-color: #f1f5f9;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }

    /* Contenedor principal */
    .directorio-container {
      max-width: 1240px;
      margin: 40px auto;
      padding: 0 24px;
      box-sizing: border-box;
    }

    /* Título de la página */
    .directorio-header-title {
      font-size: 32px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 0;
      margin-bottom: 24px;
      letter-spacing: -0.02em;
      text-align: center;
    }

    /* Títulos de sección */
    .seccion-header {
      text-align: center;
      margin-top: 40px;
      margin-bottom: 24px;
    }

    .seccion-title {
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    /* Fila de héroes superiores */
    .hero-row {
      display: grid;
      grid-template-columns: 1fr;
      gap: 24px;
      margin-bottom: 24px;
    }

    @media (min-width: 768px) {
      .hero-row {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    /* Tarjetas de Héroes superiores */
    .hero-card {
      background-color: #ffffff;
      border-radius: 12px;
      padding: 24px;
      border: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      gap: 20px;
      box-sizing: border-box;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    /* Icono de atención */
    .hero-icon-container {
      width: 56px;
      height: 56px;
      background-color: #0091ff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      flex-shrink: 0;
    }

    /* Logo Express20 */
    .express-logo-container {
      flex-shrink: 0;
    }

    .express-logo-text {
      font-size: 32px;
      font-weight: 800;
      font-style: italic;
      color: #0091ff;
      letter-spacing: -0.04em;
    }

    .express-logo-suffix {
      color: #0a40a4;
      font-weight: 900;
    }

    /* Información interna de los Héroes */
    .hero-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .hero-title {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 2px 0;
    }

    .hero-phone {
      font-size: 15px;
      font-weight: 500;
      color: #334155;
    }

    .hero-email {
      font-size: 14px;
    }

    /* Elementos de Whatsapp */
    .whatsapp-container {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 4px;
    }

    .whatsapp-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      background-color: #25d366;
      border-radius: 50%;
      color: white;
      font-size: 11px;
    }

    .whatsapp-link {
      font-size: 14px;
      color: #25d366;
      text-decoration: none;
      font-weight: 600;
    }

    .whatsapp-link:hover {
      text-decoration: underline;
    }

    /* Grid principal para tarjetas estándar */
    .directorio-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 24px;
      box-sizing: border-box;
    }

    @media (min-width: 768px) {
      .directorio-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (min-width: 1024px) {
      .directorio-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    /* Estilo de cada tarjeta estándar */
    .directorio-card {
      background-color: #ffffff;
      border-radius: 12px;
      padding: 24px;
      border: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      box-sizing: border-box;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .directorio-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
    }

    /* Título del sector/área */
    .directorio-title {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 6px 0;
      line-height: 1.25;
      letter-spacing: -0.01em;
    }

    /* Subtítulo o aclaración adicional */
    .directorio-subtitle {
      font-size: 13.5px;
      font-style: italic;
      color: #64748b;
      margin-top: -2px;
      margin-bottom: 12px;
    }

    /* Bloque contenedor de información */
    .directorio-content {
      font-size: 13.5px;
      color: #334155;
      line-height: 1.6;
    }

    /* Líneas de contacto individuales */
    .directorio-item {
      margin-bottom: 6px;
    }
    
    .directorio-item:last-child {
      margin-bottom: 0;
    }

    /* Estilo de los enlaces */
    .directorio-link {
      color: #0091ff;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.15s ease;
    }

    .directorio-link:hover {
      color: #0070c9;
      text-decoration: underline;
    }
  </style>
</head>
<body>

  <div class="directorio-container">
    <h1 class="directorio-header-title">Contactos internos</h1>

    <!-- Tarjetas Héroes Superiores -->
    <div class="hero-row">
      
      <!-- Atención al Cliente -->
      <div class="hero-card">
        <div class="hero-icon-container">
          <!-- SVG Headset / Support Icon -->
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        <div class="hero-info">
          <h2 class="hero-title">${hero1.title}</h2>
          <div class="hero-phone">${hero1.phone}</div>
          ${hero1EmailsHtml}
        </div>
      </div>

      <!-- Express20 WhatsApp -->
      <div class="hero-card">
        <div class="express-logo-container">
          <div class="express-logo-text">Express<span class="express-logo-suffix">20</span></div>
        </div>
        <div class="hero-info">
          <div class="hero-phone"><a href="${hero2WaUrl}" target="_blank" style="color: inherit; text-decoration: none;">${hero2.phone}</a></div>
          <div class="whatsapp-container">
            <span class="whatsapp-badge">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.37 5.378 0 12.01 0a11.948 11.948 0 0 1 8.495 3.519 11.938 11.938 0 0 1 3.49 8.493c-.003 6.635-5.378 12.008-12.01 12.008-.13 0-2.073-.02-3.855-.544L0 24zm5.822-4.572l.417.247c1.71.1.912.806 2.628.2.33-.12.444-.316.544-.65 2.14 1.15 4.672 1.764 7.245 1.765 5.518 0 10.01-4.49 10.014-10.008a9.948 9.948 0 0 0-2.919-7.098c-1.9-1.9-4.425-2.946-7.096-2.946-5.52 0-10.013 4.49-10.016 10.009-.001 2.378.625 4.7 1.812 6.745l.265.457-1.082 3.95 4.053-1.062z"/>
              </svg>
            </span>
            <a href="${hero2WaUrl}" target="_blank" class="whatsapp-link">${hero2.extraText || "Enviar mensaje"}</a>
          </div>
        </div>
      </div>

    </div>

    <!-- Sección Ejecutivos Comerciales -->
    <div class="seccion-header">
      <h2 class="seccion-title">Ejecutivos comerciales</h2>
    </div>
    <div class="directorio-grid" style="margin-bottom: 40px;">
${ejecutivosHtml}
    </div>

    <!-- Sección Otros Sectores -->
    <div class="seccion-header">
      <h2 class="seccion-title">Sectores e Internos</h2>
    </div>
    <div class="directorio-grid">
${otrosHtml}
    </div>
  </div>

</body>
</html>`;
}

export function generateInlineHtml(heroCards: ContactCard[], cards: ContactCard[]): string {
  // 1. Process Hero Cards
  const hero1 = heroCards.find(c => c.id === "hero-1") || {
    title: "Atención al cliente",
    phone: "(0341) 4202900",
    emails: ["info@drogueria20dejunio.com.ar"]
  };
  const hero2 = heroCards.find(c => c.id === "hero-2") || {
    title: "Express20",
    phone: "+54 9 3412 50-0806",
    extraText: "Enviar mensaje"
  };

  const cleanWaNumber = hero2.phone ? hero2.phone.replace(/[^0-9]/g, "") : "5493412500806";
  const hero2WaUrl = getWhatsAppUrl(hero2.phone) || `https://wa.me/${cleanWaNumber}`;

  const containerStyle = `background-color: #f1f5f9; padding: 40px 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box;`;
  const innerContainerStyle = `max-width: 1240px; margin: 0 auto; box-sizing: border-box;`;
  const titleHeaderStyle = `font-size: 32px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 24px; letter-spacing: -0.02em; text-align: center;`;
  const seccionHeaderStyle = `text-align: center; margin-top: 40px; margin-bottom: 24px;`;
  const seccionTitleStyle = `font-size: 24px; font-weight: 700; color: #0f172a; margin: 0;`;
  
  // Hero section grid (responsive auto-fit up to 2 columns)
  const heroGridStyle = `display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; margin-bottom: 24px; box-sizing: border-box;`;
  const heroCardStyle = `background-color: #ffffff; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 20px; box-sizing: border-box; box-shadow: 0 1px 3px rgba(0,0,0,0.05);`;
  const heroIconStyle = `width: 56px; height: 56px; background-color: #0091ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ffffff; flex-shrink: 0;`;
  
  const logoTextStyle = `font-size: 32px; font-weight: 800; font-style: italic; color: #0091ff; letter-spacing: -0.04em;`;
  const logoSuffixStyle = `color: #0a40a4; font-weight: 900;`;
  
  const heroInfoStyle = `display: flex; flex-direction: column; gap: 4px;`;
  const heroTitleStyle = `font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 2px 0;`;
  const heroPhoneStyle = `font-size: 15px; font-weight: 500; color: #334155;`;
  const heroEmailStyle = `font-size: 14px;`;
  
  const waContainerStyle = `display: flex; align-items: center; gap: 8px; margin-top: 4px;`;
  const waBadgeStyle = `display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; background-color: #25d366; border-radius: 50%; color: white; font-size: 11px;`;
  const waLinkStyle = `font-size: 14px; color: #25d366; text-decoration: none; font-weight: 600;`;

  // Standard cards grid
  const gridStyle = `display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; box-sizing: border-box;`;
  const cardStyle = `background-color: #ffffff; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; justify-content: flex-start; box-sizing: border-box; box-shadow: 0 1px 3px rgba(0,0,0,0.05);`;
  const titleStyle = `font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 6px 0; line-height: 1.25; letter-spacing: -0.01em;`;
  const subtitleStyle = `font-size: 13.5px; font-style: italic; color: #64748b; margin-top: -2px; margin-bottom: 12px;`;
  const contentStyle = `font-size: 13.5px; color: #334155; line-height: 1.6;`;
  const itemStyle = `margin-bottom: 6px;`;
  const linkStyle = `color: #0091ff; text-decoration: none; font-weight: 500;`;

  const hero1EmailsHtml = hero1.emails && hero1.emails.length > 0
    ? hero1.emails.map(email => `<div style="${heroEmailStyle}"><a href="mailto:${email}" style="${linkStyle}">${email}</a></div>`).join("")
    : "";

  const getCardsListHtmlInline = (cardsList: ContactCard[]) => {
    return cardsList
      .map((card) => {
        let subtitleHtml = "";
        if (card.subtitle) {
          subtitleHtml = `\n      <div style="${subtitleStyle}">${card.subtitle}</div>`;
        }

        let phoneHtml = "";
        if (card.phone) {
          const waUrl = getWhatsAppUrl(card.phone);
          if (waUrl) {
            phoneHtml = `\n      <div style="${itemStyle}"><a href="${waUrl}" target="_blank" style="${linkStyle} font-weight: 600;">${card.phone}</a></div>`;
          } else {
            phoneHtml = `\n      <div style="${itemStyle}">${card.phone}</div>`;
          }
        }

        let secPhoneHtml = "";
        if (card.secondaryPhone) {
          const waUrl = getWhatsAppUrl(card.secondaryPhone);
          if (waUrl) {
            secPhoneHtml = `\n      <div style="${itemStyle}"><a href="${waUrl}" target="_blank" style="${linkStyle} font-weight: 600;">${card.secondaryPhone}</a></div>`;
          } else {
            secPhoneHtml = `\n      <div style="${itemStyle}">${card.secondaryPhone}</div>`;
          }
        }

        let contactsHtml = "";
        if (card.contacts) {
          contactsHtml = `\n      <div style="${itemStyle}">${card.contacts}</div>`;
        }

        let emailsHtml = "";
        if (card.emails && card.emails.length > 0) {
          emailsHtml = card.emails
            .map((email) => {
              return `\n      <div style="${itemStyle}">Email: <a href="mailto:${email}" style="${linkStyle}">${email}</a></div>`;
            })
            .join("");
        }

        let extraHtml = "";
        if (card.extraText) {
          extraHtml = `\n      <div style="${itemStyle}">${card.extraText}</div>`;
        }

        return `    <!-- Tarjeta: ${card.title} -->
    <div style="${cardStyle}">
      <h3 style="${titleStyle}">${card.title}</h3>${subtitleHtml}
      <div style="${contentStyle}">${phoneHtml}${secPhoneHtml}${contactsHtml}${emailsHtml}${extraHtml}
      </div>
    </div>`;
      })
      .join("\n\n");
  };

  const ejecutivosCards = cards.filter(c => c.subtitle === "Ejecutivo de cuentas");
  const otrosCards = cards.filter(c => c.subtitle !== "Ejecutivo de cuentas");

  const ejecutivosHtml = getCardsListHtmlInline(ejecutivosCards);
  const otrosHtml = getCardsListHtmlInline(otrosCards);

  return `<div style="${containerStyle}">
  <div style="${innerContainerStyle}">
    <h1 style="${titleHeaderStyle}">Contactos internos</h1>

    <!-- Tarjetas Héroes Superiores -->
    <div style="${heroGridStyle}">
      
      <!-- Atención al Cliente -->
      <div style="${heroCardStyle}">
        <div style="${heroIconStyle}">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        <div style="${heroInfoStyle}">
          <h2 style="${heroTitleStyle}">${hero1.title}</h2>
          <div style="${heroPhoneStyle}">${hero1.phone}</div>
          ${hero1EmailsHtml}
        </div>
      </div>

      <!-- Express20 WhatsApp -->
      <div style="${heroCardStyle}">
        <div style="flex-shrink: 0;">
          <div style="${logoTextStyle}">Express<span style="${logoSuffixStyle}">20</span></div>
        </div>
        <div style="${heroInfoStyle}">
          <div style="${heroPhoneStyle}"><a href="${hero2WaUrl}" target="_blank" style="color: inherit; text-decoration: none;">${hero2.phone}</a></div>
          <div style="${waContainerStyle}">
            <span style="${waBadgeStyle}">✓</span>
            <a href="${hero2WaUrl}" target="_blank" style="${waLinkStyle}">${hero2.extraText || "Enviar mensaje"}</a>
          </div>
        </div>
      </div>

    </div>

    <!-- Sección Ejecutivos Comerciales -->
    <div style="${seccionHeaderStyle}">
      <h2 style="${seccionTitleStyle}">Ejecutivos comerciales</h2>
    </div>
    <div style="${gridStyle} margin-bottom: 40px;">
${ejecutivosHtml}
    </div>

    <!-- Sección Otros Sectores -->
    <div style="${seccionHeaderStyle}">
      <h2 style="${seccionTitleStyle}">Sectores e Internos</h2>
    </div>
    <div style="${gridStyle}">
${otrosHtml}
    </div>
  </div>
</div>`;
}
