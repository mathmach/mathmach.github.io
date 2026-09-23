<!--
  Conventional Commits Title Format:
    feat(scope): short description
    fix(scope): short description
    docs(scope): short description
    refactor(scope): short description
    chore(scope): short description
-->

## Summary

<!-- What does this PR do? Briefly describe intent and user/system impact. -->

## Motivation & Architecture Context

<!-- Why is this change necessary? Reference architectural docs, invariants, or issues. -->

## Changes

<!-- Detail changes grouped by layer: Domain, Application, Presentation, Infrastructure, Docs, or CI. -->

## Quality Verification Checklist

- [ ] **GitFlow Convention:** Branch follows naming standards (`feat/*`, `fix/*`, `chore/*`, `docs/*`, `refactor/*`)
- [ ] **Automated Tests:** `npm test` passes 100% (unit and integration suites)
- [ ] **Type Safety:** `npm run typecheck` clean (zero TypeScript errors)
- [ ] **Linter & Formatter:** `npm run format-and-lint` clean (zero Biome diagnostics)
- [ ] **Secrets & Security:** `gitleaks detect` clean (no unencrypted credentials, tokens, or private keys)
- [ ] **Environment Hygiene:** No `.env` or sensitive local configuration staged
- [ ] **Code Invariants:** Zero comments in code, zero dead code or orphan surfaces
- [ ] **Documentation:** Architectural documentation updated and mirrored if contracts changed

## Linked Issues

Closes #

