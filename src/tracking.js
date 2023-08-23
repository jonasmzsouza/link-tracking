/**
 * Evento de click disparado em todos os links do site para que os
 * parametros de url que vem de links patrocinados/orgânicos
 * sejam encaminhados até a formulário de inscrição.
 *
 * Esta alternativa contempla links gerados em
 * campos customizados do wordpress.
 * A regra só se aplica a links que contenham a origem (window.location.origin)
 * do site (https://www.domain.com) ou ficha de incrição (https://sub.domain.com)
 * Autor: Jonas Souza - 17/08/2023
 */
$("a").click(function (event) {
  if (
    !$(this).hasClass("linkassiste filter-button") && //se não for o elemento 'play' de vídeo ou btn filtro
    this.href.indexOf("mailto:") == -1 && //e não for email
    this.href.indexOf("tel:") == -1 && //e não for telefone
    $(this).attr("role") != "button" && //e nao for o elemento de controle carrossel
    $(this).attr("data-toggle") != "dropdown" && //e não for o elemento dropdown
    $(this).attr("data-toggle") != "tab" && //e não for o elemento tab
    $(this).attr("data-toggle") != "modal" //e não for o elemento que chama o modal
  ) {
    // se o link tiver a origem do site ou ficha de incrição
    if (
      origin == "https://www.domain.com" ||
      origin == "https://sub.domain.com"
    ) {
      let target = $(this).attr("target");
      let origin = this.origin;
      let hash = this.hash;
      let pathname = this.pathname;
      let nextPage = origin + pathname;

      let locationHash = window.location.hash;
      let locationOrigin = window.location.origin;
      let locationPathname = window.location.pathname;
      let locationSearch = window.location.search;
      let locationPage = locationOrigin + locationPathname;

      let href;

      //se tem parametros no locationSearch
      if (locationSearch) {
        href = origin + pathname + hash + locationSearch;
        //então parametros no locationHash
      } else {
        //se href tem #
        if (this.href.indexOf("#") != -1) {
          //locationHash com parametros
          href = origin + pathname + locationHash;
          //então href sem #
        } else {
          //retirar os parametros do locationHash
          let parseUrl = locationHash.split("?");
          //se tem parametros
          if (parseUrl[1]) {
            href = origin + pathname + "?" + parseUrl[1];
            //então href sem parametros
          } else {
            href = origin + pathname;
          }
        }
      }

      //se href tem #
      if (this.href.indexOf("#") != -1) {
        event.preventDefault(event);
        //mesma página
        if (locationPage == nextPage) {
          if (hash) {
            $("html, body").animate(
              {
                scrollTop: $(hash).position().top,
              },
              1000,
              "easeInOutExpo"
            );
          }
          //pagina diferente
        } else {
          if (target === "_blank") {
            window.open(href, "_blank");
          } else {
            window.location.href = href;
          }
        }
        //href sem #
      } else {
        event.preventDefault(event);
        if (target === "_blank") {
          window.open(href, "_blank");
        } else {
          window.location.href = href;
        }
      }
    }
  }
});
