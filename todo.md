# SitePack Studio crawler upgrade

- [x] Read the full-stack and automation guidance before changing architecture.
- [x] Upgrade the project to a server-backed full-stack setup.
- [x] Define crawl limits, same-origin behavior, timeout handling, and blocked/private-site errors.
- [x] Implement a crawl endpoint that fetches public HTML and discovers linked assets.
- [x] Download CSS, JavaScript, images, fonts, media, icons, and source maps where publicly accessible.
- [x] Rewrite relative and absolute asset references to local ZIP paths.
- [x] Package the reconstructed site and manifest into a ZIP response.
- [x] Connect the frontend progress and download states to the crawl endpoint.
- [x] Validate successful packaging and representative error states.
- [x] Document limitations: authentication, bot protection, robots policies, dynamic runtime data, and legal permissions.
- [x] Add explicit user-facing wording that robots-policy restrictions can block an archive.
- [x] Save a delivery checkpoint and provide the project version.
