document.addEventListener('DOMContentLoaded', () => {
    // Referências aos elementos HTML principais para criação de posts
    const openPostModalBtn = document.getElementById('openPostModalBtn');
    const postModal = document.getElementById('postModal');
    const closeButton = document.querySelector('#postModal .close-button');
    const postTitleInput = document.getElementById('postTitleInput');
    const postContentInput = document.getElementById('postContentInput');
    const charCount = document.getElementById('charCount');
    const publishPostBtn = document.getElementById('publishPostBtn');
    const postsContainer = document.getElementById('postsContainer');
    const noPostsMessage = document.querySelector('.no-posts-message');

    // Referências para o Modal de Edição
    const editPostModal = document.getElementById('editPostModal');
    const closeEditButton = document.querySelector('#editPostModal .close-edit-button');
    const editPostId = document.getElementById('editPostId');
    const editPostTitleInput = document.getElementById('editPostTitleInput');
    const editPostContentInput = document.getElementById('editPostContentInput');
    const editCharCount = document.getElementById('editCharCount');
    const saveEditedPostBtn = document.getElementById('saveEditedPostBtn');

    const MAX_CHARS = 500; // Limite de caracteres para o desabafo
    const API_URL = 'http://localhost:3000/api/posts'; // URL base da sua API de posts

    let currentUserId = localStorage.getItem('virtualHugUserId');

    // Se não houver um userId, gera um e salva no localStorage
    if (!currentUserId) {
        currentUserId = 'user_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('virtualHugUserId', currentUserId);
        console.log('Novo User ID gerado:', currentUserId);
    } else {
        console.log('User ID existente:', currentUserId);
    }

    // --- Funções Auxiliares de UI ---

    // Atualiza o contador de caracteres para qualquer textarea/span
    function updateCharCount(textarea, counterSpan, maxChars) {
        const currentLength = textarea.value.length;
        counterSpan.textContent = `${currentLength}/${maxChars}`;
        counterSpan.style.color = currentLength > maxChars ? 'red' : '#777';
    }

    // --- Lógica do Modal de Criação ---

    openPostModalBtn.addEventListener('click', () => {
        postModal.style.display = 'flex';
        postTitleInput.value = '';
        postContentInput.value = '';
        updateCharCount(postContentInput, charCount, MAX_CHARS);
    });

    closeButton.addEventListener('click', () => {
        postModal.style.display = 'none';
    });

    // Fechar modais clicando fora
    window.addEventListener('click', (event) => {
        if (event.target === postModal) {
            postModal.style.display = 'none';
        }
        if (event.target === editPostModal) {
            editPostModal.style.display = 'none';
        }
    });

    postContentInput.addEventListener('input', () => updateCharCount(postContentInput, charCount, MAX_CHARS));

    publishPostBtn.addEventListener('click', async () => {
        const title = postTitleInput.value.trim();
        const content = postContentInput.value.trim();

        if (content.length > MAX_CHARS) {
            alert(`Seu desabafo excedeu o limite de ${MAX_CHARS} caracteres. Por favor, reduza o texto.`);
            return;
        }

        if (content) {
            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ title, content, userId: currentUserId }), // Envia o userId
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Erro ao publicar desabafo.');
                }

                await response.json(); // Pega a resposta (post recém-criado, se o backend retornar)
                
                // Sucesso: re-renderiza posts e fecha modal
                renderPosts();
                postModal.style.display = 'none';
                postTitleInput.value = '';
                postContentInput.value = '';
            } catch (error) {
                console.error('Erro ao publicar desabafo:', error);
                alert(`Erro ao publicar desabafo: ${error.message}`);
            }
        } else {
            alert('Por favor, escreva seu desabafo antes de publicar!');
        }
    });

    // --- Lógica do Modal de Edição ---

    editPostContentInput.addEventListener('input', () => updateCharCount(editPostContentInput, editCharCount, MAX_CHARS));

    closeEditButton.addEventListener('click', () => {
        editPostModal.style.display = 'none';
    });

    // Função para abrir o modal de edição e preencher com dados do post
    function openEditModal(postId) {
        // Encontra o post localmente (ou poderia fazer outra chamada GET para o backend)
        const currentPosts = Array.from(postsContainer.children).map(card => {
            if (card.dataset.postId === postId) {
                return {
                    id: card.dataset.postId,
                    title: card.querySelector('.post-title').textContent === 'Sem Título' ? '' : card.querySelector('.post-title').textContent,
                    content: card.querySelector('.desabafo-content').textContent,
                    userId: currentUserId // Assumimos que, se o botão de editar apareceu, o userId é o atual
                };
            }
            return null;
        }).filter(Boolean)[0]; // Pega o primeiro post encontrado (deve ser único)

        if (currentPosts) {
            editPostId.value = currentPosts.id;
            editPostTitleInput.value = currentPosts.title;
            editPostContentInput.value = currentPosts.content;
            updateCharCount(editPostContentInput, editCharCount, MAX_CHARS);
            editPostModal.style.display = 'flex';
        } else {
            alert('Erro: Postagem não encontrada para edição.');
        }
    }

    // Função para salvar as edições via API
    saveEditedPostBtn.addEventListener('click', async () => {
        const postId = editPostId.value;
        const newTitle = editPostTitleInput.value.trim();
        const newContent = editPostContentInput.value.trim();

        if (newContent.length > MAX_CHARS) {
            alert(`Seu desabafo excedeu o limite de ${MAX_CHARS} caracteres. Por favor, reduza o texto.`);
            return;
        }

        if (newContent) {
            try {
                const response = await fetch(`${API_URL}/${postId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ title: newTitle, content: newContent, userId: currentUserId }), // Envia o userId
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Erro ao salvar alterações.');
                }

                await response.json();
                renderPosts(); // Re-renderiza todos os posts
                editPostModal.style.display = 'none';
            } catch (error) {
                console.error('Erro ao salvar edições:', error);
                alert(`Erro ao salvar edições: ${error.message}`);
            }
        } else {
            alert('O conteúdo do desabafo não pode ser vazio!');
        }
    });

    // --- Funções de Renderização e Ações de Post ---

    // Função para criar um card de desabafo (com botões de ação e verificação de autoria)
    function createDesabafoCard(post) {
        const desabafoCard = document.createElement('div');
        desabafoCard.classList.add('desabafo-card');
        desabafoCard.dataset.postId = post.id; // Armazena o ID do post
        desabafoCard.dataset.postUserId = post.userId; // Armazena o ID do autor do post

        const postTitle = document.createElement('h3');
        postTitle.classList.add('post-title');
        postTitle.textContent = post.title || 'Sem Título';

        const desabafoContent = document.createElement('p');
        desabafoContent.classList.add('desabafo-content');
        desabafoContent.textContent = post.content;

        const timeStampSpan = document.createElement('span');
        timeStampSpan.classList.add('timestamp');
        timeStampSpan.textContent = new Date(post.timestamp).toLocaleString('pt-BR', { 
            year: 'numeric', 
            month: 'numeric', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        const toggleButton = document.createElement('button');
        toggleButton.classList.add('toggle-content-btn');
        toggleButton.textContent = 'Ver Mais';
        toggleButton.addEventListener('click', () => {
            desabafoCard.classList.toggle('expanded');
            toggleButton.textContent = desabafoCard.classList.contains('expanded') ? 'Ver Menos' : 'Ver Mais';
        });

        desabafoCard.appendChild(postTitle);
        desabafoCard.appendChild(desabafoContent);
        desabafoCard.appendChild(timeStampSpan);
        desabafoCard.appendChild(toggleButton);

        // --- Botões de Ação (Editar/Apagar) com verificação de autoria ---
        const postActionsDiv = document.createElement('div');
        postActionsDiv.classList.add('post-actions');

        // Mostra os botões APENAS se o userId do post for igual ao userId atual do navegador
        if (post.userId === currentUserId) {
            const editButton = document.createElement('button');
            editButton.classList.add('action-btn', 'edit-btn');
            editButton.innerHTML = '<i class="fas fa-edit"></i> Editar';
            editButton.addEventListener('click', () => openEditModal(post.id));

            const deleteButton = document.createElement('button');
            deleteButton.classList.add('action-btn', 'delete-btn');
            deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i> Apagar';
            deleteButton.addEventListener('click', () => deletePost(post.id));

            postActionsDiv.appendChild(editButton);
            postActionsDiv.appendChild(deleteButton);
        }
        // ------------------------------------------------------------------

        desabafoCard.appendChild(postActionsDiv); // Adiciona os botões de ação (ou div vazia se não for autor)
        return desabafoCard;
    }

    // Função para renderizar todos os posts buscando do backend
    async function renderPosts() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error('Erro ao carregar desabafos.');
            }
            const posts = await response.json();
            postsContainer.innerHTML = ''; // Limpa o container

            if (posts.length === 0) {
                noPostsMessage.style.display = 'block';
            } else {
                noPostsMessage.style.display = 'none';
                posts.forEach(post => { // Os posts já vêm ordenados do backend
                    const card = createDesabafoCard(post);
                    postsContainer.appendChild(card);
                });
            }
        } catch (error) {
            console.error('Erro ao buscar desabafos:', error);
            noPostsMessage.textContent = 'Não foi possível carregar os desabafos. Tente novamente mais tarde.';
            noPostsMessage.style.display = 'block';
        }
    }

    // Função para apagar um post via API
    async function deletePost(postId) {
        if (confirm('Tem certeza que deseja apagar este desabafo? Esta ação não pode ser desfeita.')) {
            try {
                const response = await fetch(`${API_URL}/${postId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userId: currentUserId }), // Envia o userId para verificação
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Erro ao apagar desabafo.');
                }

                alert('Desabafo apagado com sucesso!');
                renderPosts(); // Re-renderiza os posts atualizados
            } catch (error) {
                console.error('Erro ao apagar desabafo:', error);
                alert(`Erro ao apagar desabafos: ${error.message}`);
            }
        }
    }

    // Carrega e renderiza os posts ao carregar a página
    renderPosts();
});
