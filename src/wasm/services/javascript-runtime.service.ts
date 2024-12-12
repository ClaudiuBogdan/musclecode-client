export interface JavaScriptRuntimeResult {
  success: boolean;
  result?: unknown;
  error?: string;
  stdout?: string;
  stderr?: string;
}

interface RuntimeOutput {
  stdout: string[];
  stderr: string[];
}

export class JavaScriptRuntime {
  private output: RuntimeOutput = {
    stdout: [],
    stderr: [],
  };

  constructor() {
    this.resetOutput();
  }

  private resetOutput(): void {
    this.output = {
      stdout: [],
      stderr: [],
    };
  }

  private createSandbox(): Record<string, unknown> {
    // Create a safe console implementation
    const console = {
      log: (...args: unknown[]) =>
        this.output.stdout.push(args.map(String).join(" ")),
      error: (...args: unknown[]) =>
        this.output.stderr.push(args.map(String).join(" ")),
      warn: (...args: unknown[]) =>
        this.output.stderr.push(args.map(String).join(" ")),
      info: (...args: unknown[]) =>
        this.output.stdout.push(args.map(String).join(" ")),
    };

    // Return a restricted set of safe globals
    return {
      console,
      setTimeout,
      clearTimeout,
      Date,
      Math,
      JSON,
      String,
      Number,
      Boolean,
      Array,
      Object,
      Error,
      Map,
      Set,
      Promise,
      RegExp,
      undefined,
      NaN,
      Infinity,
    };
  }

  private async executeCode(code: string): Promise<unknown> {
    const sandbox = this.createSandbox();
    const sandboxKeys = Object.keys(sandbox);
    const sandboxValues = Object.values(sandbox);

    try {
      // Create an async function to allow for Promise resolution
      const AsyncFunction = Object.getPrototypeOf(
        async function () {}
      ).constructor;
      const fn = new AsyncFunction(...sandboxKeys, `"use strict";\n${code}`);
      return await fn(...sandboxValues);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  async execute(code: string): Promise<JavaScriptRuntimeResult> {
    this.resetOutput();

    try {
      const executionResult = await this.executeCode(code);

      return {
        success: true,
        result: executionResult,
        stdout: this.output.stdout.join("\n"),
        stderr: this.output.stderr.join("\n"),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        stderr: error instanceof Error ? error.stack : String(error),
      };
    }
  }

  destroy(): void {
    this.resetOutput();
  }
}
