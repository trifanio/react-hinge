// Filters out CSSAnimations, CSSTransitions etc. assigned to a node provided
// Identifies the most recently launched animation assigned on the node
const getAnimations = (node: HTMLElement) => {
  const assignedAnimations = node.getAnimations();

  if (assignedAnimations.length) {
    // if there are assigned animations, we then want to pause them in case a different animation requested
    // otherwise, we want to see if the requested animation is already being run and bail if that's the case
    const animations = [] as Array<Animation>;

    // for loops are ~75% faster than array.filter
    for (const animation of assignedAnimations) {
      const proto = Object.getPrototypeOf(animation);
      if (proto === Animation.prototype) {
        animations.push(animation);
      }
    }

    // look for the most recently ran animation
    let latestAnimation = animations[0];
    for (const animation of animations) {
      if (
        Number(animation.startTime) > Number(latestAnimation?.startTime ?? 0)
      ) {
        latestAnimation = animation;
      }
    }

    return { latestAnimation, animations };
  }

  return { latestAnimation: null, animations: [] as Array<Animation> };
};

export const manageAnimationLifecycle = (
  node: HTMLElement,
  animationId: string,
): { status: "ready" | "running" } => {
  const { latestAnimation, animations } = getAnimations(node);

  if (animations?.length) {
    const isLatestAnimationRunning = latestAnimation?.playState === "running";

    const latestAnimationRendersKeyframesProvided =
      isLatestAnimationRunning &&
      latestAnimation &&
      animationId === latestAnimation.id;

    if (latestAnimationRendersKeyframesProvided) {
      // requested animation is already running;
      // clean up all other animations assigned
      for (const animation of animations) {
        // do not commit styles for all other animations
        // except for the currently running animation
        if (animation !== latestAnimation) {
          animation.onfinish = null;
        }
      }

      return { status: "running" };
    }

    // should run the keyframes provided, cancel out all the animations
    for (const animation of animations) {
      animation.commitStyles();
      animation.cancel();
    }
  }

  return { status: "ready" };
};
