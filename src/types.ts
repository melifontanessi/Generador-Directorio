export interface ContactCard {
  id: string;
  title: string;
  subtitle?: string;
  phone?: string;
  secondaryPhone?: string;
  contacts?: string;
  emails?: string[];
  extraText?: string;
}
