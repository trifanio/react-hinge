import { CSSProperties, useState } from "react";
import { HingeConfig, HingeController } from "./HingeController";
import { useRefBank } from "./utils/useRefBank";
import { setNodeStyles } from "./utils/dom";

useHinge.defaultConfig = {
  defaultTransitionOptions: {
    duration: 150,
    easing: "ease-out",
  },
} satisfies HingeConfig;

export function useHinge(config?: HingeConfig) {
  const referenceBank = useRefBank<Set<HTMLElement>>();

  const [controller] = useState(
    () =>
      new HingeController({
        ...useHinge.defaultConfig,
        ...(config ? config : ({} as HingeConfig)),
      }),
  );

  const [hinge] = useState(() => ({
    getElements(id: string) {
      return referenceBank.get(id);
    },

    set(id: string, styles: CSSProperties) {
      const elements = referenceBank.get(id);

      if (!elements?.size) {
        console.warn(
          `[hinge.set]: A node "${id}" was not registered. To register the node, pass hinge.register("${id}") as a ref to your element(s).`,
        );
        return;
      }

      for (const node of elements) {
        setNodeStyles(node, styles);
      }
    },
    register(id: string) {
      // register allows you to register
      // as many elements as you'd like under single name
      return (node: HTMLElement | null) => {
        if (!node) {
          // no node provided, bail
          return;
        }

        if (!referenceBank.get(id)) {
          referenceBank.set(id, new Set<HTMLElement>());
        }

        const elements = referenceBank.get(id) as Set<HTMLElement>;

        if (!elements.has(node)) {
          elements.add(node);
        }

        return () => {
          elements.delete(node);
        };
      };
    },
    to(
      selector: string,
      animate: CSSProperties | PropertyIndexedKeyframes,
      options?: KeyframeAnimationOptions,
    ) {
      const elements = referenceBank.get(selector);

      if (!elements?.size) {
        console.warn(
          `[hinge.to]: A node "${selector}" was not registered. To register the node, pass hinge.register("${selector}") as a ref to your element(s).`,
        );
        return;
      }

      return controller.animate(elements, { animate, options });
    },
    fromTo(
      selector: string,
      initial: CSSProperties,
      animate: CSSProperties | PropertyIndexedKeyframes,
      options?: KeyframeAnimationOptions,
    ) {
      const elements = referenceBank.get(selector);

      if (!elements?.size) {
        console.warn(
          `[hinge.fromTo]: A node "${selector}" was not registered. To register the node, pass hinge.register("${selector}") as a ref to your element(s).`,
        );

        return;
      }

      return controller.animate(elements, {
        initial,
        animate,
        options,
      });
    },
    animate(props: {
      initial?: CSSProperties;
      animate: CSSProperties | PropertyIndexedKeyframes;
      options?: KeyframeAnimationOptions;
    }) {
      return (node: HTMLElement | null) => {
        // no node provided; bail
        if (!node) return;

        controller.animate([node], props);
      };
    },
    use(
      animate: CSSProperties | PropertyIndexedKeyframes,
      options?: KeyframeAnimationOptions
    ) {
      return (node: HTMLElement | null) => {
        // no node provided; bail
        if (!node) return;

        controller.animate([node], {
          animate,
          options
        });
      };
    }
  }));

  return hinge;
}
