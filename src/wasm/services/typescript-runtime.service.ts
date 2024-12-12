import {
  Project,
  DiagnosticCategory,
  ts,
  SourceFile,
  DiagnosticMessageChain,
} from "ts-morph";

export interface TypeScriptRuntimeResult {
  success: boolean;
  result?: unknown;
  error?: string;
  diagnostics?: string[];
  stdout?: string;
  stderr?: string;
}

interface RuntimeOutput {
  stdout: string[];
  stderr: string[];
}

const DEFAULT_COMPILER_OPTIONS = {
  target: ts.ScriptTarget.ES2020,
  module: ts.ModuleKind.CommonJS,
  strict: true,
  esModuleInterop: true,
  skipLibCheck: true,
  noEmitOnError: false,
  experimentalDecorators: true,
  forceConsistentCasingInFileNames: true,
  moduleResolution: ts.ModuleResolutionKind.Classic,
  lib: ["lib.es2020.d.ts", "lib.dom.d.ts"],
};

export class TypeScriptRuntime {
  private readonly project: Project;
  private output: RuntimeOutput = {
    stdout: [],
    stderr: [],
  };

  constructor() {
    this.project = new Project({
      useInMemoryFileSystem: true,
      compilerOptions: DEFAULT_COMPILER_OPTIONS,
    });
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

    // Safe built-in objects and functions
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

  private formatMessageChain(message: string | DiagnosticMessageChain): string {
    if (typeof message === "string") {
      return message;
    }

    let result = message.getMessageText();
    const next = message.getNext();

    if (next) {
      result +=
        "\n" + next.map((chain) => `  → ${chain.getMessageText()}`).join("\n");
    }

    return result;
  }

  private getDiagnostics(sourceFile: SourceFile): string[] {
    return sourceFile
      .getPreEmitDiagnostics()
      .filter(
        (diagnostic) => diagnostic.getCategory() === DiagnosticCategory.Error
      )
      .map((diagnostic) => {
        const message = diagnostic.getMessageText();
        const position = diagnostic.getStart();
        const lineAndChar = position
          ? sourceFile.getLineAndColumnAtPos(position)
          : { line: 0, column: 0 };

        return `Line ${lineAndChar.line}, Column ${lineAndChar.column}: ${this.formatMessageChain(
          message
        )}`;
      });
  }

  private async executeCode(jsCode: string): Promise<unknown> {
    const sandbox = this.createSandbox();
    const sandboxKeys = Object.keys(sandbox);
    const sandboxValues = Object.values(sandbox);

    try {
      const fn = new Function(...sandboxKeys, `"use strict";\n${jsCode}`);
      return await Promise.resolve(fn(...sandboxValues));
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  async execute(code: string): Promise<TypeScriptRuntimeResult> {
    this.resetOutput();
    let sourceFile: SourceFile | undefined;

    try {
      // Create a virtual source file with overwrite option
      sourceFile = this.project.createSourceFile("index.ts", code, {
        overwrite: true,
      });

      // Get diagnostics (type checking errors)
      const diagnostics = this.getDiagnostics(sourceFile);

      if (diagnostics.length > 0) {
        return {
          success: false,
          error: "Type checking failed",
          diagnostics,
          stderr: diagnostics.join("\n"),
        };
      }

      // Transpile to JavaScript
      const result = sourceFile.getEmitOutput();
      const outputFiles = result.getOutputFiles();

      if (outputFiles.length === 0) {
        throw new Error("Compilation failed to produce output");
      }

      const jsCode = outputFiles[0].getText();

      // Execute the transpiled code
      const executionResult = await this.executeCode(jsCode);

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
    } finally {
      if (sourceFile) {
        this.project.removeSourceFile(sourceFile);
      }
    }
  }

  destroy(): void {
    const sourceFiles = this.project.getSourceFiles();
    for (const file of sourceFiles) {
      this.project.removeSourceFile(file);
    }
    this.resetOutput();
  }
}
