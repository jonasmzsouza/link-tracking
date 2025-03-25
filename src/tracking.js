/**
 * Autor: Jonas Souza
 * Data de Criação: 17/08/2023
 * Última atualização: 20/10/2025
 *
 * Implementação para manipulação de links do site e formulários de consulta
 * Esta implementação mantém alguns parâmetros de pesquisa
 * que são de origem de anúncios para fins de rastreamento
 * e remove outros parâmetros de pesquisa que são de
 * origem de páginas de pesquisa do site.
 */

// Configuração global
const config = {
  acceptOrigins: ["www.domain.com", "sub.domain.com"], //manipular links nas origens aceitas
  acceptFormIds: ["searchForm"], //levar o rastreamento para os formulários aceitos
  ignorePathnames: ["/wp-admin/"], //ignorar o rastreamento em pathnames específicos
  ignoreClasses: ["linkassiste", "filter-button", "page-numbers", "load-more"], //ignorar os links que contém as classes
  ignoreProtocols: ["mailto:", "tel:"], //ignorar os links que contém os protocolos
  ignoreExtensions: [".pdf", ".doc", ".docx", ".xls", ".xlsx"], //ignorar extensões de arquivo
  dataItems: ["button", "dropdown", "tab", "modal"], ///ignorar os links que contém os valores data em atributos específicos de link
  attributes: ["role", "data-toggle", "data-bs-toggle"], //atributos específicos de link
  excludeParams: ["s", "tipo", "categoria", "termo"], //remover os parametros de pesquisa
};

/**
 * Função para verificar se um link deve ser manipulado
 * Útil para ignorar alguns tipos de link.
 * @param {HTMLElement} linkElement
 * @return {bool}
 */
function shouldHandleLink(linkElement) {
  const {
    ignoreClasses,
    ignoreProtocols,
    ignoreExtensions,
    dataItems,
    attributes,
  } = config;

  // Ignorar links com classes especificadas
  if (ignoreClasses.some((className) => linkElement.classList.contains(className))) {
    return false;
  }

  // Ignorar links com protocolos específicos (mailto:, tel:, etc.)
  const linkHref = linkElement.getAttribute("href") || "";
  if (ignoreProtocols.some((protocol) => linkHref.startsWith(protocol))) {
    return false;
  }

  // Ignorar links que terminam com extensões de arquivos especificadas
  if (ignoreExtensions.some((ext) => linkHref.endsWith(ext))) {
    return false;
  }

  // Ignorar links que possuem atributos específicos com valores em dataItems
  for (const attribute of attributes) {
    const attrValue = linkElement.getAttribute(attribute);
    if (attrValue && dataItems.includes(attrValue)) {
      return false;
    }
  }

  return true;
}

/**
 * Função para manipular o clique em links.
 * Útil para verificar o link do elemento é para a origen do site,
 * chamar funções com responsabilidades específicas e redirecionar o link
 * @param {Event} event
 * @param {HTMLElement} linkElement
 */
function handleLinkClick(event, linkElement) {
  const origin = linkElement.origin;
  const pathname = linkElement.pathname;
  const target = linkElement.getAttribute("target");
  const hash = linkElement.hash;
  const page = origin + pathname;

  const { acceptOrigins, ignorePathnames } = config;

  if (
    acceptOrigins.some((acceptedOrigin) => origin.includes(acceptedOrigin)) &&
    !ignorePathnames.some((ignoredPathname) => pathname.includes(ignoredPathname))
  ) {
    const { href, isHashSymbolPresent } = generateHref(linkElement, origin, pathname, hash);
    handleLinkRedirect(event, isHashSymbolPresent, href, page, hash, target);
  }
}

/**
 * Gera o href considerando diferentes cenários
 * @param {HTMLElement} linkElement
 * @param {String} origin
 * @param {String} pathname
 * @param {String} hash
 * @return {Object} {href, isHashSymbolPresent}
 */
function generateHref(linkElement, origin, pathname, hash) {
  const locationHash = window.location.hash;
  const locationSearch = window.location.search;

  let href = origin + pathname;
  let newSearch = "";
  const isHashSymbolPresent = linkElement.href.includes("#");

  if (locationSearch) {
    newSearch = removeURLParams(locationSearch);
    href += newSearch + hash;
  } else if (locationHash) {
    const parseUrl = locationHash.split("?");
    if (parseUrl[1]) {
      newSearch = removeURLParams(parseUrl[1]);
    }
    href += isHashSymbolPresent ? newSearch + hash : newSearch;
  } else {
    href += hash;
  }

  return { href, isHashSymbolPresent };
}

/**
 * Remove parâmetros de busca da URL
 * Útil navegação pós pesquisa no site
 * @param {String} search
 * @return {String}
 */
function removeURLParams(search) {
  const { excludeParams } = config;
  const urlParams = new URLSearchParams(search);

  excludeParams.forEach((param) => {
    urlParams.delete(param);
  });

  return urlParams.toString() ? "?" + urlParams.toString() : "";
}

/**
* Redireciona o link para diferentes cenários
* @param {Event} event
* @param {bool} isHashSymbolPresent
* @param {String} href
* @param {String} page
* @param {String} hash
* @param {String} target
*/
function handleLinkRedirect(event, isHashSymbolPresent, href, page, hash, target) {
  event.preventDefault();

  const locationPage = window.location.origin + window.location.pathname;

  if (isHashSymbolPresent && page === locationPage && hash) {
    document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
    return;
  }

  target === "_blank" ? window.open(href, "_blank") : (window.location.href = href);
}

/**
 * Verifica se o formulário deve ser manipulado
 * Útil para aceitar alguns formulários de busca.
 * @param {HTMLFormElement} formElement
 * @return {bool}
 */
function shouldHandleForm(formElement) {
  const { acceptFormIds } = config;
  return acceptFormIds.some((acceptedFormId) =>
    formElement.id.includes(acceptedFormId)
  );
}

/**
* Adiciona parâmetros UTM ao formulário antes do envio.
* @param {HTMLFormElement} formElement
*/
function addParamsToForm(formElement) {
  const locationHash = window.location.hash;
  let locationSearch = locationHash.includes("?")
    ? "?" + locationHash.split("?")[1]
    : window.location.search;

  if (locationSearch) {
    const urlParams = new URLSearchParams(removeURLParams(locationSearch));

    for (const [key, value] of urlParams) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value;
      formElement.appendChild(input);
    }
  }
}

/**
 * Manipula o envio do formulário
 * Preserva URLSearchParams existente e adiciona as do formulário
 * @param {Event} event
 */
function handleFormSubmit(event) {
  const formElement = event.target;

  if (shouldHandleForm(formElement)) {
    event.preventDefault();

    addParamsToForm(formElement);

    // Desanexa o manipulador de evento de envio de formulário após o primeiro envio
    formElement.removeEventListener("submit", handleFormSubmit);
    formElement.submit();
  }
}

// Inicialização
document.addEventListener("DOMContentLoaded", function () {

  // Manipulação de links
  document.addEventListener("click", function (event) {
    const linkElement = event.target.closest("a");
    if (!linkElement || !shouldHandleLink(linkElement)) return;
    handleLinkClick(event, linkElement);
  });

  // Animação de scrollTop para links com target="_blank"
  if (window.location.hash) {
    document
      .querySelector(window.location.hash)
      ?.scrollIntoView({ behavior: "smooth" });
  }

  // Manipulação de formulários
  document.querySelectorAll("form").forEach((form) => {
    form.addEventListener("submit", handleFormSubmit);
  });
});

export { addParamsToForm };