/** Public tenant payload from GET /tenants/:slug */
export type Tenant = {
  id: string;
  name: string;
  slug: string;
  type?: string;
  timezone?: string;
  currency?: string;
  defaultLanguage?: string;
};

/** Resource row from GET /tenants/:tenantId/resources */
export type Resource = {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture: string | null;
  email?: string | null;
  phone?: string | null;
  isActive: boolean;
  displayOrder: number;
};
