import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "../shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { buildPublicSiteArchive, SiteCrawlerError } from "./services/siteCrawler";
import { storagePut } from "./storage";
import { createEphemeralArchiveDownload } from "./archiveDownloads";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  packer: router({
    create: publicProcedure
      .input(z.object({
        url: z.string().trim().min(4).max(2048),
        acceptsPermissions: z.literal(true),
        options: z.object({
          includeSameOriginPages: z.boolean().default(false),
          includeSourceMaps: z.boolean().default(false),
          preserveStructure: z.boolean().default(true),
          renameAssets: z.boolean().default(true),
        }),
      }))
      .mutation(async ({ input }) => {
        try {
          const archive = await buildPublicSiteArchive(input.url, input.options);
          const hostname = new URL(input.url.includes("://") ? input.url : `https://${input.url}`).hostname
            .replace(/^www\./, "")
            .replace(/[^a-z0-9.-]/gi, "-");
          const archiveName = `${hostname || "website"}-sitepack.zip`;
          let downloadUrl: string;
          try {
            ({ url: downloadUrl } = await storagePut(
              `sitepack-archives/${hostname}-${Date.now()}.zip`,
              archive.buffer,
              "application/zip",
            ));
          } catch (storageError) {
            console.warn("[Archive] Managed object storage is unavailable; using a 15-minute server download.", storageError instanceof Error ? storageError.message : storageError);
            ({ downloadUrl } = createEphemeralArchiveDownload(archive.buffer, archiveName));
          }
          return {
            downloadUrl,
            archiveName,
            ...archive.summary,
            skipped: archive.skipped.slice(0, 12),
          };
        } catch (error) {
          if (error instanceof SiteCrawlerError) {
            throw new TRPCError({
              code: error.code === "LIMIT_REACHED" ? "PAYLOAD_TOO_LARGE" : "BAD_REQUEST",
              message: error.message,
            });
          }
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "The archive could not be prepared. Please try a different public page.",
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
