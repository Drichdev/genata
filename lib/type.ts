export const supportedTypes = [
  { label: 'Prénom', value: 'first_name' },
  { label: 'Nom', value: 'last_name' },
  { label: 'Email', value: 'email' },
  { label: 'Mot de passe', value: 'password' },
  { label: 'Téléphone', value: 'phone' },
  { label: 'Adresse', value: 'address' },
  { label: 'Ville', value: 'city' },
  { label: 'Pays', value: 'country' },
  { label: 'Code postal', value: 'zip' },
  { label: 'Date', value: 'date' },
  { label: 'DateTime', value: 'datetime' },
  { label: 'Âge (int)', value: 'int' },
  { label: 'Nombre décimal', value: 'float' },
  { label: 'UUID', value: 'uuid' },
  { label: 'Booléen', value: 'boolean' },
  { label: 'ID (auto-incr.)', value: 'id_increment' },
  { label: 'Nombre', value: 'number' },
  { label: '0 ou 1', value: 'zero_one' },
] as const;
export type FieldType = (typeof supportedTypes)[number]['value'];

export interface Field {
  name: string;
  type: FieldType;
}
