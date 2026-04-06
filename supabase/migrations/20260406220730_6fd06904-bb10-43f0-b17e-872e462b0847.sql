
-- Block all client-side INSERT on subscriptions
CREATE POLICY "No client inserts on subscriptions"
ON public.subscriptions
FOR INSERT
TO authenticated
WITH CHECK (false);

-- Block all client-side UPDATE on subscriptions
CREATE POLICY "No client updates on subscriptions"
ON public.subscriptions
FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);

-- Block all client-side DELETE on subscriptions
CREATE POLICY "No client deletes on subscriptions"
ON public.subscriptions
FOR DELETE
TO authenticated
USING (false);
