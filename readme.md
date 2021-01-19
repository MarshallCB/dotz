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
<br/>

<div align="center">
  <img src="https://github.com/marshallcb/dotz/raw/main/meta/demo.gif" alt="dotz demo" width="600" />
</div>
<br/>
<h3 align="center">
  <a href="#Usage"><b>Usage</b></a> | 
  <a href="#API"><b>API</b></a> | 
  <a href="#Terrains"><b>Terrains</b></a> | 
  <a href="#Details"><b>Details</b></a>
</h3>

---

# Usage

[**Edit on CodePen**](https://codepen.io/marshallcb/pen/bGwzZNe)
```js
import { Dotz } from 'https://esm.sh/dotz';

let my_dotz = new Dotz(
  // canvas element
  document.getElementById('#myCanvas'),
  // URL for terrain image (dudv map)
  "https://m4r.sh/terrains/spiral.png",
  // options
  { 
    speed: 0.5,
    fade: 0.8,
    particles: 4e5,
    colors: {
      "0.0": "transparent",
      "0.1": "hsl(240,100%, 50%)",
      "0.5": "hsl(300,100%, 50%)",
      "1.0": "hsl(60 ,100%, 50%)"
    }
  }
)
```

# API

Coming soon

# Terrains

Coming soon

# Details

Coming soon

# References

Heavily inspired by other code. TODO: add references to blog post and original codebase

# License

MIT © [Marshall Brandt](https://m4r.sh)
