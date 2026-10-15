import { Children, cloneElement, isValidElement, type ComponentProps, type ReactNode } from "react";
import JSStack from "expo-router/js-stack";

export * from "expo-router";

// The native stack has no screen transitions on web, so the preview's root layout uses the JS stack,
// which animates in the browser. Same animation names; contentStyle becomes the JS stack's cardStyle.
type Options = Record<string, unknown> | undefined;
type StackProps = ComponentProps<typeof JSStack>;

// What the native stack uses on Android when a screen sets no animation
const ANDROID_DEFAULT = { animation: "scale_from_center" };

function toCardOptions(options: Options): Options {
	if (!options || typeof options !== "object") return options;
	const { contentStyle, ...rest } = options;
	return contentStyle ? { ...rest, cardStyle: contentStyle } : rest;
}

function mapScreens(children: ReactNode): ReactNode {
	return Children.map(children, (child) => {
		if (!isValidElement<{ options?: Options }>(child)) return child;
		return cloneElement(child, { options: toCardOptions(child.props.options) });
	});
}

function WebStack({ screenOptions, children, ...props }: StackProps) {
	const options = typeof screenOptions === "function" ? screenOptions : { ...ANDROID_DEFAULT, ...toCardOptions(screenOptions as Options) };
	return (
		<JSStack {...props} screenOptions={options as StackProps["screenOptions"]}>
			{mapScreens(children)}
		</JSStack>
	);
}

export const Stack = Object.assign(WebStack, { Screen: JSStack.Screen, Protected: JSStack.Protected });
