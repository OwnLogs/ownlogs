
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * Environment variables [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env`. Like [`$env/dynamic/private`](https://kit.svelte.dev/docs/modules#$env-dynamic-private), this module cannot be imported into client-side code. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://kit.svelte.dev/docs/configuration#env) (if configured).
 * 
 * _Unlike_ [`$env/dynamic/private`](https://kit.svelte.dev/docs/modules#$env-dynamic-private), the values exported from this module are statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * ```ts
 * import { API_KEY } from '$env/static/private';
 * ```
 * 
 * Note that all environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * 
 * ```
 * MY_FEATURE_FLAG=""
 * ```
 * 
 * You can override `.env` values from the command line like so:
 * 
 * ```bash
 * MY_FEATURE_FLAG="enabled" npm run dev
 * ```
 */
declare module '$env/static/private' {
	export const GJS_DEBUG_TOPICS: string;
	export const npm_package_dependencies_inquirer: string;
	export const npm_package_dependencies_rehype_slug: string;
	export const npm_package_dependencies_remark_emoji: string;
	export const LC_TIME: string;
	export const USER: string;
	export const PHP_INI_SCAN_DIR: string;
	export const npm_config_user_agent: string;
	export const STARSHIP_SHELL: string;
	export const XDG_SESSION_TYPE: string;
	export const GIT_ASKPASS: string;
	export const FZF_DEFAULT_OPTS: string;
	export const FZF_CTRL_T_COMMAND: string;
	export const npm_package_scripts_prebuild: string;
	export const npm_package_devDependencies__sveltejs_vite_plugin_svelte: string;
	export const npm_package_devDependencies_vite: string;
	export const npm_node_execpath: string;
	export const SHLVL: string;
	export const npm_package_dependencies_directory_tree: string;
	export const HOME: string;
	export const OLDPWD: string;
	export const CHROME_DESKTOP: string;
	export const LESS: string;
	export const DESKTOP_SESSION: string;
	export const TERM_PROGRAM_VERSION: string;
	export const npm_package_devDependencies_eslint_config_prettier: string;
	export const npm_package_devDependencies_eslint_plugin_svelte: string;
	export const GIO_LAUNCHED_DESKTOP_FILE: string;
	export const ZSH: string;
	export const LSCOLORS: string;
	export const GTK_MODULES: string;
	export const GNOME_SHELL_SESSION_MODE: string;
	export const VSCODE_GIT_ASKPASS_MAIN: string;
	export const PAGER: string;
	export const LC_MONETARY: string;
	export const MANAGERPID: string;
	export const VSCODE_GIT_ASKPASS_NODE: string;
	export const FNM_ARCH: string;
	export const DBUS_SESSION_BUS_ADDRESS: string;
	export const GSM_SKIP_SSH_AGENT_WORKAROUND: string;
	export const SYSTEMD_EXEC_PID: string;
	export const npm_package_dependencies_lenis: string;
	export const npm_config_engine_strict: string;
	export const GIO_LAUNCHED_DESKTOP_FILE_PID: string;
	export const COLORTERM: string;
	export const FZF_CTRL_R_OPTS: string;
	export const npm_package_devDependencies_tailwindcss: string;
	export const npm_package_scripts_backup: string;
	export const WAYLAND_DISPLAY: string;
	export const FZF_CTRL_T_OPTS: string;
	export const FNM_VERSION_FILE_STRATEGY: string;
	export const FNM_LOGLEVEL: string;
	export const npm_package_scripts_dev: string;
	export const npm_package_devDependencies_prettier: string;
	export const LOGNAME: string;
	export const npm_package_type: string;
	export const _: string;
	export const JOURNAL_STREAM: string;
	export const FNM_NODE_DIST_MIRROR: string;
	export const npm_package_private: string;
	export const npm_package_devDependencies_autoprefixer: string;
	export const XDG_SESSION_CLASS: string;
	export const MEMORY_PRESSURE_WATCH: string;
	export const USER_ZDOTDIR: string;
	export const npm_package_scripts_lint: string;
	export const npm_config_registry: string;
	export const USERNAME: string;
	export const TERM: string;
	export const npm_package_dependencies_mdsvex: string;
	export const GNOME_DESKTOP_SESSION_ID: string;
	export const npm_package_dependencies_tailwind_merge: string;
	export const FZF_ALT_C_COMMAND: string;
	export const npm_package_devDependencies_prettier_plugin_tailwindcss: string;
	export const PATH: string;
	export const PAPERSIZE: string;
	export const SESSION_MANAGER: string;
	export const INVOCATION_ID: string;
	export const npm_package_name: string;
	export const npm_package_dependencies__iconify_svelte: string;
	export const npm_package_dependencies_unist_util_visit: string;
	export const NODE: string;
	export const LC_ADDRESS: string;
	export const XDG_RUNTIME_DIR: string;
	export const XDG_MENU_PREFIX: string;
	export const GNOME_SETUP_DISPLAY: string;
	export const GDK_BACKEND: string;
	export const npm_package_scripts_setup: string;
	export const npm_package_devDependencies_shiki: string;
	export const npm_package_dependencies_material_file_icons: string;
	export const npm_config_frozen_lockfile: string;
	export const DISPLAY: string;
	export const npm_package_devDependencies_vite_plugin_compression: string;
	export const LANG: string;
	export const LC_TELEPHONE: string;
	export const XDG_CURRENT_DESKTOP: string;
	export const VSCODE_INJECTION: string;
	export const npm_package_devDependencies_eslint: string;
	export const XDG_SESSION_DESKTOP: string;
	export const XMODIFIERS: string;
	export const XAUTHORITY: string;
	export const TERM_PROGRAM: string;
	export const VSCODE_GIT_IPC_HANDLE: string;
	export const LS_COLORS: string;
	export const YSU_VERSION: string;
	export const FNM_DIR: string;
	export const npm_package_devDependencies_remark_math: string;
	export const npm_lifecycle_script: string;
	export const SSH_AUTH_SOCK: string;
	export const ORIGINAL_XDG_CURRENT_DESKTOP: string;
	export const FNM_RESOLVE_ENGINES: string;
	export const npm_package_devDependencies__sveltejs_kit: string;
	export const npm_package_dependencies__sveltejs_adapter_vercel: string;
	export const npm_package_dependencies_chalk: string;
	export const npm_package_dependencies_flexsearch: string;
	export const LC_NAME: string;
	export const SHELL: string;
	export const NODE_PATH: string;
	export const npm_package_version: string;
	export const npm_lifecycle_event: string;
	export const QT_ACCESSIBILITY: string;
	export const GDMSESSION: string;
	export const npm_package_scripts_build: string;
	export const npm_package_devDependencies_svelte: string;
	export const npm_package_dependencies_remark_attr: string;
	export const LC_MEASUREMENT: string;
	export const FZF_ALT_C_OPTS: string;
	export const LC_IDENTIFICATION: string;
	export const GJS_DEBUG_OUTPUT: string;
	export const npm_package_devDependencies_globals: string;
	export const npm_package_dependencies_clsx: string;
	export const QT_IM_MODULE: string;
	export const VSCODE_GIT_ASKPASS_EXTRA_ARGS: string;
	export const npm_package_scripts_format: string;
	export const PWD: string;
	export const FZF_DEFAULT_COMMAND: string;
	export const FNM_MULTISHELL_PATH: string;
	export const npm_package_dependencies_rehype_katex_svelte: string;
	export const npm_execpath: string;
	export const XDG_DATA_DIRS: string;
	export const ZDOTDIR: string;
	export const VIRTUAL_ENV_DISABLE_PROMPT: string;
	export const LC_NUMERIC: string;
	export const STARSHIP_SESSION_KEY: string;
	export const npm_package_scripts_update_registry: string;
	export const npm_package_devDependencies__shikijs_transformers: string;
	export const npm_package_devDependencies_postcss: string;
	export const npm_command: string;
	export const PNPM_SCRIPT_SRC_DIR: string;
	export const LC_PAPER: string;
	export const FNM_COREPACK_ENABLED: string;
	export const npm_package_scripts_preview: string;
	export const npm_package_devDependencies_prettier_plugin_svelte: string;
	export const npm_package_dependencies_mode_watcher: string;
	export const MEMORY_PRESSURE_WRITE: string;
	export const PNPM_HOME: string;
	export const npm_package_devDependencies__types_eslint: string;
	export const INIT_CWD: string;
	export const NODE_ENV: string;
}

/**
 * Similar to [`$env/static/private`](https://kit.svelte.dev/docs/modules#$env-static-private), except that it only includes environment variables that begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Values are replaced statically at build time.
 * 
 * ```ts
 * import { PUBLIC_BASE_URL } from '$env/static/public';
 * ```
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to runtime environment variables, as defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://kit.svelte.dev/docs/cli)), this is equivalent to `process.env`. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://kit.svelte.dev/docs/configuration#env) (if configured).
 * 
 * This module cannot be imported into client-side code.
 * 
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * console.log(env.DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 * 
 * > In `dev`, `$env/dynamic` always includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 */
declare module '$env/dynamic/private' {
	export const env: {
		GJS_DEBUG_TOPICS: string;
		npm_package_dependencies_inquirer: string;
		npm_package_dependencies_rehype_slug: string;
		npm_package_dependencies_remark_emoji: string;
		LC_TIME: string;
		USER: string;
		PHP_INI_SCAN_DIR: string;
		npm_config_user_agent: string;
		STARSHIP_SHELL: string;
		XDG_SESSION_TYPE: string;
		GIT_ASKPASS: string;
		FZF_DEFAULT_OPTS: string;
		FZF_CTRL_T_COMMAND: string;
		npm_package_scripts_prebuild: string;
		npm_package_devDependencies__sveltejs_vite_plugin_svelte: string;
		npm_package_devDependencies_vite: string;
		npm_node_execpath: string;
		SHLVL: string;
		npm_package_dependencies_directory_tree: string;
		HOME: string;
		OLDPWD: string;
		CHROME_DESKTOP: string;
		LESS: string;
		DESKTOP_SESSION: string;
		TERM_PROGRAM_VERSION: string;
		npm_package_devDependencies_eslint_config_prettier: string;
		npm_package_devDependencies_eslint_plugin_svelte: string;
		GIO_LAUNCHED_DESKTOP_FILE: string;
		ZSH: string;
		LSCOLORS: string;
		GTK_MODULES: string;
		GNOME_SHELL_SESSION_MODE: string;
		VSCODE_GIT_ASKPASS_MAIN: string;
		PAGER: string;
		LC_MONETARY: string;
		MANAGERPID: string;
		VSCODE_GIT_ASKPASS_NODE: string;
		FNM_ARCH: string;
		DBUS_SESSION_BUS_ADDRESS: string;
		GSM_SKIP_SSH_AGENT_WORKAROUND: string;
		SYSTEMD_EXEC_PID: string;
		npm_package_dependencies_lenis: string;
		npm_config_engine_strict: string;
		GIO_LAUNCHED_DESKTOP_FILE_PID: string;
		COLORTERM: string;
		FZF_CTRL_R_OPTS: string;
		npm_package_devDependencies_tailwindcss: string;
		npm_package_scripts_backup: string;
		WAYLAND_DISPLAY: string;
		FZF_CTRL_T_OPTS: string;
		FNM_VERSION_FILE_STRATEGY: string;
		FNM_LOGLEVEL: string;
		npm_package_scripts_dev: string;
		npm_package_devDependencies_prettier: string;
		LOGNAME: string;
		npm_package_type: string;
		_: string;
		JOURNAL_STREAM: string;
		FNM_NODE_DIST_MIRROR: string;
		npm_package_private: string;
		npm_package_devDependencies_autoprefixer: string;
		XDG_SESSION_CLASS: string;
		MEMORY_PRESSURE_WATCH: string;
		USER_ZDOTDIR: string;
		npm_package_scripts_lint: string;
		npm_config_registry: string;
		USERNAME: string;
		TERM: string;
		npm_package_dependencies_mdsvex: string;
		GNOME_DESKTOP_SESSION_ID: string;
		npm_package_dependencies_tailwind_merge: string;
		FZF_ALT_C_COMMAND: string;
		npm_package_devDependencies_prettier_plugin_tailwindcss: string;
		PATH: string;
		PAPERSIZE: string;
		SESSION_MANAGER: string;
		INVOCATION_ID: string;
		npm_package_name: string;
		npm_package_dependencies__iconify_svelte: string;
		npm_package_dependencies_unist_util_visit: string;
		NODE: string;
		LC_ADDRESS: string;
		XDG_RUNTIME_DIR: string;
		XDG_MENU_PREFIX: string;
		GNOME_SETUP_DISPLAY: string;
		GDK_BACKEND: string;
		npm_package_scripts_setup: string;
		npm_package_devDependencies_shiki: string;
		npm_package_dependencies_material_file_icons: string;
		npm_config_frozen_lockfile: string;
		DISPLAY: string;
		npm_package_devDependencies_vite_plugin_compression: string;
		LANG: string;
		LC_TELEPHONE: string;
		XDG_CURRENT_DESKTOP: string;
		VSCODE_INJECTION: string;
		npm_package_devDependencies_eslint: string;
		XDG_SESSION_DESKTOP: string;
		XMODIFIERS: string;
		XAUTHORITY: string;
		TERM_PROGRAM: string;
		VSCODE_GIT_IPC_HANDLE: string;
		LS_COLORS: string;
		YSU_VERSION: string;
		FNM_DIR: string;
		npm_package_devDependencies_remark_math: string;
		npm_lifecycle_script: string;
		SSH_AUTH_SOCK: string;
		ORIGINAL_XDG_CURRENT_DESKTOP: string;
		FNM_RESOLVE_ENGINES: string;
		npm_package_devDependencies__sveltejs_kit: string;
		npm_package_dependencies__sveltejs_adapter_vercel: string;
		npm_package_dependencies_chalk: string;
		npm_package_dependencies_flexsearch: string;
		LC_NAME: string;
		SHELL: string;
		NODE_PATH: string;
		npm_package_version: string;
		npm_lifecycle_event: string;
		QT_ACCESSIBILITY: string;
		GDMSESSION: string;
		npm_package_scripts_build: string;
		npm_package_devDependencies_svelte: string;
		npm_package_dependencies_remark_attr: string;
		LC_MEASUREMENT: string;
		FZF_ALT_C_OPTS: string;
		LC_IDENTIFICATION: string;
		GJS_DEBUG_OUTPUT: string;
		npm_package_devDependencies_globals: string;
		npm_package_dependencies_clsx: string;
		QT_IM_MODULE: string;
		VSCODE_GIT_ASKPASS_EXTRA_ARGS: string;
		npm_package_scripts_format: string;
		PWD: string;
		FZF_DEFAULT_COMMAND: string;
		FNM_MULTISHELL_PATH: string;
		npm_package_dependencies_rehype_katex_svelte: string;
		npm_execpath: string;
		XDG_DATA_DIRS: string;
		ZDOTDIR: string;
		VIRTUAL_ENV_DISABLE_PROMPT: string;
		LC_NUMERIC: string;
		STARSHIP_SESSION_KEY: string;
		npm_package_scripts_update_registry: string;
		npm_package_devDependencies__shikijs_transformers: string;
		npm_package_devDependencies_postcss: string;
		npm_command: string;
		PNPM_SCRIPT_SRC_DIR: string;
		LC_PAPER: string;
		FNM_COREPACK_ENABLED: string;
		npm_package_scripts_preview: string;
		npm_package_devDependencies_prettier_plugin_svelte: string;
		npm_package_dependencies_mode_watcher: string;
		MEMORY_PRESSURE_WRITE: string;
		PNPM_HOME: string;
		npm_package_devDependencies__types_eslint: string;
		INIT_CWD: string;
		NODE_ENV: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * Similar to [`$env/dynamic/private`](https://kit.svelte.dev/docs/modules#$env-dynamic-private), but only includes variables that begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Note that public dynamic environment variables must all be sent from the server to the client, causing larger network requests — when possible, use `$env/static/public` instead.
 * 
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.PUBLIC_DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
