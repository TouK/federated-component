import React, { Fragment, ReactNode, RefAttributes } from "react";
import ReactDOM from "react-dom";
import { FederatedModuleProvider, FederatedModuleProviderProps } from "./FederatedModuleProvider";
import { useFederatedModule } from "./hooks";
import { splitUrl } from "./tools";
import { ModuleString, ModuleUrl, ScriptUrl } from "./types";

function ComponentRender<P extends NonNullable<{ scope: ModuleString }>, T>({ scope, ...props }: P, ref: React.ForwardedRef<T>) {
    const {
        module: { default: DefaultComponent },
    } = useFederatedModule(scope);
    return <DefaultComponent ref={ref} {...props} />;
}

const Component = React.forwardRef(ComponentRender) as <P extends NonNullable<unknown>, T>(
    props: { scope: ModuleString } & P & RefAttributes<T>,
) => ReactNode;

export type FederatedComponentProps<P extends NonNullable<unknown>> = P & {
    url: ModuleUrl;
    /**
     * @deprecated better use scope from ModuleUrl
     */
    scope?: ModuleString;
};

function FederatedComponentRender<P extends NonNullable<unknown>, T>(
    {
        buildHash,
        fallback,
        url,
        scope,
        ...props
    }: FederatedComponentProps<P> & Pick<FederatedModuleProviderProps, "fallback" | "buildHash">,
    ref: React.ForwardedRef<T>,
) {
    const [, scopeValue, , , , query] = splitUrl(url as ModuleUrl);

    const searchParams = new URLSearchParams(query);
    const params = Object.fromEntries(searchParams.entries()) as P;

    return (
        <FederatedModuleProvider url={url} fallback={fallback} buildHash={buildHash}>
            <Component ref={ref} {...params} {...props} scope={scope || scopeValue} />
        </FederatedModuleProvider>
    );
}

export const FederatedComponent = React.forwardRef(FederatedComponentRender) as <P extends NonNullable<unknown>, T = unknown>(
    props: P & RefAttributes<T>,
) => ReactNode;

interface LoaderOptions {
    Wrapper?: React.FunctionComponent<React.PropsWithChildren<unknown>>;
    getAuthToken?: () => Promise<string>;
}

export function getFederatedComponentLoader({ Wrapper = Fragment, ...options }: LoaderOptions = {}) {
    return <P extends NonNullable<unknown>>(url: string, props: P) => {
        const rootContainer = document.createElement(`div`);
        document.body.appendChild(rootContainer);
        const [urlValue, , scriptValue] = splitUrl(url as ModuleUrl);
        ReactDOM.render(
            <Wrapper>
                <FederatedComponent<
                    P & {
                        scriptOrigin: ScriptUrl;
                        getAuthToken?: () => Promise<string>;
                    }
                >
                    url={urlValue}
                    scriptOrigin={scriptValue}
                    getAuthToken={options.getAuthToken}
                    fallback={null}
                    {...props}
                />
            </Wrapper>,
            rootContainer,
        );
    };
}
