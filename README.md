# 🧭 Link Tracking

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
✅ Supports ES Modules (`export` / `import`)

---

## ⚙️ Installation

Clone the project and install the development dependencies:

```bash
git clone https://github.com/jonasmzsouza/link-tracking.git
cd link-tracking
npm install
```

---

## 🧠 Usage

Include the `tracking.js` script on your website:

```html
<script type="module" src="tracking.js"></script>
```

Or import into another module:

```javascript
import { addParamsToForm } from "./tracking.js";
```

The script runs automatically after DOMContentLoaded:
- Fixes all links.
- Applies clean redirect behavior.
- Handles configured forms (config.acceptFormIds).

---

## 🧩 Configuration

You can change the behavior parameters directly in the `config` object:

```javascript
const config = {
  acceptOrigins: ["domain.com"],
  acceptFormIds: ["registrationForm"],
  ignorePathnames: ["/wp-admin/"],
  ignoreClasses: ["page-numbers", "glink"],
  excludeParams: ["s", "type", "category", "paged"]
};
```

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