import esbuild from "esbuild";

export class ESBuild {
  private ctx!: esbuild.BuildContext<esbuild.BuildOptions>;
  private watch?: boolean = false;

  get isWatching() {
    return this.watch;
  }

  async init(options: esbuild.BuildOptions, watch?: boolean) {
    this.watch = watch;
    this.ctx = await esbuild.context(options);
  }

  async start() {
    if (this.watch) {
      await this.ctx.watch();
    } else {
      await this.ctx.rebuild();
    }
  }

  async dispose() {
    if (this.ctx) {
      await this.ctx.dispose();
    }
  }

  async cancel() {
    await this.ctx.cancel();
  }
}
