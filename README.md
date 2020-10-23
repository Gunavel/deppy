# deppy

A module to purge the unused dependencies from package.json.

## Usage

### Pre-requisites

- `node` version >=10
- `npm` versions >= 5.2 for executing `npx`
- `yarn`

Run the below `npx` command from the project root where the `package.json` file is present.

```node
npx https://github.com/Gunavel/deppy
```

## Note

- Currently deppy removes the dependencies using `yarn remove` command

## Caution

- Make sure to test the application manually once the dependencies are purged
- Read <https://github.com/depcheck/depcheck#false-alert>

## Known Issues

- Running depcheck as spawn cmd in win32 systems seems to fail
