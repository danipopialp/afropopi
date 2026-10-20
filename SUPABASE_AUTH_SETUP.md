# Afropopi Supabase Auth setup

This branch adds a browser-side Supabase Auth UI to the existing static Afropopi site. It preserves the current site and adds email/password sign-up, sign-in, email confirmation messaging, password reset, session restoration, and sign-out.

## 1. Create a Supabase project

1. Create a project at https://supabase.com/dashboard.
2. In **Project Settings → API Keys** (or the project's **Connect** dialog), copy the **Project URL** and **publishable key**.
3. Edit `supabase-config.js` and replace both placeholders:
   - `YOUR_SUPABASE_PROJECT_URL`
   - `YOUR_SUPABASE_PUBLISHABLE_KEY`

The publishable key is designed for browser use. **Never place a Supabase secret key or legacy `service_role` key in frontend code.** The browser can expose its configuration; permissions for any future database tables must be enforced with Row Level Security (RLS).

## 2. Configure email auth and redirects

In Supabase Dashboard:

1. Open **Authentication → Sign In / Providers** and ensure Email is enabled.
2. Keep email confirmation enabled for production.
3. Under **Authentication → URL Configuration**, set the Site URL to your deployed Afropopi URL and add the exact deployed URL to the allowed Redirect URLs. Add your local development URL too if you test locally.
4. Test the confirmation and password-reset email links from the same site origin you have allow-listed.

The default Supabase email sender is rate-limited and intended for initial testing. Configure custom SMTP before a public launch.

## 3. Test the flow

1. Open the site and select **Create account**.
2. Register with an email you can access and a password of at least six characters.
3. If confirmation is enabled, open the email link and return to Afropopi.
4. Sign in, refresh the page to check session restoration, then sign out.
5. Use **Forgot your password?** to test reset email and the new-password form.

## Files changed

- `index.html`: Supabase browser SDK, config/auth scripts, account buttons, and the auth dialog.
- `auth.css`: styling that reuses the existing dark-purple theme and responsive layout.
- `auth.js`: sign-up, sign-in, reset, session state, and sign-out handlers.
- `supabase-config.js`: public project URL and publishable-key placeholders.

## Security notes and current limits

- Supabase Auth verifies credentials; this website does not store raw passwords itself.
- The Supabase JS client persists and refreshes browser sessions. A browser session is not a substitute for server-side authorization.
- The current site remains a static frontend. This adds authentication UI, but it does **not** make existing demo chat messages persistent, nor does it create protected server routes or user-owned database records.
- Before storing profiles, chat messages, uploads, or other private data, create appropriate tables and enable/test RLS policies that restrict access to the authenticated user's own rows.
- Do not treat a hidden UI element as access control; enforce permissions in the database or trusted backend.
