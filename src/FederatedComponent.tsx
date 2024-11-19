import React, { Fragment } from "react";
import ReactDOM from "react-dom";
import { FederatedModuleProvider, FederatedModuleProviderProps } from "./FederatedModuleProvider";
import { useFederatedModule } from "./hooks";
import { splitUrl } from "./tools";
import { ModuleString, ModuleUrl, ScriptUrl } from "./types";

function Component<P>({
    scope,
    ...props
}: {
    scope: ModuleString;
} & P) {
    const {
        module: { default: Component },
    } = useFederatedModule(scope);
    return <Component {...props} />;
}

export type FederatedComponentProps<P extends NonNullable<unknown>> = P & {
    url: ModuleUrl;
    /**
     * @deprecated better use scope from ModuleUrl
     */
    scope?: ModuleString;
};

export function FederatedComponent<P extends NonNullable<unknown>>({
    url,
    buildHash,
    fallback,
    scope,
    ...props
}: FederatedComponentProps<P> & Pick<FederatedModuleProviderProps, "fallback" | "buildHash">) {
    const [, scopeValue, , , , query] = splitUrl(url as ModuleUrl);

    const searchParams = new URLSearchParams(query);
    const params = Object.fromEntries(searchParams.entries());

    return (
        <FederatedModuleProvider url={url} fallback={fallback} buildHash={buildHash}>
            <Component scope={scope || scopeValue} {...params} {...props} />
        </FederatedModuleProvider>
    );
}

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
