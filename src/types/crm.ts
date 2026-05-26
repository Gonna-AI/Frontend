export interface CRMCompany {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  domain: string | null;
  industry: string | null;
  size: string | null;
  logo_url: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  address: string | null;
  country: string | null;
  notes: string | null;
  owner_id: string | null;
}

export interface CRMContact {
  id: string;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  job_title: string | null;
  avatar_url: string | null;
  linkedin_url: string | null;
  notes: string | null;
  company_id: string | null;
  owner_id: string | null;
  crm_companies?: Pick<CRMCompany, 'id' | 'name' | 'logo_url'>;
}

export interface CRMPipeline {
  id: string;
  created_at: string;
  name: string;
  owner_id: string | null;
}

export interface CRMPipelineStage {
  id: string;
  pipeline_id: string;
  name: string;
  color: string;
  position: number;
  is_closed_won: boolean;
  is_closed_lost: boolean;
}

export interface CRMDeal {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  amount: number | null;
  currency: string;
  stage_id: string | null;
  company_id: string | null;
  contact_id: string | null;
  close_date: string | null;
  probability: number | null;
  notes: string | null;
  owner_id: string | null;
  crm_companies?: Pick<CRMCompany, 'id' | 'name' | 'logo_url'>;
  crm_contacts?: Pick<CRMContact, 'id' | 'first_name' | 'last_name' | 'avatar_url'>;
  crm_pipeline_stages?: Pick<CRMPipelineStage, 'id' | 'name' | 'color' | 'position'>;
}

export interface CRMActivity {
  id: string;
  created_at: string;
  updated_at: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task';
  title: string | null;
  body: string | null;
  deal_id: string | null;
  contact_id: string | null;
  company_id: string | null;
  due_date: string | null;
  completed: boolean;
  owner_id: string | null;
}

export type CRMView = 'board' | 'table';
export type CRMSection = 'deals' | 'contacts' | 'companies' | 'activities';
