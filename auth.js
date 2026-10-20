/* Afropopi Auth — Supabase JS v2, browser-only frontend */
(() => {
  "use strict";

  const byId = (id) => document.getElementById(id);
  const overlay = byId("authOverlay");
  const status = byId("authStatus");
  const configNote = byId("authConfigNote");
  const authViews = [...document.querySelectorAll("[data-auth-view]")];
  let supabaseClient = null;
  let activeView = "signin";

  function setStatus(message, kind = "info") {
    if (!status) return;
    status.textContent = message;
    status.dataset.kind = kind;
  }

  function showView(view) {
    activeView = view;
    authViews.forEach((element) => {
      element.hidden = element.dataset.authView !== view;
    });
    document.querySelectorAll("[data-auth-tab]").forEach((tab) => {
      const selected = tab.dataset.authTab === view;
      tab.setAttribute("aria-selected", String(selected));
    });
    setStatus("");
  }

  function openAuth(view = "signin") {
    if (!overlay) return;
    overlay.hidden = false;
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("auth-open");
    showView(view);
    const firstInput = overlay.querySelector("[data-auth-view='" + view + "'] input");
    if (firstInput) firstInput.focus();
  }

  function closeAuth() {
    if (!overlay) return;
    overlay.hidden = true;
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("auth-open");
  }

  function getConfiguredClient() {
    if (supabaseClient) return supabaseClient;
    const url = window.AFROPOPI_SUPABASE_URL;
    const key = window.AFROPOPI_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key || url.includes("YOUR_SUPABASE") || key.includes("YOUR_SUPABASE")) {
      setStatus("Authentication setup is not finished yet. Add your Supabase Project URL and publishable key in supabase-config.js.", "error");
      if (configNote) configNote.hidden = false;
      return null;
    }
    try {
      supabaseClient = window.supabase.createClient(url, key, {
        auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true }
      });
      if (configNote) configNote.hidden = true;
      return supabaseClient;
    } catch (error) {
      setStatus("Could not initialize authentication. Check the Supabase configuration.", "error");
      return null;
    }
  }

  function renderSession(session) {
    const signedIn = Boolean(session && session.user);
    const openButton = byId("authOpenButton");
    const signOutButton = byId("authSignOutButton");
    const userLabel = byId("authUserLabel");
    if (openButton) { openButton.hidden = false; openButton.textContent = signedIn ? "Account" : "Sign in"; }
    if (signOutButton) signOutButton.hidden = !signedIn;
    if (userLabel) {
      userLabel.hidden = !signedIn;
      userLabel.textContent = signedIn ? (session.user.user_metadata?.display_name || session.user.email || "Signed in") : "";
    }
    if (signedIn && byId("authAccountEmail")) byId("authAccountEmail").textContent = session.user.email || "Email unavailable";
    if (signedIn && byId("authAccountName")) byId("authAccountName").textContent = session.user.user_metadata?.display_name || "Afropopi listener";
    if (signedIn && overlay && !overlay.hidden) {
      showView("account");
      setStatus("You are signed in.", "success");
    }
  }

  function friendlyError(error) {
    const message = (error && error.message) || "Something went wrong. Please try again.";
    if (/invalid login credentials/i.test(message)) return "Email or password is incorrect.";
    if (/password should be at least/i.test(message)) return "Choose a longer password (at least 6 characters).";
    if (/email not confirmed/i.test(message)) return "Please confirm your email using the link we sent you.";
    return message;
  }

  async function handleForm(form, action) {
    const client = getConfiguredClient();
    if (!client) return;
    const submit = form.querySelector('button[type="submit"]');
    if (submit) submit.disabled = true;
    setStatus("Please wait…");
    try {
      const email = (form.querySelector('[name="email"]')?.value || "").trim();
      const password = form.querySelector('[name="password"]')?.value || "";
      let result;

      if (action === "signup") {
        const displayName = (form.querySelector('[name="display_name"]')?.value || "").trim();
        if (password.length < 6) throw new Error("Password should be at least 6 characters.");
        result = await client.auth.signUp({
          email, password,
          options: {
            data: displayName ? { display_name: displayName } : {},
            emailRedirectTo: window.location.href.split("#")[0]
          }
        });
        if (result.error) throw result.error;
        if (result.data.session) {
          setStatus("Welcome to Afropopi! Your account is ready.", "success");
          renderSession(result.data.session);
        } else {
          setStatus("Account created. Check your email for a confirmation link before signing in.", "success");
        }
        form.reset();
      } else if (action === "signin") {
        result = await client.auth.signInWithPassword({ email, password });
        if (result.error) throw result.error;
        setStatus("Welcome back!", "success");
        form.reset();
        renderSession(result.data.session);
      } else if (action === "reset-request") {
        result = await client.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.href.split("#")[0]
        });
        if (result.error) throw result.error;
        setStatus("If an account can receive a reset link, check your email for next steps.", "success");
        form.reset();
      } else if (action === "reset-password") {
        if (password.length < 6) throw new Error("Password should be at least 6 characters.");
        result = await client.auth.updateUser({ password });
        if (result.error) throw result.error;
        setStatus("Password updated. You can continue using Afropopi.", "success");
        form.reset();
        showView("account");
      }
    } catch (error) {
      setStatus(friendlyError(error), "error");
    } finally {
      if (submit) submit.disabled = false;
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    byId("authOpenButton")?.addEventListener("click", () => {\n      const signedIn = Boolean(supabaseClient);\n      if (!signedIn) { openAuth("signin"); return; }\n      supabaseClient.auth.getSession().then(({ data }) => openAuth(data?.session ? "account" : "signin"));\n    });
    byId("authSignOutButton")?.addEventListener("click", async () => {
      const client = getConfiguredClient();
      if (!client) return;
      const { error } = await client.auth.signOut();
      if (error) {
        openAuth("account");
        setStatus("Could not sign out. Please try again.", "error");
        return;
      }
      renderSession(null);
      openAuth("signin");
      setStatus("You have signed out.", "success");
    });

    byId("authCloseButton")?.addEventListener("click", closeAuth);
    overlay?.addEventListener("click", (event) => {
      if (event.target === overlay) closeAuth();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && overlay && !overlay.hidden) closeAuth();
    });

    document.querySelectorAll("[data-auth-tab]").forEach((tab) => {
      tab.addEventListener("click", () => showView(tab.dataset.authTab));
    });
    byId("forgotPasswordLink")?.addEventListener("click", () => showView("reset-request"));
    byId("backToSignIn")?.addEventListener("click", () => showView("signin"));
    byId("authAccountButton")?.addEventListener("click", () => showView("account"));

    document.querySelectorAll("[data-auth-form]").forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        handleForm(form, form.dataset.authForm);
      });
    });

    const client = getConfiguredClient();
    if (client) {
      client.auth.onAuthStateChange((event, session) => {
        renderSession(session);
        if (event === "PASSWORD_RECOVERY") {
          openAuth("reset-password");
          setStatus("Choose a new password for your account.");
        }
      });
      client.auth.getSession().then(({ data, error }) => {
        if (error) setStatus("Could not restore your session. Please sign in again.", "error");
        renderSession(data?.session || null);
      });
    } else if (configNote) {
      configNote.hidden = false;
    }
  });
})();
