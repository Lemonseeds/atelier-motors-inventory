export const PAINT_OPTIONS = [
  { name: 'Glacier Silver', value: '#9faab5', price: 0 },
  { name: 'Obsidian Black', value: '#272d38', price: 1200 },
  { name: 'Pearl White', value: '#d9d9ce', price: 1200 },
  { name: 'Carmine Red', value: '#a43134', price: 1800 },
  { name: 'Midnight Blue', value: '#29486c', price: 1800 },
  { name: 'Forest Green', value: '#355d50', price: 1800 },
];

export const defaultConfiguration = { paint: 0, trim: 0, interior: 0 };
export const configuredPrice = (vehicle, selection = defaultConfiguration) => vehicle.price + PAINT_OPTIONS[selection.paint]?.price + (selection.trim ? 4500 : 0) + (selection.interior ? 1500 : 0);
