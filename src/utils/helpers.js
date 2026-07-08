export const formatEuro = (amount) => {
  if (!amount && amount !== 0) return '—';
  return '€' + new Intl.NumberFormat('en-US').format(Math.round(amount));
};

export const PRODUCT_TYPES = [
  'climatiseur_fixe',
  'climatiseur_mobile',
  'ventilateur',
];

export const BRANDS = [
  'Daikin', 'Mitsubishi', 'Hitachi', 'LG', 'Samsung',
  'Midea', 'Gree', 'Panasonic', 'Toshiba', 'Sharp',
  'Dyson', 'Rowenta', 'Airconfort', 'Technibel', 'Atlantic',
];

export const ENERGY_CLASSES = ['A+++', 'A++', 'A+', 'A', 'B', 'C', 'D'];

export function timeAgo(date) {
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export const STATUS_LABELS = {
  pending: 'Demande reçue',
  confirmed: 'Confirmée',
  preparing: 'En préparation',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

export const PRODUCT_STATUS_LABELS = {
  available: 'En stock',
  out_of_stock: 'Rupture',
  discontinued: 'Arrêté',
};

export function getInitials(name) {
  return name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??';
}

export function getProductTypeLabel(type, lang = 'fr') {
  const labels = {
    climatiseur_fixe: { fr: 'Climatiseur fixe', nl: 'Vaste airco', en: 'Fixed AC' },
    climatiseur_mobile: { fr: 'Climatiseur mobile', nl: 'Mobiele airco', en: 'Portable AC' },
    ventilateur: { fr: 'Ventilateur', nl: 'Ventilator', en: 'Fan' },
  };
  return labels[type]?.[lang] || labels[type]?.fr || type;
}

export function getTypeIcon(type) {
  const icons = {
    climatiseur_fixe: '🏗',
    climatiseur_mobile: '🔄',
    ventilateur: '💨',
  };
  return icons[type] || '❄';
}
