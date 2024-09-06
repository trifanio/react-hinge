import {CSSProperties} from "react";

export const setNodeStyles = (node: HTMLElement, styles: CSSProperties) => {
  for (const property in styles) {
    node.style.setProperty(property, styles[property as keyof CSSProperties] as string)
  }
};
