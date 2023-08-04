const config = useRuntimeConfig();
import { IncomingMessage } from "http";
import { capitalize, getDomainWithoutWWW } from "./utils";
import UAParser from "ua-parser-js";
import * as url from "url";
import { Address4, Address6 } from "ip-address";
// import { conn } from "./planetscale";

/**
 * Recording clicks with geo, ua, referer and timestamp data
 * If key is not specified, record click as the root click ("_root", e.g. dub.sh, vercel.fyi)
 **/
async function recordClick(
  domain: string,
  req: IncomingMessage,
  linkTo: string
) {
  const ip =
    // req.headers["x-real-ip"] ||
    req.headers["x-forwarded-for"];
  // req.headers["cf-connecting-ip"];
  console.log("Client:", ip);

  const data = await (await fetch(`http://ip-api.com/json/${ip}`)).json();
  console.log("Client:", data);

  // Get the geolocation information from the response
  const geo = {
    country: data.country || "",
    city: data.city || "",
    // Add any other properties you need from the response
  };
  const rawua = req.headers["user-agent"];
  let parser = new UAParser(rawua);
  const ua = parser.getResult();
  const referer = req.headers["referer"];

  return await Promise.allSettled([
    fetch(
      "https://api.tinybird.co/v0/events?name=demo_custom_data_2766&wait=true",
      {
        method: "POST",
        body: JSON.stringify({
          date: new Date(Date.now()).toISOString(),
          country: geo?.country || "Unknown",
          city: geo?.city || "Unknown",
          // region: geo?.region || "Unknown",
          // latitude: geo?.latitude || "Unknown",
          // longitude: geo?.longitude || "Unknown",
          ua: ua.ua || "Unknown",
          browser: ua.browser.name || "Unknown",
          device: ua.device.type ? capitalize(ua.device.type) : "Desktop",
          referrer: referer ? referer : "(direct)",
          linkTo: linkTo || "",
          os: ua.name || "",
          bot: "nobot",
        }),
        headers: {
          Authorization: `Bearer ${process.env.TINYBIRD_API_KEY}`,
        },
      }
    ).then((res) => res.json()),
    // increment the click count for the link if key is specified (not root click)
    // also increment the usage count for the project, and then we have a cron that will reset it at the start of new billing cycle
    // TODO: might wanna include root clicks in the usage count as well?
    // ...(key && conn
    //   ? [
    //       conn.execute(
    //         "UPDATE Link SET clicks = clicks + 1 WHERE domain = ? AND `key` = ?",
    //         [domain, key],
    //       ),
    //       conn.execute(
    //         "UPDATE Project p JOIN Domain d ON p.id = d.projectId SET p.usage = p.usage + 1 WHERE d.slug = ?",
    //         [domain],
    //       ),
    //     ]
    //   : []),
  ]);
}

async function getTopLinks(domains: string[]) {
  return await fetch(
    `https://api.tinybird.co/v0/pipes/top_links.json?domains=${domains.join(
      ","
    )}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TINYBIRD_API_KEY}`,
      },
    }
  )
    .then((res) => res.json())
    .then(({ data }) =>
      data.map((link: { domain: string; key: string; clicks: number }) => ({
        link: `${link.domain}/${link.key}`,
        clicks: link.clicks,
      }))
    );
}

export default defineEventHandler(async (event) => {
  console.log("visited");
  const params = url.parse(event.node.req.url as string, true).query;
  const { linkTo } = params;
  try {
    const ip =
      // req.headers["x-real-ip"] ||
      event.node.req.headers["x-forwarded-for"];
    // req.headers["cf-connecting-ip"];
    console.log("Client:", ip);

    const data = await (await fetch(`http://ip-api.com/json/${ip}`)).json();
    console.log("Client:", data);

    // Get the geolocation information from the response
    const geo = {
      country: data.country || "",
      city: data.city || "",
      // Add any other properties you need from the response
    };
    const rawua = event.node.req.headers["user-agent"];
    let parser = new UAParser(rawua);
    const ua = parser.getResult();
    const referer = event.node.req.headers["referer"];
    return await fetch(
      "https://api.tinybird.co/v0/events?name=demo_custom_data_2766",
      {
        method: "POST",
        body: JSON.stringify({
          date: new Date(Date.now()).toISOString(),
          country: geo?.country || "Unknown",
          city: geo?.city || "Unknown",
          // region: geo?.region || "Unknown",
          // latitude: geo?.latitude || "Unknown",
          // longitude: geo?.longitude || "Unknown",
          ua: ua.ua || "Unknown",
          browser: ua.browser.name || "Unknown",
          device: ua.device.type ? capitalize(ua.device.type) : "Desktop",
          referrer: referer
            ? referer.split("://")[1].split("/")[0]
            : "(direct)",
          linkTo: linkTo || "",
          os: ua.os.name || "",
          bot: "nobot",
        }),
        headers: {
          Authorization: `Bearer ` + process.env.TINYBIRD_ADD_KEY,
        },
      }
    ).then((res) => res.json());
  } catch (e) {
    console.log(e);
    return { err: e };
  }
});
