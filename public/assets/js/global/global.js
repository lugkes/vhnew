$(document).ready(function() {
    // Seleciona o botão do menu hamburguer
    const mobileMenuButton = $('.mobile-menu-icon');
    // Seleciona a lista de navegação
    const navList = $('#navListContainer');

    // Adiciona um ouvinte de evento de clique ao botão do menu
    mobileMenuButton.on('click', function() {
        // Alterna a classe 'open' na lista de navegação
        navList.toggleClass('open');

        // Opcional: Alternar o ícone de hamburguer para um 'X' e vice-versa
        // Isso requer uma classe CSS para o 'X' ou outro ícone
        $(this).find('i').toggleClass('fa-bars fa-times');

        // Atualiza o atributo aria-expanded para acessibilidade
        const isExpanded = $(this).attr('aria-expanded') === 'true';
        $(this).attr('aria-expanded', !isExpanded);
    });

    // Opcional: Fechar o menu quando um link é clicado (útil em menus de página única)
    navList.find('a').on('click', function() {
        if (navList.hasClass('open')) {
            navList.removeClass('open');
            mobileMenuButton.find('i').removeClass('fa-times').addClass('fa-bars');
            mobileMenuButton.attr('aria-expanded', 'false');
        }
    });

    // Opcional: Fechar o menu se clicar fora dele (para experiência de usuário)
    $(document).on('click', function(event) {
        if (!navList.is(event.target) && navList.has(event.target).length === 0 &&
            !mobileMenuButton.is(event.target) && mobileMenuButton.has(event.target).length === 0 &&
            navList.hasClass('open')) {
            navList.removeClass('open');
            mobileMenuButton.find('i').removeClass('fa-times').addClass('fa-bars');
            mobileMenuButton.attr('aria-expanded', 'false');
        }
    });
});