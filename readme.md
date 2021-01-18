<div align="center">
  <img src="https://github.com/marshallcb/dotz/raw/main/meta/dotz.png" alt="dotz" width="100" />
</div>

<h1 align="center">dotz</h1>

<h3 align="center">GPU-accelerated Particle Terrains in ~3kB</h3>

<p align="center">:construction: Work in progress :construction:</p>

# Example

```js
let canvas = document.getElementById('#myCanvas')
let my_dotz = dotz(canvas, "https://m4r.sh/terrains/spiral.png", { 
  speed: 0.5,
  fade: 0.96,
  particles: 50000,
  colors: {
    "0.0": "transparent",
    "0.2": "#00f",
    "1.0": "#f00"
  }
})
my_dotz.speed = 1.0;
```

## References

Heavily inspired by other code. TODO: add references to blog post and original codebase

## License

MIT © [Marshall Brandt](https://m4r.sh)
