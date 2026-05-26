import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../config/supabase';
import type {
  CRMCompany, CRMContact, CRMDeal, CRMActivity,
  CRMPipeline, CRMPipelineStage,
} from '../types/crm';

const K = {
  pipeline:   ['crm', 'pipeline'] as const,
  stages:     (pid: string) => ['crm', 'stages', pid] as const,
  deals:      ['crm', 'deals'] as const,
  contacts:   ['crm', 'contacts'] as const,
  companies:  ['crm', 'companies'] as const,
  activities: ['crm', 'activities'] as const,
};

// ── Pipeline ──────────────────────────────────────────────────
export function useCRMPipeline() {
  return useQuery({
    queryKey: K.pipeline,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_pipelines')
        .select('*')
        .order('created_at')
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as CRMPipeline | null;
    },
  });
}

export function useCRMStages(pipelineId: string | undefined) {
  return useQuery({
    queryKey: K.stages(pipelineId ?? ''),
    enabled: !!pipelineId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_pipeline_stages')
        .select('*')
        .eq('pipeline_id', pipelineId!)
        .order('position');
      if (error) throw error;
      return (data ?? []) as CRMPipelineStage[];
    },
  });
}

export function useInitPipeline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.rpc('crm_seed_default_pipeline', {
        p_user_id: userId,
      });
      if (error) throw error;
      return data as string;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['crm'] }),
  });
}

// ── Deals ─────────────────────────────────────────────────────
export function useCRMDeals() {
  return useQuery({
    queryKey: K.deals,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_deals')
        .select(`
          *,
          crm_companies(id, name, logo_url),
          crm_contacts(id, first_name, last_name, avatar_url),
          crm_pipeline_stages(id, name, color, position)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as CRMDeal[];
    },
  });
}

export function useCreateDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (deal: Partial<CRMDeal> & { name: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('crm_deals')
        .insert({ ...deal, owner_id: user?.id })
        .select()
        .single();
      if (error) throw error;
      return data as CRMDeal;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: K.deals }),
  });
}

export function useUpdateDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<CRMDeal> & { id: string }) => {
      const { data, error } = await supabase
        .from('crm_deals')
        .update(patch)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as CRMDeal;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: K.deals }),
  });
}

export function useDeleteDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('crm_deals').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: K.deals }),
  });
}

// ── Contacts ──────────────────────────────────────────────────
export function useCRMContacts() {
  return useQuery({
    queryKey: K.contacts,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_contacts')
        .select('*, crm_companies(id, name, logo_url)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as CRMContact[];
    },
  });
}

export function useCreateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (contact: Partial<CRMContact> & { first_name: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('crm_contacts')
        .insert({ ...contact, owner_id: user?.id })
        .select()
        .single();
      if (error) throw error;
      return data as CRMContact;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: K.contacts }),
  });
}

export function useUpdateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<CRMContact> & { id: string }) => {
      const { data, error } = await supabase
        .from('crm_contacts')
        .update(patch)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as CRMContact;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: K.contacts }),
  });
}

export function useDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('crm_contacts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: K.contacts }),
  });
}

// ── Companies ─────────────────────────────────────────────────
export function useCRMCompanies() {
  return useQuery({
    queryKey: K.companies,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_companies')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as CRMCompany[];
    },
  });
}

export function useCreateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (company: Partial<CRMCompany> & { name: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('crm_companies')
        .insert({ ...company, owner_id: user?.id })
        .select()
        .single();
      if (error) throw error;
      return data as CRMCompany;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: K.companies }),
  });
}

export function useUpdateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<CRMCompany> & { id: string }) => {
      const { data, error } = await supabase
        .from('crm_companies')
        .update(patch)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as CRMCompany;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: K.companies }),
  });
}

export function useDeleteCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('crm_companies').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: K.companies }),
  });
}

// ── Activities ────────────────────────────────────────────────
export function useCRMActivities(filters?: {
  deal_id?: string;
  contact_id?: string;
  company_id?: string;
}) {
  return useQuery({
    queryKey: [...K.activities, filters],
    queryFn: async () => {
      let q = supabase
        .from('crm_activities')
        .select('*')
        .order('created_at', { ascending: false });
      if (filters?.deal_id)    q = q.eq('deal_id', filters.deal_id);
      if (filters?.contact_id) q = q.eq('contact_id', filters.contact_id);
      if (filters?.company_id) q = q.eq('company_id', filters.company_id);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as CRMActivity[];
    },
  });
}

export function useCreateActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (activity: Partial<CRMActivity> & { type: CRMActivity['type'] }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('crm_activities')
        .insert({ ...activity, owner_id: user?.id })
        .select()
        .single();
      if (error) throw error;
      return data as CRMActivity;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: K.activities }),
  });
}
