// Autor: Jonas Souza - 17/08/2023
// Função para verificar se um link deve ser manipulado
$(document).on("ready", function () {
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

  // Função para manipular o clique em links
  function handleLinkClick(event) {
    const linkElement = this;
    const origin = linkElement.origin;
    const target = $(linkElement).attr("target");
    const hash = linkElement.hash;
    const pathname = linkElement.pathname;
    const nextPage = origin + pathname;

    const locationHash = window.location.hash;
    const locationOrigin = window.location.origin;
    const locationPathname = window.location.pathname;
    const locationSearch = window.location.search;
    const locationPage = locationOrigin + locationPathname;

    let href;

    if (
      (origin == "https://www.domain.com" ||
        origin == "https://sub.domain.com") &&
        pathname != "/wp-admin/"
    ) {
      // Código para manipular o redirecionamento do link
      if (locationSearch) {
        href = origin + pathname + hash + locationSearch;
      } else if (linkElement.href.indexOf("#") !== -1) {
        href = origin + pathname + locationHash;
      } else {
        const parseUrl = locationHash.split("?");
        if (parseUrl[1]) {
          href = origin + pathname + "?" + parseUrl[1];
        } else {
          href = origin + pathname;
        }
      }

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

  // Adicionar um ouvinte de evento de clique apropriado aos links
  $("a").each(function () {
    if (shouldHandleLink(this)) {
      $(this).click(handleLinkClick);
    }
  });
});
