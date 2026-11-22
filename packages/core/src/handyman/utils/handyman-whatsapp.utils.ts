export const buildWhatsAppUrl = (phone: string | null, text: string) =>
  `https://wa.me/${phone ? phone.slice(1) : ""}?text=${encodeURIComponent(text)}`;
