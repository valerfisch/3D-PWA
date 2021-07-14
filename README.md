# 3D-PWA

This project includes a PWA with two self-contained graphics pipelines.
## Project setup

As this project was used in combination with Vue.js please be sure to have Vue.js installed [(see here)](https://vuejs.org/v2/guide/installation.html) but 

```
npm install vue
```
should suffice. Then run
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Run as a PWA
As a PWA has to have a signed certificate, one can use [mkcert](https://github.com/FiloSottile/mkcert), then exchange the localhost+3-key.pem and localhost+3.pem files and then run

```
npm run serve-safe
```

You then should be able to register the service worker and install the PWA.