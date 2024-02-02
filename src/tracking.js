/**
 * Autor: Jonas Souza
 * Data de Criação: 17/08/2023
 * Última atualização: 31/01/2024
 *
 * Implementação para manipulação de links do site e formulários de consulta
 * Está implementação mantém alguns paramêtros de pesquisa
 * que são de origem de anúncios para fins de traqueamento
 * e remoção de outros paramêtros de pesquisa quem são de
 * origem de páginas de pesquisa do site 'siteParamsArray'.
 */

$(document).on("ready", function () {
  /////////////////////////////////LINK/////////////////////////////////////
  /**
   * Adicionar um ouvinte de evento de clique apropriado aos links
   */
  $("a").each(function () {
    if (shouldHandleLink(this)) {
      $(this).click(handleLinkClick);
    }
  });

  /**
   * Função para verificar se um link deve ser manipulado
   * Útil para ignorar alguns tipos de link.
   * @param {HTMLElement} linkElement
   * @return {bool}
   */
  function shouldHandleLink(linkElement) {
    const ignoreClasses = ["linkassiste", "filter-button", "page-numbers"];
    const ignoreProtocols = ["mailto:", "tel:"];
    const role = $(linkElement).attr("role");
    const dataToggle = $(linkElement).attr("data-toggle");
    const dataBsToggle = $(linkElement).attr("data-bs-toggle");
    const dataItems = ["button", "dropdown", "tab", "modal"];

    return (
      ignoreClasses.every((className) => !$(linkElement).hasClass(className)) &&
      !ignoreProtocols.some((protocol) =>
        linkElement.href.startsWith(protocol)
      ) &&
      !dataItems.includes(role) &&
      !dataItems.includes(dataToggle) &&
      !dataItems.includes(dataBsToggle)
    );
  }

  /**
   * Função para manipular o clique em links.
   * Útil para verificar o link do elemento é para a origen do site,
   * chamar funções com responsabilidades específicas e redirecionar o link
   * @param {Event} event
   */
  function handleLinkClick(event) {
    const linkElement = this;
    const origin = linkElement.origin;
    const pathname = linkElement.pathname;
    const target = $(linkElement).attr("target");
    const hash = linkElement.hash;
    const page = origin + pathname;

    const acceptOrigins = ["www.domain.com", "sub.domain.com"];
    const ignorePathnames = ["/wp-admin/"];

    // Verifica se o link deve ser manipulado
    const shouldHandleLink =
      acceptOrigins.some((acceptedOrigin) => origin.includes(acceptedOrigin)) &&
      !ignorePathnames.some((ignoredPathname) =>
        pathname.includes(ignoredPathname)
      );

    if (shouldHandleLink) {
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
   * Gera o href considerando diferentes cenários
   * @param {Array} linkElement
   * @param {String} origin
   * @param {String} pathname
   * @param {String} hash
   * @return {String} href
   */
  function generateHref(linkElement, origin, pathname, hash) {
    const locationHash = window.location.hash;
    const locationSearch = window.location.search;

    let href = origin + pathname;
    const isHashSymbolPresent = linkElement.href.indexOf("#") !== -1;

    if (locationSearch) {
      const newSearch = removeURLParams(locationSearch);
      href += hash + newSearch;
    } else if (isHashSymbolPresent) {
      const parseUrl = locationHash.split("?");
      const parseUrlHash = parseUrl[0];
      const newSearch = removeURLParams(parseUrl[1]);
      href += parseUrlHash + newSearch;
    } else {
      const parseUrl = locationHash.split("?");
      if (parseUrl[1]) {
        const newSearch = removeURLParams(parseUrl[1]);
        href += newSearch;
      }
    }

    return { href, isHashSymbolPresent };
  }

  /**
   * Função para remover paramêtros de busca da URL.
   * Útil navegação pós pesquisa no site
   * @param {String} search
   * @return {String} urlParams
   */
  function removeURLParams(search) {
    const siteParamsArray = ["s", "tipo", "categoria"];
    const urlParams = new URLSearchParams(search);
    siteParamsArray.forEach((param) => {
      urlParams.delete(param);
    });

    const queryString = urlParams.toString();
    const newSearch = queryString ? "?" + queryString : "";
    return newSearch;
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

    const locationOrigin = window.location.origin;
    const locationPathname = window.location.pathname;
    const locationPage = locationOrigin + locationPathname;

    if (isHashSymbolPresent) {
      if (page === locationPage) {
        if (hash) {
          $("html, body").animate(
            {
              scrollTop: $(hash).position().top,
            },
            1000,
            "easeInOutExpo"
          );
        }
      } else {
        if (target === "_blank") {
          window.open(href, "_blank");
        } else {
          window.location.href = href;
        }
      }
    } else {
      if (target === "_blank") {
        window.open(href, "_blank");
      } else {
        window.location.href = href;
      }
    }
  }

  /////////////////////////////////FORMULARIO/////////////////////////////////////

  /**
   * Adicionar um ouvinte de evento de submit apropriado aos formulários
   */
  $("form").submit(handleFormSubmit);

  /**
   * Função para verificar se um form deve ser manipulado
   * Útil para aceitar alguns formulários de busca.
   * @param {HTMLElement} formElement
   * @return {bool} bool
   */
  function shouldHandleForm(formElement) {
    const acceptIds = ["searchForm"];
    return (handleFormSubmit = acceptIds.some((acceptedId) =>
      formElement.id.includes(acceptedId)
    ));
  }

  /**
   * Função para manipular o submit em formulários.
   * Preserva URLSearchParams existente e adiciona as do formulário
   * @param {Event} event
   */
  function handleFormSubmit(event) {
    if (shouldHandleForm(this)) {
      event.preventDefault();

      const formElement = this;
      const locationHash = window.location.hash;
      let locationSearch = "";

      // Verifica se há parâmetros de consulta na hash
      if (locationHash.includes("?")) {
        const hashParts = locationHash.split("?");
        locationSearch = "?" + hashParts[1];
      } else {
        locationSearch = window.location.search;
      }

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

      // Desanexa o manipulador de evento de envio de formulário após o primeiro envio
      $(formElement).off("submit").submit();
    }
  }
});
