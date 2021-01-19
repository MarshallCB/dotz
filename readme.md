<div align="center">
  <img src="https://github.com/marshallcb/dotz/raw/main/meta/dotz.png" alt="dotz" width="60" />
</div>

<h1 align="center">dotz</h1>

<h3 align="center">GPU-accelerated Particle Terrains</h3>

<div align="center">
  <a href="https://npmjs.org/package/dotz">
    <img src="https://badgen.now.sh/npm/v/dotz" alt="version" />
  </a>
  <a href="https://bundlephobia.com/result?p=dotz">
    <img src="https://img.badgesize.io/MarshallCB/dotz/main/es.js?compression=brotli&color=1A5" alt="download size" />
  </a>
</div>

<h2 align="center">:construction: Work in progress :construction:</h2>

# Example

```js
import { dotz } from 'https://esm.sh/dotz';

dotz(
  // canvas element
  document.getElementById('#myCanvas'),
  // URL for terrain image (dudv map)
  "https://m4r.sh/terrains/spiral.png",
  // options
  { 
    speed: 0.5,
    fade: 0.96,
    particles: 4e5,
    colors: {
      "0.0": "transparent",
      "0.2": "#00f",
      "1.0": "#f00"
    }
  }
)
```

## References

Heavily inspired by other code. TODO: add references to blog post and original codebase

## License

MIT © [Marshall Brandt](https://m4r.sh)
