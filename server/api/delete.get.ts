import * as url from "url";
export default defineEventHandler(async (event) => {
  const params = url.parse(event.node.req.url as string, true).query;
  const { linkTo } = params;
  try {
    return await fetch(
      "https://api.tinybird.co/v0/datasources/demo_custom_data_2766/delete",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + process.env.TINYBIRD_DELETE_KEY,
        },
        body: "delete_condition=(linkTo='" + linkTo + "')",
      }
    ).then((res) => res.json());
  } catch (e) {
    console.log(e);
    return { err: e };
  }
});
