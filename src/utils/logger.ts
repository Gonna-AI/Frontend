import log from "loglevel";

const isProduction = process.env.NODE_ENV === "production";

log.setLevel(isProduction ? "warn" : "debug");

export default log;
