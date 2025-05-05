// types/ytdl-core.d.ts
import { Readable } from "stream";

declare module "ytdl-core" {
  interface DownloadOptions {
    quality?: string;
    filter?: string | string[];
  }
  function ytdl(url: string, options?: DownloadOptions): Readable;
  namespace ytdl {
    function getInfo(url: string, options?: any): Promise<any>;
  }
  export = ytdl;
}
