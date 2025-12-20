# StoneScriptUI Application

A minimal starter template for StoneScriptUI applications using HTMS.

## Getting Started

```bash
# Clone this scaffold
git clone https://github.com/progalaxyelabs/stonescriptui-scaffold.git my-app
cd my-app

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
my-app/
├── src/
│   ├── app.htms       # Your app definition (pages, components)
│   ├── actions.ts     # Event handlers
│   ├── main.ts        # Entry point
│   └── styles.css     # Your styles
├── index.html
├── package.json
└── vite.config.ts
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:htms` - Compile HTMS only

## HTMS Syntax

```htms
// Define a component
component NavBar {
  nav [class: "navbar"] {
    a [href: "#/"] {{ Home }}
    a [href: "#/about"] {{ About }}
  }
}

// Define a page
page home "/" {
  NavBar
  main {
    h1 {{ Welcome }}
  }
}
```

## Documentation

- [HTMS Language](https://github.com/progalaxyelabs/htms)
- [StoneScriptUI](https://github.com/progalaxyelabs/stonescriptui)

## License

MIT
