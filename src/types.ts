import { ComponentType } from "react";
import type { Tagged } from "type-fest";

export interface Container {
    init(scope: unknown): Promise<unknown>;

    get<M = { default: ComponentType<unknown> }>(module: PathString): Promise<() => M>;
}

/**
 * remote name from ModuleFederationPlugin
 */
export type ScopeString = Tagged<string, "ScopeString">;

/**
 * remote exposed module "path" from ModuleFederationPlugin
 */
export type PathString = Tagged<string, "PathString">;

/**
 * url to remote entry .js file
 */
export type ScriptUrl = Tagged<string, "ScriptUrl">;

/**
 * query from remote entry url
 */
export type QueryString = Tagged<string, "QueryString">;

/**
 * `${ScopeString}/${PathString}`
 */
export type ModuleString = Tagged<string, "ModuleString">;

/**
 * `${ModuleString}@${ScriptUrl}`
 */
export type ModuleUrl = Tagged<string, "ModuleUrl">;

type Hooks = Record<`use${Capitalize<string>}`, (...args: unknown[]) => unknown>;
export type Module = { default?: ComponentType<unknown> } & Hooks;
