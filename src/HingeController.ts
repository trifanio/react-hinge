import { CSSProperties } from "react";
import {
  buildKeyframes,
  definitionContainsKeyframes,
  extractFinalStylesFromKeyframes,
  getKeyframesId,
} from "./utils/keyframes";
import { setNodeStyles } from "./utils/dom";
import { manageAnimationLifecycle } from "./utils/animation";

export type HingeConfig = {
  defaultTransitionOptions: KeyframeAnimationOptions;
};

export class HingeController {
  config: HingeConfig;

  constructor(config: HingeConfig) {
    this.config = config;
  }

  getTransitionOptions(
    options?: KeyframeAnimationOptions,
  ): KeyframeAnimationOptions {
    return {
      ...this.config.defaultTransitionOptions,
      ...(options || {}),
    };
  }

  /*
   *
   *
   * Maps this widely accepted "initial" to "animate" pattern in React
   * to web animations api and manages animation lifecycle on a node provided
   *
   * Lifecycle in this case- look for animations on the node and prevent re-running animations already in progress
   * This is needed if react re-renders or a different animation run is requested
   *
   * */
  animate(
    elements: Array<HTMLElement> | Set<HTMLElement>,
    props: {
      initial?: CSSProperties;
      animate: CSSProperties | PropertyIndexedKeyframes;
      options?: KeyframeAnimationOptions;
    },
  ) {
    const requestsSequence = definitionContainsKeyframes(props.animate);

    const keyframes = requestsSequence
      ? (props.animate as PropertyIndexedKeyframes)
      : buildKeyframes({
          from: props.initial,
          to: props.animate as CSSProperties,
        });

    const animations: Array<Animation> = [];
    let latestAnimation: Animation | undefined;

    const transitionOptions = this.getTransitionOptions(props.options);

    const animationId = getKeyframesId(keyframes, transitionOptions);

    for (const node of elements) {
      const { status } = manageAnimationLifecycle(node, animationId);

      if (status === "running") {
        // requested animation is already running; bail
        continue;
      }

      // if this is a sequence request apply initial styles directly
      if (requestsSequence && props.initial) {
        setNodeStyles(node, props.initial);
      }

      const animation = node.animate(keyframes, transitionOptions);
      animation.id = animationId;

      const handleFinishAnimating = () => {
        // assign final styles finalizing the animation state
        const styles = requestsSequence
          ? extractFinalStylesFromKeyframes(
              props.animate as PropertyIndexedKeyframes,
            )
          : (props.animate as CSSProperties);

        setNodeStyles(node, styles);
      };

      animation.onfinish = handleFinishAnimating;

      latestAnimation = animation;
      animations.push(animation);
    }

    return { latestAnimation, animations };
  }
}
