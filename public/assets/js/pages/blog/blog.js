$(document).ready(function() {
    const postsContainer = $('#postsContainer');
    const noPostsMessage = $('.no-posts-message');
    const postModal = $('#postModal');
    const openPostModalBtn = $('#openPostModalBtn');
    const closeButton = $('.close-button');
    const postTitleInput = $('#postTitleInput');
    const postContentInput = $('#postContentInput');
    const charCount = $('#charCount');
    const publishPostBtn = $('#publishPostBtn');

    // Edit Modal elements
    const editPostModal = $('#editPostModal');
    const closeEditButton = $('.close-edit-button');
    const editPostIdInput = $('#editPostId');
    const editPostTitleInput = $('#editPostTitleInput');
    const editPostContentInput = $('#editPostContentInput');
    const editCharCount = $('#editCharCount');
    const saveEditedPostBtn = $('#saveEditedPostBtn');

    const MAX_CHARS = 500;

    // --- Funções Auxiliares ---

    // Atualiza a contagem de caracteres
    function updateCharCount(textarea, counter) {
        const currentLength = textarea.val().length;
        counter.text(`${currentLength}/${MAX_CHARS}`);
        if (currentLength > MAX_CHARS) {
            counter.css('color', 'red');
        } else {
            counter.css('color', '');
        }
    }

    // Cria e exibe um post no DOM
    function displayPost(post) {
        const postElement = `
            <div class="blog-post-card" data-post-id="${post.id}" data-user-id="${post.user_id}">
                ${post.title ? `<h3>${post.title}</h3>` : ''}
                <p>${post.content.replace(/\n/g, '<br>')}</p>
                <div class="post-meta">
                    <span>Publicado em: ${new Date(post.timestamp).toLocaleString()}</span>
                    <span class="user-id">ID do Usuário: ${post.user_id}</span>
                </div>
                <div class="post-actions">
                    <button class="edit-btn" data-post-id="${post.id}" data-title="${post.title || ''}" data-content="${post.content}">Editar</button>
                    <button class="delete-btn" data-post-id="${post.id}">Apagar</button>
                </div>
            </div>
        `;
        postsContainer.prepend(postElement); // Adiciona o novo post no topo
        noPostsMessage.hide(); // Esconde a mensagem de "sem posts"
    }

    // Carrega todos os posts do backend
    async function fetchPosts() {
        try {
            const response = await fetch('/api/posts'); // Endpoint da sua API
            const posts = await response.json();

            postsContainer.empty(); // Limpa os posts existentes antes de carregar
            if (posts.length === 0) {
                noPostsMessage.show();
            } else {
                noPostsMessage.hide();
                posts.forEach(displayPost);
            }
        } catch (error) {
            console.error('Erro ao buscar posts:', error);
            postsContainer.html('<p>Ocorreu um erro ao carregar os desabafos. Por favor, tente novamente mais tarde.</p>');
        }
    }

    // --- Event Listeners ---

    // Abrir modal de nova postagem
    openPostModalBtn.on('click', function() {
        postModal.show();
        postContentInput.focus(); // Foca no campo de texto ao abrir
        updateCharCount(postContentInput, charCount); // Atualiza contagem inicial
    });

    // Fechar modal de nova postagem
    closeButton.on('click', function() {
        postModal.hide();
    });

    // Fechar modal de edição
    closeEditButton.on('click', function() {
        editPostModal.hide();
    });

    // Fechar modais ao clicar fora
    $(window).on('click', function(event) {
        if ($(event.target).is(postModal)) {
            postModal.hide();
        }
        if ($(event.target).is(editPostModal)) {
            editPostModal.hide();
        }
    });

    // Atualizar contagem de caracteres ao digitar na nova postagem
    postContentInput.on('input', function() {
        updateCharCount(postContentInput, charCount);
    });

    // Publicar novo desabafo
    publishPostBtn.on('click', async function() {
        const title = postTitleInput.val().trim();
        const content = postContentInput.val().trim();
        const userId = 'usuario_test_123'; // **IMPORTANTE: Substitua por um ID de usuário real (ex: vindo de um login)**

        if (content.length === 0) {
            alert('Por favor, escreva seu desabafo antes de publicar.');
            return;
        }
        if (content.length > MAX_CHARS) {
            alert(`Seu desabafo tem ${content.length} caracteres, o máximo permitido é ${MAX_CHARS}.`);
            return;
        }

        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, content, userId }),
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                displayPost(data.post);
                postModal.hide();
                postTitleInput.val('');
                postContentInput.val('');
                updateCharCount(postContentInput, charCount);
            } else {
                alert('Erro ao publicar desabafo: ' + (data.message || 'Erro desconhecido.'));
                console.error('Erro de API:', data);
            }
        } catch (error) {
            console.error('Erro ao enviar postagem:', error);
            alert('Erro de rede ao publicar desabafo. Verifique sua conexão ou a URL da API.');
        }
    });

    // Lógica para Editar Post
    postsContainer.on('click', '.edit-btn', function() {
        const postId = $(this).data('post-id');
        const postTitle = $(this).data('title');
        const postContent = $(this).data('content');

        editPostIdInput.val(postId);
        editPostTitleInput.val(postTitle);
        editPostContentInput.val(postContent);
        updateCharCount(editPostContentInput, editCharCount); // Atualiza a contagem para o modal de edição
        editPostModal.show();
    });

    // Atualizar contagem de caracteres ao digitar na edição
    editPostContentInput.on('input', function() {
        updateCharCount(editPostContentInput, editCharCount);
    });

    saveEditedPostBtn.on('click', async function() {
        const postId = editPostIdInput.val();
        const title = editPostTitleInput.val().trim();
        const content = editPostContentInput.val().trim();
        const userId = 'usuario_test_123'; // **DEVE ser o mesmo userId do post original para permissão**

        if (content.length === 0) {
            alert('O conteúdo do desabafo não pode estar vazio.');
            return;
        }
        if (content.length > MAX_CHARS) {
            alert(`Seu desabafo tem ${content.length} caracteres, o máximo permitido é ${MAX_CHARS}.`);
            return;
        }

        try {
            const response = await fetch(`/api/posts/${postId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, content, userId }),
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                editPostModal.hide();
                fetchPosts(); // Recarrega todos os posts para mostrar a atualização
            } else {
                alert('Erro ao atualizar desabafo: ' + (data.message || 'Erro desconhecido.'));
                console.error('Erro de API:', data);
            }
        } catch (error) {
            console.error('Erro ao salvar edição:', error);
            alert('Erro de rede ao salvar alterações. Verifique sua conexão ou a URL da API.');
        }
    });

    // Lógica para Apagar Post
    postsContainer.on('click', '.delete-btn', async function() {
        const postId = $(this).data('post-id');
        const userId = 'usuario_test_123'; // **DEVE ser o mesmo userId do post original para permissão**

        if (confirm('Tem certeza que deseja apagar este desabafo?')) {
            try {
                const response = await fetch(`/api/posts/${postId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userId }), // Envia o userId no corpo para verificação no backend
                });

                const data = await response.json();

                if (response.ok) {
                    alert(data.message);
                    // Remove o post do DOM
                    $(`.blog-post-card[data-post-id="${postId}"]`).remove();
                    // Verifica se não há mais posts para exibir a mensagem
                    if (postsContainer.children('.blog-post-card').length === 0) {
                        noPostsMessage.show();
                    }
                } else {
                    alert('Erro ao apagar desabafo: ' + (data.message || 'Erro desconhecido.'));
                    console.error('Erro de API:', data);
                }
            } catch (error) {
                console.error('Erro ao apagar post:', error);
                alert('Erro de rede ao apagar desabafo. Verifique sua conexão ou a URL da API.');
            }
        }
    });

    // Carregar posts ao iniciar a página
    fetchPosts();
});
// No seu blog.js, dentro da função de click do botão Publicar
$('#publishPostBtn').on('click', async function() {
    const title = $('#postTitleInput').val();
    const content = $('#postContentInput').val();
    const userId = 'usuario_exemplo'; // Você precisará implementar um sistema de usuário real

    try {
        const response = await fetch('/api/posts', { // Ou '/.netlify/functions/create-post' se não usar o redirect
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, content, userId }),
        });

        const data = await response.json();

        if (response.ok) {
            console.log(data.message);
            // Adicione o novo post ao DOM
            displayPost(data.post); // Função para exibir um post (você vai precisar criar)
            $('#postModal').hide(); // Fechar modal
            // Limpar campos
            $('#postTitleInput').val('');
            $('#postContentInput').val('');
            updateCharCount();
        } else {
            alert('Erro ao publicar desabafo: ' + data.message);
        }
    } catch (error) {
        console.error('Erro ao enviar postagem:', error);
        alert('Erro de rede ao publicar desabafo.');
    }
});