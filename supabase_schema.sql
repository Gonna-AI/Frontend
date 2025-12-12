-- Create the contacts table
create table if not exists contacts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  full_name text not null,
  company_name text not null,
  email text not null,
  phone text not null,
  interest text,
  employee_count text,
  message text not null
);

-- Enable Row Level Security (RLS)
alter table contacts enable row level security;

-- Create policy to allow anyone (anon) to insert data
create policy "Enable insert for everyone" 
on contacts for insert 
to anon 
with check (true);

-- Optional: Create policy to allow service role to do everything (enabled by default mostly)
-- You typically do NOT want public users to read contacts, so no SELECT policy for anon.
