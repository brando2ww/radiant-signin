-- Enable realtime for delivery_orders table
ALTER TABLE public.delivery_orders REPLICA IDENTITY FULL;

-- Add table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_orders;