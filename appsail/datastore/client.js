import catalyst from "zcatalyst-sdk-node";

export function getDatastore(req) {
  const app = catalyst.initialize(req);
  return app.datastore();
}
