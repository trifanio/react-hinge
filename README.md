<div align="center">
  <p align="center">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="/site/public/logo-light@2.png"/>
      <img src="/site/public/logo-dark@2.png" alt="react-hinge" width="272"/>
    </picture>
  </p>
  <p>The fastest way to animate React components</p>
  <a href="https://d7chwt.csb.app/" target="_blank">Compare to other libraries</a>
</div>

- [Features](#features)
- [Installation](#installation)
- [Get started](#get-started)
- [Animation](#animation)
  - [Animate](#hingeanimate)
  - [Keyframes](#keyframes)
  - [Loop animations](#loop-animations)
  - [Manual control](#manual-control)
  - [Callbacks](#callbacks)
- [Configuration](#configuration)
- [Utilities](#utilities)
- [Benchmarks](#benchmarks)
- [Acknowledgments](#acknowledgments)
- [Development](#development)

## Features

- Animate components both declaratively, or imperatively
- Run animations on the GPU layer leaving the main thread free
- Simplest API, no custom tags or wrapping of the components
- Supports all the Web Animations API features
- `1.2kb` minified and gzipped

## Installation

```bash
npm install react-hinge
```

## Get Started

The core of React Hinge is its `use` method. Supercharge any dom element or react component that accepts `ref` prop with animation capabilities.

When those values change, React Hinge will automatically render an animation to the latest values. The animation will work great by default, but it can be configured with [`KeyframeAnimationOptions`](https://developer.mozilla.org/en-US/docs/Web/API/KeyframeEffect/KeyframeEffect#examples)

```tsx
import { useHinge } from 'react-hinge'

const hinge = useHinge();

<button ref={hinge.use({
  transform: hover ? 'scale(1.05)' : 'scale(1)'
})} />
```

The second argument will be the [transition options](https://developer.mozilla.org/en-US/docs/Web/API/KeyframeEffect/KeyframeEffect#examples).
Check out [configuration](#configuration) to define default options.

## Animation

### `Hinge.animate(...)`

`Hinge.animate` is similar to `Hinge.use` method, it gives you more control over the initial state of the animation.

```tsx
import { useHinge } from 'react-hinge'

const hinge = useHinge();

{visible && (
  <MyComponent ref={hinge.animate({
    // Optional
    initial: {
      transform: 'scale(0.95)',
      opacity: 0
    },
    // Automatically animates to the latest values on change 
    animate: {
      transform: 'scale(1)',
      opacity: 1
    },
    // Not required, default options will be provided
    options: {
      // delay: 100,
      duration: 150,
      easing: 'ease-out'
    }
  })} />
)}
```

### Keyframes

Values can also be set as a series of keyframes. This will animate through each value in sequence.

```tsx
import { useHinge } from 'react-hinge'

const hinge = useHinge();

<button ref={hinge.use({
  transform: ['scale(1.05)', 'scale(1)', 'scale(1.05)', 'scale(1)'],
})} />
```

If keyframes provided to `Hinge.animate` together with initial values, React Hinge will immediately apply the initial values and kick off the animation right after.

```tsx
<button ref={hinge.animate({
  initial: {
    opacity: 1,
  },
  animate: {
    transform: ['scale(1.05)', 'scale(1)', 'scale(1.05)', 'scale(1)'],
  }
})} />
```

### Loop animations

React Hinge uses Web Animations API [effect timing options](https://developer.mozilla.org/en-US/docs/Web/API/KeyframeEffect/KeyframeEffect#examples) for transition options and so to loop your animations you need to use the same config you'd use for Web Animations API:

```tsx
import { useHinge } from 'react-hinge'

const hinge = useHinge();

<button ref={hinge.use({
  transform: ['scale(1.05)', 'scale(1)', 'scale(1.05)', 'scale(1)'],
}, {
  duration: 5000,
  iterations: Infinity,
  direction: "alternate",
  easing: "linear",
})} />
```

## Manual control

React Hinge lets you register elements one by one or in bulk and animate them on command anytime you need it.

To get started you will need to register references to your elements.

### `Hinge.to(...)`

```tsx
import { useHinge } from 'react-hinge'

const hinge = useHinge();

// Register a reference to your element first
<div ref={hinge.register('banner')} />

<button
  onClick={() => {
    hinge.to('banner', {
      opacity: 1,
    })
  }}
>
  Submit
</button>
```

### `Hinge.fromTo`

If you need more control over the initial state of the animation, you can use `hinge.fromTo` instead.

```tsx
import { useHinge } from 'react-hinge'

const hinge = useHinge();

// Register reference to your element first
<div ref={hinge.register('banner')} />

<button
  onClick={() => {
    hinge.fromTo('banner', {
      display: 'block',
      opacity: 0,
    }, {
      opacity: 1,
    })
  }}
>
  Submit
</button>
```

Both `Hinge.fromTo` and `Hinge.to` support keyframes API, just like `Hinge.animate` and `Hinge.use`

```tsx
import { useHinge } from 'react-hinge'

const hinge = useHinge();

// Register reference to your element first
<div ref={hinge.register('banner')} />

<button
  onClick={() => {
    hinge.to('banner', {
      opacity: [0, 1],
    }, {
      // Optionally pass transition options
      // Otherwise default options will be used
      duration: 650,
    })
  }}
>
  Submit
</button>
```

### Animate multiple elements

Similarly to `document.querySelectorAll('button')`, the same id passed to `Hinge.register(...)` can be used to grab multiple elements.

```tsx
import { useHinge } from 'react-hinge'

const hinge = useHinge();

// It's safe to register references to multiple elements under the same id
<div ref={hinge.register('banner')} />
<div ref={hinge.register('banner')} />
<div ref={hinge.register('banner')} />

<button
  onClick={() => {
    // Will animate all of them at the same time
    hinge.to('banner', {
      opacity: [0, 1],
    })
  }}
>
  Submit
</button>
```

Stagger animations are not supported yet. Submit a feature request if you'd like it to be prioritized.

### Callbacks

Both `Hinge.to` and `Hinge.fromTo` return an array of [`Animation`](https://developer.mozilla.org/en-US/docs/Web/API/Animation) instances they create for each of the nodes animated. You can use them to assign your callbacks:

```tsx
import { useHinge } from 'react-hinge'
import { useQuery } from 'react-query'

const hinge = useHinge();

useQuery('@example', () => {}, {
  async onSuccess() {
    const [animation] = hinge.to('toast', {
      opacity: [0,1],
      transform: ['translateY(100px)', 'translateY(0px)']
    })
    
    await animation.finished;

    // await sleep(3000);
    // router.to('/')

    // animation.addEventListener('cancel', () => {...})
    // animation.addEventListener('finish', () => {...})
    // animation.addEventListener('remove', () => {...})
  }
})

```

### Configuration

React Hinge lets you specify default transition options for every instance or define your defaults for all of them at once.

#### Per instance configuration

Default transition options are picked only once during the initial render phase. They can't be updated on the fly.

```tsx
import { useHinge } from 'react-hinge'

const hinge = useHinge({
  defaultTransitionOptions: {
    duration: 150,
    easing: "ease-out",
  }
});

<button ref={hinge.use({
  backgroundColor: hover ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.25)',
})} />
```

#### Default configuration for all instances

To replace the default configuration for React Hinge you'd need to create a separate file that exports your own useHinge instance, as follows:

```ts
import { useHinge as myHingeHook, HingeConfig } from 'react-hinge'

// Default config that comes out the box
myHingeHook.defaultConfig = {
  defaultTransitionOptions: {
    duration: 150,
    easing: "ease-out",
  },
} satisfies HingeConfig;

export const useHinge = myHingeHook;
```

Later in your app:

```tsx
import { useHinge } from '@/my-hinge'

const hinge = useHinge();

<button ref={hinge.use({
  backgroundColor: hover ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.25)',
})} />
```

### Utilities

#### Hinge.set(...)

`Hinge.set` can be used any time you need to apply styles to an element registered.

```tsx
import { useHinge } from 'react-hinge'
import { useDrag } from 'use-gesture/react'

const hinge = useHinge();

const bind = useDrag((down, movement: [mx, my]) => {
  hinge.set('banner', {
    transform: `translateX(${down ? mx : 0}px) translateY(${down ? my : 0}px)`
  })
});

<div {...bind()} ref={hinge.register('banner')} />
```

#### Hinge.getElements(...)

Use this element if you need to get access to references registered.

> [!IMPORTANT]
> `Hinge.getElements()` returns a JavaScript Set (it's not an array!) that contains HTML elements registered.

```tsx
import { useEffect } from 'react'
import { useHinge } from 'react-hinge'
import { useDrag } from 'use-gesture/react'

const hinge = useHinge();

useEffect(() => {
  const elements = hinge.getElements('banner') // Set<HTMLElement>, size=1
  for (const element of elements) {
    // ...
  }
}, [])

<div ref={hinge.register('banner')} />
```

## Benchmarks

[React Hinge vs Framer Motion vs React Spring vs GSAP vs CSS animations](https://d7chwt.csb.app)


## Acknowledgments

This project is inspired by and builds upon the ideas and work of several other projects in the React + Javascript animation ecosystems:

- [GSAP](https://github.com/greensock/GSAP) for introducing the `to`, `fromTo` and `set` functions
- [Framer Motion](https://github.com/framer/motion) for introducing simple abstraction in the form of `initial` and `animate` props
- [React Spring](https://github.com/pmndrs/react-spring) for introducing hook-based animation api in React
- [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API) for the animation engine of the library

## Development

In one terminal, run the following command to build the library and watch for changes:

```bash
npm install
npm run dev
```

In another terminal, run the following command to start the development server for the site:

(Work in progress)

```bash
cd site
npm install
npm run dev
```

