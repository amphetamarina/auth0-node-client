import open from "open";
import { sleep } from "./misc";

/* eslint-disable no-console */
export const openBrowser = async (url: string) => {
  console.groupCollapsed();
  console.log();
  console.log("Attempting to open browser for auth. Please visit this link if it does not open automatically.");
  console.log();
  console.log(url);
  console.log();
  console.groupEnd();

  await sleep(500);
  await open(url);
  await sleep(500);
};