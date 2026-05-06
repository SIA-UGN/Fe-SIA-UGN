## Plan: Resolve Hydration Mismatch and UI Asset Warnings

Stabilize first render in navigation so server and client produce the same initial DOM, then fix Logo image sizing consistency and favicon pathing. This removes the React hydration error, Next Image warning, and favicon 404 with low-risk targeted updates.

**Steps**
1. Phase 1: Baseline validation and scope lock
- Reproduce on a role-based session (mahasiswa and dosen) and confirm mismatch occurs at the Bimbingan menu trigger path.
- Capture current console/network baseline for three issues only: hydration mismatch, Logo image warning, and favicon 404.
- Exclude non-blocking logs like Echo connection state messages from scope.

2. Phase 2: Hydration mismatch remediation in nav role branching
- Update role derivation in Navbar so initial render does not switch structure between Link and Dropdown based on data that is still loading.
- In [src/components/ui/navigation-menu.jsx](src/components/ui/navigation-menu.jsx#L372), replace immediate cookie fallback usage with an auth-loading-safe role variable (for example, keep role null while user.loading is true).
- Apply the same deterministic role gate to both desktop branch [src/components/ui/navigation-menu.jsx](src/components/ui/navigation-menu.jsx#L63) and mobile branch [src/components/ui/navigation-menu.jsx](src/components/ui/navigation-menu.jsx#L118).
- Ensure the fallback branch uses the same element type on server and first client paint, then upgrade to dropdown only after auth state is settled.
- Keep existing dosen and mahasiswa destination behavior after loading is complete.

3. Phase 3: Logo image warning remediation (parallelizable across files)
- Standardize Logo image rendering strategy in all identified files so intrinsic dimensions and rendered dimensions stay consistent.
- Prefer one shared pattern across all Logo usages (recommended: container-relative fill with sizes, or matching explicit width and height with responsive styling that preserves aspect ratio).
- Apply consistently at:
  - [src/components/ui/navigation-menu.jsx](src/components/ui/navigation-menu.jsx#L39)
  - [src/components/ui/admin-navbar.jsx](src/components/ui/admin-navbar.jsx#L42)
  - [src/components/admin/admin-bimbingan-navbar.jsx](src/components/admin/admin-bimbingan-navbar.jsx#L42)
  - [src/components/ui/footer.jsx](src/components/ui/footer.jsx#L21)
  - [src/components/ui/loginform.jsx](src/components/ui/loginform.jsx#L125)

4. Phase 4: Favicon 404 remediation
- Add root favicon file expected by browser default request path at public/favicon.ico.
- Source can be copied from existing [public/icon/favicon.ico](public/icon/favicon.ico).
- Keep metadata in [src/app/layout.js](src/app/layout.js#L15) aligned so explicit icon links and default /favicon.ico request both resolve.

5. Phase 5: Verification and regression checks
- Run dev server and test with hard refresh on affected pages where navbar appears.
- Verify no hydration error in browser console when opening pages as mahasiswa and dosen.
- Verify no Next Image warning for /Logo.png while navigating pages that render each of the five Logo instances.
- Verify /favicon.ico returns 200 in network panel and tab icon loads correctly.
- Run diagnostics for changed files and perform quick navbar interaction checks (desktop dropdown, mobile sidebar menu links, role-based destinations).

**Relevant files**
- [src/components/ui/navigation-menu.jsx](src/components/ui/navigation-menu.jsx) — Main source of hydration mismatch via role-based Link vs Dropdown branching.
- [src/lib/auth-context.js](src/lib/auth-context.js#L8) — Auth loading lifecycle that determines when role is reliable.
- [src/features/bimbingan/components/BimbinganDropdown.jsx](src/features/bimbingan/components/BimbinganDropdown.jsx) — Dropdown trigger element type involved in mismatch.
- [src/features/bimbingan-ta/utils.ts](src/features/bimbingan-ta/utils.ts#L106) — Cookie role helper currently used as fallback.
- [src/components/ui/admin-navbar.jsx](src/components/ui/admin-navbar.jsx), [src/components/admin/admin-bimbingan-navbar.jsx](src/components/admin/admin-bimbingan-navbar.jsx), [src/components/ui/footer.jsx](src/components/ui/footer.jsx), [src/components/ui/loginform.jsx](src/components/ui/loginform.jsx), [src/components/ui/navigation-menu.jsx](src/components/ui/navigation-menu.jsx) — Logo image warning touchpoints.
- [src/app/layout.js](src/app/layout.js#L15) and [public/icon/favicon.ico](public/icon/favicon.ico) — Favicon configuration and source asset.

**Verification**
1. Start app and reproduce: open dashboard routes with navbar as dosen and mahasiswa, then hard refresh.
2. Confirm hydration error is absent and Bimbingan menu still shows correct role-specific entries.
3. Visit screens rendering each Logo usage and ensure no Next Image dimension warnings appear.
4. Confirm /favicon.ico request returns 200 and favicon displays in browser tab.
5. Run diagnostics on all touched files to ensure no new syntax or lint-level issues.

**Decisions**
- Included scope: hydration mismatch in nav, /Logo.png dimension warning, /favicon.ico 404.
- Excluded scope: Echo websocket logs and unrelated runtime logs.
- Recommended approach: deterministic initial nav tree first, then asset warnings fixes.

**Further Considerations**
1. If you want lower long-term maintenance, extract a single shared Logo component and reuse it in all five locations after this fix.
2. If role must be available before nav renders, add an explicit loading placeholder in nav rather than branching to structurally different elements.
