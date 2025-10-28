# 📜 CHANGELOG

All notable changes to this project will be documented in this file.  
The format follows the conventions of Conventional Commits(https://www.conventionalcommits.org) and semantic versioning (SemVer).

---

## 🚀 2.0.0

### 💥 Breaking Changes
- Migrated from procedural script to **modular `ParamTracker` class**
- Now requires **constructor-based configuration** (custom + default settings)
- Added **validation for required parameters** — throws exception if missing

### ♻️ Refactor
- Rewritten architecture to improve maintainability and scalability
- Enhanced parameter sanitization and event binding
- Removed global functions in favor of instance methods

---

## 🔁 1.4.1
### ♻️ Refactor
- Removed handleFormSubmit function and update form submission handling to use manual click events.

---

## 🧩 1.4.0
### 🔧 Chore
- Addition of essential configuration files (`package.json`, `.eslintrc.json`, `.prettierrc`, etc.) to standardize code style and quality.

---

## 🔁 1.3.0
### ♻️ Refactor
- Update to URL parameter handling to normalize malformed queries and preserve UTM parameters

---

## 🐞 1.2.3
### 🐛 Fixes
- Fixed the use of link element parameters when they do not exist, improving script stability.

---

## ✨ 1.2.0
### ✨ Features
- Handling specific forms and improving job descriptions 

### ♻️ Refactor
- Several internal improvements to the code, including adjustments to accepted sources, class ignorance, and optimizations.

---

## 🚀 1.0.0
### ✨ Features
- Implementation of function that removes specific search parameters

### 🐛 Fixes
- Several corrections to the scope, variables, and logic of `href` construction

### ♻️ Refactor
- Separation of validations and handlers into dedicated functions
- Inclusion of code block to ensure execution after DOMContentLoaded

---

## ✨ 0.2.0
### ✨ Features
- Propagated URL parameters and handle anchors/hash in all links  

---

## 🎉 0.1.0
### 🎯 Initial Commit
- First commit  

---

## 📘 Notas

- **Commit pattern:** Conventional Commits (https://www.conventionalcommits.org)  
- **Versioning:** SemVer (`MAJOR.MINOR.PATCH`)
- **Author:** Jonas Souza (https://github.com/jonasmzsouza)
- **Repository:** Link Tracking (https://github.com/jonasmzsouza/param-tracker)

---