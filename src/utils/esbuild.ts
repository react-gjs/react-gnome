import esbuild from "esbuild";

export class ESBuild {
  private ctx!: esbuild.BuildContext<esbuild.BuildOptions>;
  private watch?: boolean = false;

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
    if (this.ctx && !this.watch) {
      await this.ctx.dispose();
    }
  }

  async cancel() {
    // TODO: this is an incoming feature in esbuild
    // remove the ts-expect-error when it's released
    // @ts-expect-error
    await this.ctx.cancel();
  }
}
