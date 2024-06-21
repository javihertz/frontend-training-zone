# Frontend Training Zone 💻🏋🏼💪🏻✨

### Setup

1. `git clone` this repository
2. Set the project Node version by using nvm: `nvm use`
3. Install dependencies: `npm install`

## Start the application

Run `npx nx serve frontend-training-zone` to start the development server. Happy coding!

### Project overview

#### Directory structure

```txt
├── [+] __mocks__/  # unit testing mocks
├── [+] .github/    # GitHub code owners, templates, and CI actions workflows
├── [+] .husky/     # git hooks
├── [+] .vscode/    # Visual Studio Code settings
├── [+] apps/       # project main application
├── [+] dist/       # project builds (git ignored)
├── [+] libs/       # project libraries used by the main application
├── [+] reports/    # project reports for linter and unit tests (git ignored)
├── [+] tools/      # project local executor and generator scripts
├── ...
└── README.md       # inception
```

#### Application

The main entry point for the runnable application is `apps/{whatever}}/`.

It's recommended keeping the application as light-weight as possible leaving the heavy lifting being done by libraries that are imported by the application.

The application is responsible for establishing an HTML main structure, managing the main routing that connects the feature libraries and initializing and managing the different global libraries.

#### Libraries

The project libraries, where the most of the code resides.
To create and manage these libraries, the [Nx generators](https://nx.dev/plugin-features/use-code-generators#use-code-generators) commands are used.
Mostly the `nx/react` generator, [documentation](https://nx.dev/packages/react#generators) and `nx/workspace`, [documentation](https://nx.dev/packages/workspace/documents/overview)
Both generators allow several input configurations, like the type of bundler, the directory folder, and so on. Please check the documentation to adjust the creation of the new library

In the following code samples of types of library, the script already has a bundler option set `--bundler=rollup`, each time run this commands
remember to run after a build action to avoid issues with imports.

**Feature libraries:**

A feature library implements smart UI (with access to data sources) for specific business use cases or pages in an application.

- Directory structure:
  - `libs/features/{featureName}/`
  - `libs/features/{featureName}/src/lib/{featureSection}/`
- Dependency Constraints: a feature library can depend on any type of library

  ```mermaid
  flowchart TB
    feature --> feature & ui & data-access & utils
  ```

- <details>
  <summary>Nx command to generate a buildable scaffold library (feature):</summary>

  ```sh
  npm run nx -- g @nx/react:lib {featureName}\
    --bundler=rollup \
    --component=true \
    --directory=features \
    --style=scss \
    --unitTestRunner=jest \
    --publishable \
    --importPath=@wefox/ma-{featureName}
  ```

  </details>

  - <details>
    <summary>Required manual changes after a feature library is generated:</summary>

    - remove unneeded devDependencies from `package.json` (undo the generated changes in both, `package.json` and `package-lock.json` files):

      ```diff
      ...
      - "eslint-plugin-import": "2.26.0",
      - "eslint-plugin-jsx-a11y": "6.6.1",
      - "eslint-plugin-react": "7.31.11",
      - "eslint-plugin-react-hooks": "4.6.0",
      ...
      ```

    - rename `libs/features/{featureName}/package.json` to `libs/features/{featureName}/package.prod.json` to avoid build conflicts
    - update `package.json` reference to `package.prod.json` on `libs/features/{featureName}/project.json` (_targets.build.options.project_)
    - update `libs/features/{featureName}/tsconfig.spec.json`:

      ```diff
      - "types": ["jest", "node"]
      + "types": ["jest", "node", "testing-library__jest-dom"]
      ```

    - update `libs/features/{featureName}/jest.config.ts`:

      ```diff
      - coverageDirectory: '../../../coverage/libs/features/{featureName}'
      + coverageDirectory: '../../../reports/unit/coverage/libs/features/{featureName}'
      ```

  </details>

- <details>
  <summary>Nx command to generate a scaffold library section (section):</summary>

  ```sh
  npm run nx -- g @nx/react:component {featureSection}\
    --export \
    --project=features-{featureName}  \
    --routing=true  \
    --style=scss
  ```

  </details>

**UI libraries:**

A UI library contains only presentational components (also called "dumb" components).

- Directory structure: `libs/ui/{uiName}/`
- Dependency Constraints: a UI library can depend on UI and util libraries.

  ```mermaid
  flowchart LR
    ui --> ui & utils
  ```

- <details>
  <summary>Nx command to generate a UI library:</summary>

  ```sh
  npm run nx -- g @nx/react:lib {uiName}\
    --bundler=none \
    --component=false \
    --directory=ui \
    --style=none \
    --unitTestRunner=jest
  ```

  </details>

**Data-access libraries:**

A data-access library contains code for interacting with a backend system. It also includes all the code related to state management.

- Directory structure: `libs/data-access/{dataAccessName}/`
- Dependency Constraints: a data-access library can depend on data-access and util libraries.

  ```mermaid
  flowchart LR
    data-access --> data-access & utils
  ```

- <details>
  <summary>Nx command to generate a data access library:</summary>

  ```sh
  npm run nx -- g @nx/react:lib {dataAccessName}\
    --bundler=rollup \
    --component=false \
    --directory=data-access \
    --style=none \
    --unitTestRunner=jest
  ```

  </details>

  - <details>
    <summary>Required manual changes after a feature library is generated:</summary>

    - uninstall not neeeded devDependencies from `package.json` (undo the generated changes in both, `package.json` and `package-lock.json` files):

      ```bash
      npm uninstall eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-react eslint-plugin-react-hooks
      ```

    - rename `libs/data-access/{dataAccessName}/package.json` to `libs/data-access/{dataAccessName}/package.prod.json` to avoid build conflicts
    - update `package.json` reference to `package.prod.json` on `libs/data-access/{dataAccessName}/project.json` (_targets.build.options.project_)
    - delete the file `.prettierrc`
    - update `data-access/{dataAccessName}/tsconfig.lib.json` including the `declarations.d.ts` file

      ```diff
      - "include": ["src/**/*.js", "src/**/*.jsx", "src/**/*.ts", "src/**/*.tsx"]
      + "include": ["src/**/*.js", "src/**/*.jsx", "src/**/*.ts", "src/**/*.tsx", "../../../declarations.d.ts"]
      ```

    - on the feature it will be used the new data access, is recommended to add the defintions in the `tsconfig` file, to ensure Visual Studio Code not flag false errors
      file: `libs/features/{featureName}/tsconfig.json`

      ```diff
      + "paths": {
      +   "@wefox/data-access/{dataAccessName}": ["dist/libs/data-access/{dataAccessName}"]
      + }
      ```

  </details>

**Utility libraries:**

A utility library contains low-level utilities used by many libraries and applications.

- Directory structure: `libs/utils/{utilityName}/`
- Dependency Constraints: a utility library can depend only on utility libraries.

  ```mermaid
  flowchart LR
    utils --> utils
  ```

- <details>
  <summary>Nx command to generate a utility library:</summary>

  ```sh
  npm run nx -- g @nx/react:lib {utilityName}\
    --bundler=rollup \
    --component=false \
    --directory=utils \
    --style=none \
    --unitTestRunner=jest
  ```

  </details>

**Naming conventions:**

- Client side environment variables (used in build time): `NX_VAR_NAME`
  - More information: <https://nx.dev/recipes/environment-variables/use-environment-variables-in-react#for-non-vite-react-applications>
  - JS/TS files: `process.env.NX_VAR_NAME`
  - HTML files: `%NX_VAR_NAME%`
- Server side environment variables (used in execution time): `APP_VAR_NAME`
  - HTML files: [nginx SSI (Server Side Includes) module](https://nginx.org/en/docs/http/ngx_http_ssi_module.html)
  - nginx config template `devops/nginx/templates/default.conf.template`: `${APP_VAR_NAME}`

### API mocking (SOON)

The application makes use of the library [Mock Service Worker](https://mswjs.io/) (MSW) to intercept actual requests to final endpoints.
It is the closest thing to a mocking server without having to create one. It can be used for development, testing, debugging, and experimenting with edge cases.

Due to the folder project organization, the main files are placed in the path `apps/hots/src/__mocks__`, [here](./apps/host/src/__mocks__).
Inside the folder, there are three types of handlers:

- `default`: default data used across the whole application, mostly `/config` path, where is configure the `env` variables
- `local`: local handlers to match current existing API calls, where the data is static and is allocated in the `apps/hots/src/__mocks__/responses` path
- `remote`: similar to `local.handlers`, but can call Stoplight mock endpoints to get defined examples from there. It also can be configured
  to play with different scenarios (HTTP status codes: `200`, `401`, `500`, etc) or configurations (using the `dynamic` prop, it will receive auto-generated data)

#### How to configure/start using MSW

It can be found in the `.env.example` file two critical variables to set up MSW as expected.
The first one is `NX_APP_MSW_ENABLED` to set and include MSW before the application runs to be executed. With this variable enabled `true`,
the library will create the worker, intercept all the requests on our application, and return the predefined ones in the handlers as mocked responses.
Otherwise, by setting the variable to `false`, the application should work as expected and make the API calls to the server and the other's request without mocking.

When the library is enabled, the second variable is `NX_APP_MSW_HANDLER_TYPE`; with this property, it can be configured which type of handler it will be used.
The available options are `local`, `remote` or can by empty.
Leaving the variable empty is used only in scenarios where developers needs to work locally only with the mock `/config` API call, but the rest of the calls are real.

Abstract:

- `NX_APP_MSW_ENABLED`: enable the use MSW. Options allowed: `true` or `false`
- `NX_APP_MSW_HANDLER_TYPE`: configure type of the handlers to get the data. Options allowed: empty, `local` or `remote`
 use underscore `-` to divide the words

## References

Nx documentation:

- <https://nx.dev/concepts/mental-model>
- <https://nx.dev/concepts/affected>
- <https://nx.dev/more-concepts/applications-and-libraries>
- <https://nx.dev/more-concepts/creating-libraries>
- <https://nx.dev/more-concepts/library-types>

✨ **This workspace has been generated by [Nx, Smart Monorepos · Fast CI.](https://nx.dev)** ✨
