# SitePack Studio

SitePack Studio packages the **public, statically referenced frontend files** of a website that the requester is authorized to archive. The resulting ZIP can include HTML, CSS, JavaScript, module imports, source maps when selected, fonts, images, social-share assets, manifests, and other downloadable page resources.

> A public website URL does not expose private backend repositories, databases, environment variables, authentication sessions, API credentials, or non-public server code. For a website you own, retrieve backend source from its Git repository, hosting account, build artifact, or backup.

## Local development

Install dependencies with `pnpm install --frozen-lockfile`, start the development server with `pnpm dev`, run the test suite with `pnpm test`, and verify types with `pnpm check`.

## Render deployment

The included `render.yaml` creates a Node web service called `SitepackStudio`. Configure `TELEGRAM_BOT_TOKEN` and `TELEGRAM_WEBHOOK_SECRET` as Render environment variables; never commit them to GitHub. On Render, ZIPs use an expiring in-memory download route when Manus-managed object storage is not available, so users should download a generated archive within 15 minutes.

## Safety and scope

Use the archiver only for public sites and files you are entitled to copy. The application rejects private-network targets and follows the site’s robots policy. It does not bypass logins, paywalls, CAPTCHAs, or other access controls.
