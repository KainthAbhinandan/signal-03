# Changelog

Released changes are listed newest first. The running game's version is read exclusively from package.json at build time; this file records release history.

## [0.1.1] — 2026-10-29

- Ship production dependency license notices with every static build; preserve a missing upstream Colord notice locally.
- Exclude secrets, local Cloudflare state and temporary verification outputs from Git publication.
- Prepare the public repository, deployment checklist, playtest plan and honest AI-assisted hiring materials. No gameplay or probability changes.

This is the release-packaging patch. First-playtest findings originally planned for this number move to the next patch; the playtest document records that explicitly.

## [0.1.0] — 2026-10-29

- Initial versioned portfolio preview of SIGNAL / 03: three procedural reels, independent outcomes, demo credits, original synthesized audio and accessible HTML controls.
- Responsive layout, reduced motion, visibility pause/resume and guarded spin/cancellation lifecycle.
- Cloudflare Pages static deployment instructions with GitHub integration, free-tier setup and production verification.
- Package-driven version label in the bottom-right footer for screenshots and player bug reports.

The earlier local scaffold used 1.0.0 as placeholder package metadata; it was not a published portfolio release. This preview starts at 0.1.0 as requested. The first complete portfolio release will be 1.0.0.

## Version policy

- Patch: fixes and small polish changes (for example, 0.1.1).
- Minor: added features (for example, 0.2.0).
- 1.0.0: the first complete portfolio release after the remaining device, accessibility and listening checks.

Only add dated release entries when preparing a verified release; keep upcoming work under an optional Unreleased heading. Never reassign an already published version to different code.
