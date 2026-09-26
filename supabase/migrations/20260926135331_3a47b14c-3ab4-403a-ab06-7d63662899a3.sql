create or replace function public.get_founder_orders_admin()
returns table(payment_id text, email text, created_at timestamptz, status text, amount integer)
language sql stable security definer set search_path = public as $$
  select l.payment_id,
    coalesce(pr.email, pe.email) as email,
    min(l.created_at) as created_at,
    (array_agg(coalesce(l.raw->>'mollie_status', l.status) order by l.created_at desc))[1] as status,
    max(l.amount) as amount
  from premium_activation_log l
  left join lateral (select p.email from profiles p where p.user_id = coalesce(l.user_id,
      (select f.user_id from founding_families f where f.payment_id = l.payment_id limit 1)) limit 1) pr on true
  left join lateral (select e.email from pending_account_emails e where e.payment_id = l.payment_id limit 1) pe on true
  where public.has_role(auth.uid(), 'admin') and l.amount = 2900 and l.payment_id is not null
  group by l.payment_id, pr.email, pe.email
  order by min(l.created_at) desc
  limit 1000
$$;
revoke all on function public.get_founder_orders_admin() from public, anon;
grant execute on function public.get_founder_orders_admin() to authenticated;