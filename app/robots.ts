import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/auth/", "/settings/", "/profile/"],
      },
    ],
    sitemap: "https://sunday4k.life/sitemap.xml",
  };
}
