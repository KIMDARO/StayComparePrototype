/**
 * Browser-only demo auth for StayCompare (LocalStorage).
 * Not a production auth system — good for GitHub Pages prototypes.
 */
(function (root) {
  const USERS_KEY = "staycompare_users_v1";
  const SESSION_KEY = "staycompare_session_v1";

  function loadJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function saveJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function uid() {
    return Math.random().toString(16).slice(2) + Date.now().toString(16);
  }

  async function hashPassword(password, salt) {
    const enc = new TextEncoder();
    const data = enc.encode(`${salt}:${password}`);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  function getUsers() {
    return loadJson(USERS_KEY, []);
  }

  function saveUsers(users) {
    saveJson(USERS_KEY, users);
  }

  function publicUser(user) {
    if (!user) return null;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      universityId: user.universityId || "",
      budgetWeekly: user.budgetWeekly || "",
      bio: user.bio || "",
      savedIds: Array.isArray(user.savedIds) ? user.savedIds : [],
      compareIds: Array.isArray(user.compareIds) ? user.compareIds : [],
      createdAt: user.createdAt
    };
  }

  function getSessionUser() {
    const session = loadJson(SESSION_KEY, null);
    if (!session?.userId) return null;
    const user = getUsers().find((u) => u.id === session.userId);
    return publicUser(user);
  }

  function setSession(userId) {
    saveJson(SESSION_KEY, { userId, at: Date.now() });
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  async function signup({ name, email, password, universityId, budgetWeekly }) {
    const cleanName = String(name || "").trim();
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanPassword = String(password || "");

    if (cleanName.length < 2) return { ok: false, error: "Enter your name." };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return { ok: false, error: "Enter a valid email." };
    }
    if (cleanPassword.length < 6) {
      return { ok: false, error: "Password must be at least 6 characters." };
    }

    const users = getUsers();
    if (users.some((u) => u.email === cleanEmail)) {
      return { ok: false, error: "An account with that email already exists." };
    }

    const salt = uid();
    const passwordHash = await hashPassword(cleanPassword, salt);
    const user = {
      id: uid(),
      name: cleanName,
      email: cleanEmail,
      salt,
      passwordHash,
      universityId: universityId || "",
      budgetWeekly: budgetWeekly ? String(budgetWeekly) : "",
      bio: "",
      savedIds: [],
      compareIds: [],
      createdAt: new Date().toISOString()
    };

    users.push(user);
    saveUsers(users);
    setSession(user.id);
    return { ok: true, user: publicUser(user) };
  }

  async function login({ email, password }) {
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanPassword = String(password || "");
    const user = getUsers().find((u) => u.email === cleanEmail);
    if (!user) return { ok: false, error: "No account found for that email." };

    const passwordHash = await hashPassword(cleanPassword, user.salt);
    if (passwordHash !== user.passwordHash) {
      return { ok: false, error: "Incorrect password." };
    }

    setSession(user.id);
    return { ok: true, user: publicUser(user) };
  }

  function logout() {
    clearSession();
    return { ok: true };
  }

  function updateProfile(patch) {
    const session = loadJson(SESSION_KEY, null);
    if (!session?.userId) return { ok: false, error: "Not signed in." };

    const users = getUsers();
    const idx = users.findIndex((u) => u.id === session.userId);
    if (idx === -1) return { ok: false, error: "Account not found." };

    const next = { ...users[idx] };
    if (patch.name != null) {
      const name = String(patch.name).trim();
      if (name.length < 2) return { ok: false, error: "Enter your name." };
      next.name = name;
    }
    if (patch.universityId != null) next.universityId = String(patch.universityId);
    if (patch.budgetWeekly != null) next.budgetWeekly = String(patch.budgetWeekly || "");
    if (patch.bio != null) next.bio = String(patch.bio).slice(0, 280);
    if (Array.isArray(patch.savedIds)) next.savedIds = patch.savedIds;
    if (Array.isArray(patch.compareIds)) next.compareIds = patch.compareIds;

    users[idx] = next;
    saveUsers(users);
    return { ok: true, user: publicUser(next) };
  }

  function requireUser() {
    return getSessionUser();
  }

  root.StayCompareAuth = {
    getSessionUser,
    signup,
    login,
    logout,
    updateProfile,
    requireUser,
    publicUser
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
