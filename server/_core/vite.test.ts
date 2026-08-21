import { describe, expect, it } from "vitest";
import { getViteServerOptions } from "./vite";

describe("getViteServerOptions", () => {
  it("routes the HMR client through the managed HTTPS preview origin", () => {
    const previousProjectId = process.env.MANUS_WEBDEV_PROJECT_ID;
    process.env.MANUS_WEBDEV_PROJECT_ID = "preview-project";

    const httpServer = {} as never;
    const options = getViteServerOptions(httpServer);

    expect(options.hmr).toMatchObject({
      server: httpServer,
      protocol: "wss",
      clientPort: 443,
    });

    if (previousProjectId === undefined) {
      delete process.env.MANUS_WEBDEV_PROJECT_ID;
    } else {
      process.env.MANUS_WEBDEV_PROJECT_ID = previousProjectId;
    }
  });
});
