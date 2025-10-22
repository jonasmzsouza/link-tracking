/**
 * Autor: Jonas Souza
 * Data de Criação: 17/08/2023
 * Última atualização: 22/10/2025
 *
 * Implementação para manipulação de links do site e formulários de consulta
 * Esta implementação mantém alguns parâmetros de pesquisa
 * que são de origem de anúncios para fins de rastreamento
 * e remove outros parâmetros de pesquisa que são de
 * origem de páginas de pesquisa do site.
 */

// Configuração global
const config = {
  acceptOrigins: ["domain.com"], //manipular links nas origens aceitas
  acceptFormIds: ["searchForm"], //levar o rastreamento para os formulários aceitos
  ignorePathnames: ["/wp-admin/"], //ignorar o rastreamento em pathnames específicos
  ignoreClasses: ["linkassiste", "filter-button", "page-numbers", "load-more", "glink", "nturl"], //ignorar os links que contém as classes
  ignoreProtocols: ["mailto:", "tel:"], //ignorar os links que contém os protocolos
  ignoreExtensions: [".pdf", ".doc", ".docx", ".xls", ".xlsx"], //ignorar extensões de arquivo
  dataItems: ["button", "dropdown", "tab", "modal"], ///ignorar os links que contém os valores data em atributos específicos de link
  attributes: ["role", "data-toggle", "data-bs-toggle"], //atributos específicos de link
  excludeParams: ["s", "tipo", "categoria", "termo", "paged"], //remover os parametros de pesquisa
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
  if (
    ignoreClasses.some((className) => linkElement.classList.contains(className))
  ) {
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
 * Função auxiliar para verificar se a origem é aceita
 * Aceita tanto o domínio principal quanto subdomínios (*.domain.com)
 * @param {String} origin
 * @return {bool}
 */
function isAcceptedOrigin(origin) {
  try {
    const { hostname } = new URL(origin);

    return config.acceptOrigins.some((baseDomain) => {
      // Normaliza o domínio base (remove espaços e converte para minúsculo)
      const cleanDomain = baseDomain.trim().toLowerCase();

      // Aceita se o hostname for igual ao domínio base
      if (hostname === cleanDomain) return true;

      // Aceita se o hostname terminar com ".dominioBase"
      return hostname.endsWith(`.${cleanDomain}`);
    });
  } catch (error) {
    console.warn("URL inválida em isAcceptedOrigin:", origin, error);
    return false;
  }
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

  const { ignorePathnames } = config;

  if (
    isAcceptedOrigin(origin) &&
    !ignorePathnames.some((ignoredPathname) => pathname.includes(ignoredPathname))
  ) {
    const { href, isHashSymbolPresent } = generateHref(
      linkElement,
      origin,
      pathname,
      hash
    );
    handleLinkRedirect(event, isHashSymbolPresent, href, page, hash, target);
  }
}

/**
 * Normaliza uma query string possivelmente malformada que pode conter
 * "??", params embutidos em valores (ex: custom=example?utm_source=example) ou %3F.
 * Retorna um URLSearchParams com todos os pares corretamente extraídos.
 * @param {string} rawQuery - ex: "?custom=example?utm_source=example&utm_medium=example"
 * @returns {URLSearchParams}
 */
function normalizeQueryString(rawQuery) {
  // remove prefixos ? ou &
  let remaining = (rawQuery || "").replace(/^[\?&]+/, "");

  const result = new URLSearchParams();

  while (remaining) {
    // Se houver um '?' dentro da string, separamos a primeira parte (antes do '?')
    // e o restante (após), que pode ser outra query. Usamos split com limit 2.
    const [firstPart, rest] = remaining.split(/\?(.+)/s); // quebra na primeira '?'
    // Parseia a primeira parte normalmente (pode conter vários &)
    const firstParams = new URLSearchParams(firstPart);
    for (const [k, v] of firstParams) {
      result.append(k, v);
    }
    if (!rest) break; // nada mais para processar
    // Agora "rest" é o restante após o '?', pode começar com utm_source=...
    // Preparamos next round para analisar o restante como nova query
    // Se rest contém novo '?', o loop continuará.
    remaining = rest;
  }

  // Se original não tinha '?', o while acima executou apenas uma vez e já retornou tudo.

  // Tratamento extra: também decodifica valores que contenham %3F codificado
  // e tenta separar nesses casos. Ex: custom=example%3Futm_source%3Dteste
  // Vamos procurar valores que contenham %3F e dividir.
  const entries = Array.from(result.entries());
  for (const [k, v] of entries) {
    if (v.includes("%3F") || v.includes("%3f")) {
      const decoded = decodeURIComponent(v);
      if (decoded.includes("?")) {
        const [valBefore, valAfter] = decoded.split(/\?(.+)/s);
        // atualiza o valor do parâmetro original (mantém o primeiro segmento)
        result.set(k, valBefore);
        // adiciona os parâmetros restantes
        const tailParams = new URLSearchParams(valAfter);
        for (const [tk, tv] of tailParams) {
          // append - pois pode haver múltiplos valores
          if (!result.has(tk)) result.append(tk, tv);
        }
      }
    }
  }

  return result;
}

/**
 * Faz merge seguro entre parâmetros da página atual e do link,
 * preservando UTMs da página quando existirem e normalizando queries malformadas.
 *
 * @param {string} baseUrl - ex: 'https://domain.com/page'
 * @param {string} rawLinkQuery - ex: linkUrl.search (pode ser malformada)
 * @param {string} rawCurrentQuery - ex: window.location.search
 * @param {Array<string>} excludeParams - lista de params a remover
 * @returns {string} URL final (baseUrl + '?' + mergedParams) ou baseUrl se vazio
 */
function sanitizeAndMergeParams(baseUrl, rawLinkQuery = "", rawCurrentQuery = "", excludeParams = []) {
  try {
    // Normaliza queries malformadas
    const linkSearch = normalizeQueryString(rawLinkQuery);
    const currentSearch = new URLSearchParams((rawCurrentQuery || "").replace(/^[\?&]+/, ""));

    // UTMs que queremos preservar da página atual, se existirem
    const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_id", "utm_term", "utm_content"];

    // Primeiro, adiciona os parâmetros do link à currentSearch,
    // mas NÃO sobrescreve UTMs que já existam em currentSearch.
    for (const [key, value] of linkSearch.entries()) {
      const keyLower = key.toLowerCase();
      const isUtm = utmKeys.includes(keyLower);
      if (isUtm && currentSearch.has(key)) {
        // preserva currentSearch (não sobrescreve)
        continue;
      }
      // caso contrário, set (sobrescreve ou adiciona)
      currentSearch.set(key, value);
    }

    // Remove parâmetros indesejados
    excludeParams.forEach((p) => currentSearch.delete(p));

    const finalQuery = currentSearch.toString();
    return finalQuery ? `${baseUrl}?${finalQuery}` : baseUrl;
  } catch (err) {
    console.error("[sanitizeAndMergeParams] erro:", err);
    return baseUrl;
  }
}

/**
 * Atualiza generateHref para usar sanitizeAndMergeParams,
 * preservando o hash (#) corretamente.
 * @param {HTMLElement} linkElement
 * @param {String} origin
 * @param {String} pathname
 * @param {String} hash
 * @return {Object} { href: String, isHashSymbolPresent: bool }
 */
function generateHref(linkElement, origin, pathname, hash) {
  const { excludeParams } = config;

  const baseUrl = origin + pathname;
  const linkUrl = new URL(linkElement.href);
  const linkQuery = linkUrl.search; // pode ser malformada (ex: ?custom=example?utm_source=...)
  const currentQuery = window.location.search;

  const merged = sanitizeAndMergeParams(baseUrl, linkQuery, currentQuery, excludeParams);

  // Garante que o hash seja mantido (se existir)
  const hasHash = !!hash;
  const finalHref = merged + (hasHash ? hash : "");

  return { href: finalHref, isHashSymbolPresent: hasHash };
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
function handleLinkRedirect(
  event,
  isHashSymbolPresent,
  href,
  page,
  hash,
  target
) {
  event.preventDefault();

  const locationPage = window.location.origin + window.location.pathname;

  if (isHashSymbolPresent && page === locationPage && hash) {
    document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
    return;
  }

  target === "_blank"
    ? window.open(href, "_blank")
    : (window.location.href = href);
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
  // Corrige links malformados no HTML após o carregamento (camada de segurança extra)
  document.querySelectorAll("a[href]").forEach((link) => {
    if (!shouldHandleLink(link)) return;

    const url = new URL(link.href);

    // Mantém o hash original
    const hash = url.hash || "";

    const sanitized = sanitizeAndMergeParams(
      url.origin + url.pathname,
      url.search,
      "",
      config.excludeParams
    );

    // Reanexa o hash, se existir
    const sanitizedWithHash = sanitized + hash;

    if (sanitizedWithHash !== link.href) {
      link.href = sanitizedWithHash;
    }
  });

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
