/**
 * Autor: Jonas Souza
 * Data de Criação: 17/08/2023
 * Última atualização: 12/12/2023
 *
 * Implementação para manipulação de links do site
 * Está implementação mantém alguns paramêtros de pesquisa
 * que são de origem de anúncios para fins de traqueamento
 * e remoção de outros paramêtros de pesquisa quem são de
 * origem de páginas de pesquisa do site 'paramsSiteArray'.
 */

$(document).on("ready", function () {
    /**
   * Função para verificar se um link deve ser manipulado
   * Útil para ignorar açguns tipos de link.
   * @param linkElement HTMLElement
   */
  function shouldHandleLink(linkElement) {
    const ignoreClasses = ["linkassiste", "filter-button"];
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
   * Função para remover paramêtros de busca da URL.
   * Útil navegação pós pesquisa no site
   * @param paramsSiteArray Array
   * @param search String
   * @return urlParams String
   */
  function removeURLParams(paramsSiteArray, search) {
    const urlParams = new URLSearchParams(search);
    paramsSiteArray.forEach((param) => {
      urlParams.delete(param);
    });

    const queryString = urlParams.toString();
    const newSearch = queryString ? "?" + queryString : "";
    return newSearch;
  }

  /**
   * Função para manipular o clique em links.
   * Útil para verificar o link do elemento é para a origen do site,
   * chamar funções com responsabilidades específicas e redirecionar o link
   * @param event Event
   */
  function handleLinkClick(event) {
    const linkElement = this;
    const origin = linkElement.origin;
    const pathname = linkElement.pathname;
    const target = $(linkElement).attr("target");
    const hash = linkElement.hash;
    const nextPage = origin + pathname;

    if (
      (origin == "https://www.domain.com" ||
        origin == "https://sub.domain.com") &&
      !pathname.includes("/wp-admin/")
    ) {
      const locationHash = window.location.hash;
      const locationOrigin = window.location.origin;
      const locationPathname = window.location.pathname;
      const locationSearch = window.location.search;
      const locationPage = locationOrigin + locationPathname;

      const paramsSiteArray = ["s", "tipo", "categoria"];
      let href;

      // gera href abrangendo diversos cenários
      if (locationSearch) {
        const newSearch = removeURLParams(paramsSiteArray, locationSearch);
        href = origin + pathname + hash + newSearch;
      } else if (linkElement.href.indexOf("#") !== -1) {
        const parseUrl = locationHash.split("?");
        const parseUrlHash = parseUrl[0];
        const newSearch = removeURLParams(paramsSiteArray, parseUrl[1]);
        href = origin + pathname + parseUrlHash + newSearch;
      } else {
        const parseUrl = locationHash.split("?");
        if (parseUrl[1]) {
          const newSearch = removeURLParams(paramsSiteArray, parseUrl[1]);
          href = origin + pathname + newSearch;
        } else {
          href = origin + pathname;
        }
      }

      // redireciona o link para diversos cenários
      if (linkElement.href.indexOf("#") !== -1) {
        event.preventDefault();
        if (locationPage === nextPage) {
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
        event.preventDefault();
        if (target === "_blank") {
          window.open(href, "_blank");
        } else {
          window.location.href = href;
        }
      }
    }
  }

  /**
   * Adicionar um ouvinte de evento de clique apropriado aos links
   */
  $("a").each(function () {
    if (shouldHandleLink(this)) {
      $(this).click(handleLinkClick);
    }
  });
});
