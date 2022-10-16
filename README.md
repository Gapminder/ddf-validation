# ddf-validation-ng

## how to build

1. install purescript and spago
    - `npm install -g purescript`
    - `npm install -g spago`
2. to install dependencies
   - `npm install`
   - `spago install`
3. run `npm run build` (which will run `spago build`)

## how to create new version
1. build the app and module bundle
    - `npm run bundle-app`
    - `npm run bundle-module`
2. `npm publish`