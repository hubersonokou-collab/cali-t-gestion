export const ORDER_STATUSES = [
  'commande',
  'preparation',
  'disponible',
  'livraison',
  'terminee',
  'annulee',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, { fr: string; en: string }> = {
  commande: { fr: 'Commande', en: 'Ordered' },
  preparation: { fr: 'Preparation du jus', en: 'Juice Preparation' },
  disponible: { fr: 'Disponible', en: 'Available' },
  livraison: { fr: 'Livraison en cours', en: 'Delivery in Progress' },
  terminee: { fr: 'Terminee', en: 'Completed' },
  annulee: { fr: 'Annulee', en: 'Cancelled' },
};

export const PRODUCT_FORMATS = ['25cl', '50cl', '1L'] as const;
export type ProductFormat = (typeof PRODUCT_FORMATS)[number];

export const PAYMENT_METHODS = ['cash', 'wave'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PHONE_COUNTRY_CODE = '+225';
export const CONTACT_PHONE = '05 54 39 49 64';
export const WHATSAPP_NUMBER = '2250554394964';

export const CURRENCY = 'FCFA';

export function formatPrice(amount: number): string {
  return `${amount.toLocaleString('fr-FR')} ${CURRENCY}`;
}
