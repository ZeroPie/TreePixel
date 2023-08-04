import * as url from "url";
export default defineEventHandler(async (event) => {
  const params = url.parse(event.node.req.url as string, true).query;
  const { linkTo } = params;
  try {
    return await fetch(
      "https://api.tinybird.co/v0/datasources/demo_custom_data_2766/delete",
      {
        method: "POST",
        body: "delete_condition=(linkTo='" + linkTo + "')",
        headers: {
          Authorization: `Bearer p.eyJ1IjogIjA3MTAwYzlhLTg5NTMtNGE5ZC05Mzc2LWNkNzhiNjI2OTQ4YSIsICJpZCI6ICJmNGE3MTJhYi0yZThkLTQxOWItOGMyMS1kMTdkNDY2YmUyOWQiLCAiaG9zdCI6ICJldV9zaGFyZWQifQ.aydPss0TH0Yq3q7_eB7pf9x2rP_DxpcXt_LiM4N4tPg`,
          "Content-Type": "application/json",
        },
      }
    ).then((res) => res.json());
  } catch (e) {
    console.log(e);
    return { err: e };
  }
});
