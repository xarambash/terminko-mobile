import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

import { getResourcesByTenantId } from '../api/resources';
import { getTenantBySlug } from '../api/tenants';
import type { Resource } from '../api/types';

export type TenantSummary = {
  id: string;
  name: string;
  slug: string;
};

export type TenantReject = { code: 'missingSlug' | 'tenantNotFound' | 'network' };
export type ResourcesReject = { code: 'network' };

export const fetchTenantBySlug = createAsyncThunk<
  TenantSummary,
  string,
  { rejectValue: TenantReject }
>('booking/fetchTenant', async (slug, { rejectWithValue }) => {
  if (!slug.trim()) {
    return rejectWithValue({ code: 'missingSlug' });
  }
  try {
    const tenant = await getTenantBySlug(slug);
    return { id: tenant.id, name: tenant.name, slug: tenant.slug };
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 404) {
      return rejectWithValue({ code: 'tenantNotFound' });
    }
    return rejectWithValue({ code: 'network' });
  }
});

export const fetchResources = createAsyncThunk<Resource[], string, { rejectValue: ResourcesReject }>(
  'booking/fetchResources',
  async (tenantId, { rejectWithValue }) => {
    try {
      return await getResourcesByTenantId(tenantId);
    } catch {
      return rejectWithValue({ code: 'network' });
    }
  },
);
