#!/usr/bin/env node

/*
  Analyze installed dependencies using `depcheck` npm module.
  1. Runs `depcheck` to find unused dependencies
  2. Array of unused dependencies are removed using `yarn remove dep1 dep2 ...`

  Usage: See readme for usage info.

  Known Issues:
  - running depcheck as spawn cmd in win32 systems seems to fail
*/
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const depcheck = require('depcheck')
const ora = require('ora')

if (process.platform === 'win32') {
  console.log('\nWindows sucks!! Please run this on linux based OS.\n')
  process.exit(1)
}

/**
 * Commands
 */
const uninstallDepCmd = (depsList) => `yarn remove ${depsList}`
const buildCmd = 'yarn build'

/** Processing indicator */
const spinner = ora('Collecting unused dependencies').start()

try {
  const options = {
    skipMissing: true,
    ignoreDirs: ['dist', 'build', 'public', '_public']
  }

  /**
   * Runs depcheck npm module with optional flags
   * See https://www.npmjs.com/package/depcheck for additional configs
   */
  depcheck(process.cwd(), options, async (unused) => {
    spinner.succeed()

    const deps = unused.dependencies
    if (deps.length === 0) {
      console.log('\n🔥 No unused dependencies found in your project. 🚀\n')
      process.exit()
    }

    console.log(`\nUnused Dependencies: ${unused.dependencies.length}`)
    console.dir(unused.dependencies)

    console.log('\n')
    spinner.start('Purging dependencies')
    console.log('\n')

    try {
      /**
       * Uninstall the dependencies
       */
      const depsList = deps.join(' ')
      await exec(uninstallDepCmd(depsList))
      spinner.succeed('Dependencies purged successfully!')

      /**
       * Run build command
       */
      spinner.start('Checking if build succeeds')
      await exec(buildCmd)
      spinner.succeed(
        'Build succeeded! Please build/run the application manually to verify.'
      )
    } catch (error) {
      spinner.fail('Failed to purge dependencies.')
      console.log(
        'Undo the package.json changes if any and run yarn install manually!'
      )
      console.log(error)
    }

    process.exit()
  })
} catch (error) {
  spinner.fail('Failed to run depcheck.\n')

  const currentNodeMajorVersion = Number(process.version.match(/^v(\d+\.)/)[1])
  if (currentNodeMajorVersion < 10) {
    console.log('Node version: ', process.version)
    console.log('Node version should be >=10 for depcheck to run.')
  }

  console.log(error)
  process.exit(1)
}
