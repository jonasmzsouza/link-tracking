# 🧭 ParamTracker

JavaScript script for intelligent manipulation of **links and forms** on websites, preserving **UTM parameters** and removing irrelevant search parameters.  
Ideal for use on WordPress pages, landing pages, or any website that relies on campaign tracking.

---

## 🚀 Features

✅ Maintains UTM parameters (`utm_source`, `utm_medium`, etc.)  
✅ Removes unnecessary search parameters (`s`, `type`, `category`, etc.)  
✅ Ensures the cleanup of malformed links (with `??`, `%3F`, etc.)  
✅ Preserves `#hash` for smooth navigation between sections  
✅ Automatically adds UTMs to configured forms  
✅ Compatible with multiple domains (including subdomains)  
✅ Modular class — configurable via constructor  
✅ Supports ES Modules (`export` / `import`)

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

Include the `tracker.js` script on your website:

```html
<script type="module" src="tracker.js"></script>
```

then:

```html
<script>
// Custom configuration
const tracker = new ParamTracker({
  acceptOrigins: ["domain.com"],
  acceptFormIds: ["registrationForm"],
  ignorePathnames: ["/wp-admin/"],
  ignoreClasses: ["no-track", "page-numbers"],
  dataItems: ["tab", "modal", "collapse"],
  attributes: ["role", "data-toggle"],
  excludeParams: ["category", "type"]
});
</script>
```

Or import into another module:

```javascript
import ParamTracker from "./tracker.js";
```

The tracker now handles:
- All links within the accepted origins
- Form submissions with accepted form IDs
- URL parameter propagation and sanitization
- Event binding for clicks and anchor/hash navigation

---

## 🧩 Configuration Options

| Option            | Description                                       |
| ----------------- | ------------------------------------------------- |
| `acceptOrigins`   | Array of allowed domains for tracking             |
| `acceptFormIds`   | Array of form IDs to apply UTM propagation        |
| `ignorePathnames` | Array of URL paths to ignore                      |
| `ignoreClasses`   | Array of CSS classes to ignore                    |
| `excludeParams`   | Array of query parameters to exclude              |
| `dataItems`       | Optional array of custom data attributes to track |
| `attributes`      | Optional array of element attributes to copy      |

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

  <script type="module" src="./tracker.js"></script>
  <script type="module">
    import ParamTracker from './tracker.js';

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