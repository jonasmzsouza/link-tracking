# 🧭 ParamTracker

**ParamTracker** is a lightweight JavaScript utility for intelligent manipulation of **links** and **forms**, preserving **UTM parameters**, cleaning irrelevant search parameters, and ensuring consistent URL behavior across your website.
Ideal for use on WordPress pages, landing pages, or any website that relies on campaign tracking.

Now available for **ES Modules** *and* **global browser usage (UMD/IIFE)** — no build tools required.

---

## 🚀 Features

✅ Preserves UTM parameters (`utm_source`, `utm_medium`, etc.)  
✅ Removes unnecessary search parameters (`s`, `type`, `category`, etc.)  
✅ Ensures cleanup of malformed links (`??`, `%3F`, etc.)  
✅ Keeps anchors (`#hash`) for smooth navigation  
✅ Automatically propagates UTMs to configured forms  
✅ Supports multiple domains (including subdomains)  
✅ Works with ES Modules (`import/export`) **or directly in browsers** via UMD/IIFE

---

## ⚙️ Installation

Clone the project and install the development dependencies:

```bash
git clone https://github.com/jonasmzsouza/param-tracker.git
cd param-tracker
npm install
```

---

## 🧠 Usage

#### 1. ES Modules
```javascript
import ParamTracker from './tracker.min.js';

const tracker = new ParamTracker({
  acceptOrigins: ['example.com'],
  acceptFormIds: ['registrationForm']
  // custom configuration
});
```

#### 2. Global / Browser (UMD/IIFE)
```html
<script src="./tracker.min.js"></script>
<script>
  const tracker = new ParamTracker({
    acceptOrigins: ['example.com'],
    acceptFormIds: ['registrationForm']
    // custom configuration
  });

  tracker.init();
</script>
```

#### 3. Node.js / CommonJS

```javascript
const { ParamTracker } = require('./tracker.min.js');

const tracker = new ParamTracker({
  acceptOrigins: ['example.com'],
  acceptFormIds: ['registrationForm']
  // custom configuration
});
```

The tracker now handles:
- All links within the accepted origins
- Adds parameters to accepted forms.
- URL parameter propagation and sanitization
- Event binding for clicks and anchor/hash navigation

---

## 🧩 Configuration Options

| Option            | Type       | Description                                |
| ----------------- | ---------- | ------------------------------------------ |
| `acceptOrigins`   | `string[]` | Domains/subdomains allowed for propagation |
| `acceptFormIds`   | `string[]` | Form IDs that should receive UTMs          |
| `ignoreClasses`   | `string[]` | Classes to ignore from tracking            |
| `ignorePathnames` | `string[]` | URL pathnames to exclude                   |
| `excludeParams`   | `string[]` | Parameters to remove from the URL          |
| `dataItems`       | `string[]` | Data attributes to include in propagation  |
| `attributes`      | `string[]` | Extra attributes to manage in propagation  |

---

## ⚡ Quick Start

A quick example of using **ParamTracker** on a website with links and forms.

---

### 1. HTML Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ParamTracker Demo</title>
</head>
<body>

  <!-- Example Links -->
  <a href="https://example.com/page1?utm_source=google&utm_medium=cpc">Page 1</a>
  <a href="https://example.com/page2">Page 2</a>

  <!-- Example Form -->
  <form id="registrationForm">
    <input type="text" name="name" placeholder="Name">
    <input type="email" name="email" placeholder="Email">
    <button type="submit">Submit</button>
  </form>

  <script src="./tracker.min.js"></script>
  <script>
    // Initialize tracker with configuration
    const tracker = new ParamTracker({
      acceptOrigins: ["example.com"],
      acceptFormIds: ["registrationForm"],
      ignoreClasses: ["no-track"],
      excludeParams: ["s", "type", "category"]
    });
  </script>

</body>
</html>
```

### 2. How it Works
1. Links:
 - Preserves UTM parameters across all clicks on accepted domains.
 - Sanitizes invalid/malformed query strings.
 - Preserves #hash for smooth navigation.
2. Forms:
- Automatically appends preserved UTM parameters to configured forms.
- Ignores forms not included in acceptFormIds.
3. Configuration:
- Add multiple domains via acceptOrigins.
- Exclude specific URL parameters or elements with ignoreClasses.
- Track custom data attributes using dataItems and attributes.

### 3. Example Output
- Clicking `<a href="https://example.com/page2">` with `?utm_source=google` on the current page will navigate to:

```bash
https://example.com/page2?utm_source=google
```

- Submitting the form will automatically include UTM parameters in the POST request.

### 4. Notes
- The tracker only affects links and forms within the accepted origins.
- Works in modern browsers supporting ES Modules (import / export).
---

## 🧪 Scripts úteis

- Lint:
```bash
npm run lint
```

- Lint with automatic correction:
```bash
npm run lint:fix
```

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

---

## ✨ Author

<table>
  <tr>
    <td align="center">
      <a href="https://jonasmzsouza.github.io/">
         <img style="border-radius: 50%;" src="https://avatars.githubusercontent.com/u/61324433?v=4" width="100px;" alt=""/>
         <br />
         <sub><b>Jonas Souza</b></sub>
      </a>
    </td>
  </tr>
</table>
 
💼 [LinkedIn](https://linkedin.com/in/jonasmzsouza)
💻 [GitHub](https://github.com/jonasmzsouza)