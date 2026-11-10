/**
 * Legal identity of the site operator. Single source for the imprint, the
 * privacy policy, the terms and the contact page.
 *
 * The optional fields are required in the imprint under German law (§ 5 DDG)
 * as soon as they exist: fill them in and they appear on /imprint.
 */
export type Company = {
  /** Registered name including the legal form, e.g. "ClerkTree GmbH". */
  legalName: string;
  street: string;
  postalCode: string;
  city: string;
  country: { en: string; de: string };
  email: string;
  securityEmail: string;
  phone: string;
  phoneHref: string;
  /** Persons authorised to represent the company, e.g. managing directors. */
  representatives?: string[];
  /** Commercial register entry. */
  register?: { court: string; number: string };
  /** VAT identification number under § 27a UStG. */
  vatId?: string;
  /** Person responsible for editorial content under § 18 (2) MStV; defaults to the company address. */
  editorialResponsible?: string;
};

export const COMPANY: Company = {
  legalName: 'ClerkTree',
  street: 'Industriestraße 2',
  postalCode: '94315',
  city: 'Straubing',
  country: { en: 'Germany', de: 'Deutschland' },
  email: 'team@clerktree.com',
  securityEmail: 'security@clerktree.com',
  phone: '+49 176 83075116',
  phoneHref: 'tel:+4917683075116',
};

export const SITE_URL = 'https://clerktree.com';

/** Date the legal texts were last revised (ISO). */
export const LEGAL_LAST_UPDATED = '2026-11-10';
