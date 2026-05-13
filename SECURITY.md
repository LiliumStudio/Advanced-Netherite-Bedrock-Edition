# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| Latest  | ✅ Yes    |
| Older   | ❌ No     |

## Reporting a Vulnerability

If you discover a security vulnerability in **Advanced Netherite (Port)**,
please **do NOT open a public issue**.

Report it privately through:
- **GitHub private security advisory** (preferred)
- **CurseForge** messages to Lilium Studio

We will try to respond within **72 hours**.

## Scope — What counts as a vulnerability?

Since this add-on uses the **Minecraft Script API v2.7.0**
(`@minecraft/server` and `@minecraft/server-ui`), the following are
considered security issues:

- Malicious or unintended behavior in any of the scripts
  (`Registry.js`, `ArmorSystem`, `DurabilitySystem`, etc.)
- Scripts that could corrupt a player's world or cause unintended
  data loss
- Exploits in the `ConverterSystem` or `LoreSystem` that allow
  item duplication or unintended game mechanics
- Any file (JSON or script) that could harm the user's device or
  Minecraft world

## Out of Scope — What does NOT count?

- Gameplay bugs or balance issues
- Recipe or crafting inconsistencies
- Crashes caused by incompatible add-on combinations
- Feature requests or suggestions

## Disclosure Policy

Once a vulnerability is confirmed, we will:
1. Work on a fix as soon as possible
2. Release a patched version
3. Credit the reporter (if desired)
