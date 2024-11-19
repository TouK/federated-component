import { ModuleString, ModuleUrl, ScriptUrl } from "./types";
import { useFederatedModule } from "./hooks";
import React, { Fragment } from "react";
import { splitUrl } from "./tools";
import ReactDOM from "react-dom";
import { FederatedModuleProvider, FederatedModuleProviderProps } from "./FederatedModuleProvider";

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
    scope: ModuleString;
};

export function FederatedComponent<P extends NonNullable<unknown>>({
    url,
    buildHash,
    fallback,
    ...props
}: FederatedComponentProps<P> & Pick<FederatedModuleProviderProps, "fallback" | "buildHash">) {
    return (
        <FederatedModuleProvider url={url} fallback={fallback} buildHash={buildHash}>
            <Component {...props} />
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
        const [urlValue, scopeValue, scriptValue] = splitUrl(url as ModuleUrl);
        ReactDOM.render(
            <Wrapper>
                <FederatedComponent<
                    P & {
                        scriptOrigin: ScriptUrl;
                        getAuthToken?: () => Promise<string>;
                    }
                >
                    url={urlValue}
                    scope={scopeValue}
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
