-- Grant admin role to fondrkova.natalia@gmail.com
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM public.profiles
WHERE email = 'fondrkova.natalia@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;