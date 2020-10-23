#!/usr/bin/env node

/*
  Analyze installed dependencies using `depcheck` npm module.
  1. Runs `depcheck` to find unused dependencies/devDependencies
  2. Array of unused dependencies are passed to `deps-processor.js` for purging safely

  Usage: See readme for usage info.

  Known Issues:
  - running depcheck as spawn cmd in win32 systems seems to fail
*/
const depcheck = require("depcheck");
const ora = require("ora");

if (process.platform === "win32") {
  console.log("<".repeat(50));
  console.error("\nWindows sucks!! Please run this on linux based OS.\n");
  console.log(">".repeat(50));

  process.exit(1);
}

// dependency processor local module
// const depsProcessor = require("./deps-processor");

const spinner = ora("Collecting unused dependencies").start();

try {
  const options = {
    skipMissing: true,
    ignoreDirs: ["dist", "build", "public", "_public"],
  };

  // Runs depcheck npm module with optional flags
  // see https://www.npmjs.com/package/depcheck for additional configs
  depcheck(process.cwd(), options, (unused) => {
    spinner.succeed();

    const deps = [...unused.dependencies, ...unused.devDependencies];
    if (deps.length === 0) {
      console.log("\n🔥 No unused dependencies found in your project. 🚀\n");
      process.exit();
    }

    console.log(
      `Found ${
        unused.dependencies.length
      } unused dependencies. ${unused.dependencies.join(", ")}`
    );
    console.log("\n");
    console.log(
      `Found ${
        unused.devDependencies.length
      } unused devDependencies. ${unused.devDependencies.join(",")}`
    );

    // Process the collected dependencies
    // depsProcessor(deps);
  });
} catch (e) {
  spinner.fail("Failed to run depcheck.\n");

  const currentNodeMajorVersion = Number(process.version.match(/^v(\d+\.)/)[1]);
  if (currentNodeMajorVersion < 10) {
    console.log("Node version: ", process.version);
    console.log("Node version should be >=10 for depcheck to run.");
  }

  console.log(e);
  process.exit(1);
}
