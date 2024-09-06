import {CSSProperties} from "react";

export type BuiltKeyframes = Omit<
  PropertyIndexedKeyframes,
  "composite" | "easing" | "offset"
>;

type CSSPropertyValue = string | number;

// determines if a property key provided is a key that accesses animation definition on keyframes provided
const isDomAnimationCssProperty = (
  property: keyof PropertyIndexedKeyframes,
) => {
  return !["composite", "computedOffset", "easing", "offset"].includes(
    String(property),
  );
};

export const definitionContainsKeyframes = (
  definition: CSSProperties | PropertyIndexedKeyframes,
) => {
  for (const property in definition) {
    const value = (
      definition as Record<string, string | number | Array<string | number>>
    )[property];

    if (Array.isArray(value)) {
      return true;
    }
  }

  return false;
};

export const buildKeyframes = (props: {
  from?: CSSProperties;
  to: CSSProperties;
}) => {
  const keyframes = {} as BuiltKeyframes;

  if (props.from) {
    for (const property in props.from) {
      const value = props.from[
        property as keyof CSSProperties
        ] as CSSPropertyValue;

      (keyframes[property] as Array<CSSPropertyValue>) = [value];
    }
  }

  for (const property in props.to) {
    const value = props.to[property as keyof CSSProperties] as CSSPropertyValue;

    const existingKeyframe = keyframes[property];

    if (Array.isArray(existingKeyframe)) {
      (existingKeyframe as Array<CSSPropertyValue>).push(value);
    } else {
      keyframes[property] = value;
    }
  }

  return keyframes;
};

export const getKeyframesId = (
  keyframes: BuiltKeyframes,
  options: KeyframeAnimationOptions,
) => JSON.stringify(keyframes) + JSON.stringify(options);

export const extractFinalStylesFromKeyframes = (
  keyframes: PropertyIndexedKeyframes,
) => {
  const styles = {} as Record<string, any>;

  for (const property in keyframes) {
    if (isDomAnimationCssProperty(property)) {
      const value = keyframes[property];
      if (Array.isArray(value)) {
        // pick the very last keyframe value in case provided with a set of values
        styles[property] = value[value.length - 1];
      } else {
        styles[property] = value;
      }
    }
  }

  return styles as CSSProperties;
};
