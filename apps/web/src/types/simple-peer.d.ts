// The prebuilt browser bundle bundles simple-peer's Node polyfills; same API as the main entry.
declare module "simple-peer/simplepeer.min.js" {
  import Peer from "simple-peer";
  export default Peer;
}
