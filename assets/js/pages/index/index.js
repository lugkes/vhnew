document.addEventListener('DOMContentLoaded', () => {
    const latestPostsContainer = document.getElementById('latestPostsContainer');
    const noPostsMessage = document.querySelector('.no-posts-message');

    // Função para carregar desabafos do localStorage e exibir na página inicial
    function loadLatestBlogPosts() {
        const desabafosSalvos = JSON.parse(localStorage.getItem('desabafos')) || [];
        latestPostsContainer.innerHTML = ''; // Limpa o container

        if (desabafosSalvos.length === 0) {
            noPostsMessage.style.display = 'block'; // Mostra a mensagem se não houver posts
            return;
        } else {
            noPostsMessage.style.display = 'none'; // Esconde a mensagem
        }
        
        // Pega os 3 últimos posts (ou menos, se não houver 3)
        // Reverse para os mais recentes virem primeiro, slice para pegar os 3 primeiros
        const latestPosts = desabafosSalvos.slice(-3).reverse(); 

        latestPosts.forEach(post => {
            const blogCard = document.createElement('a'); // Agora é um link
            blogCard.href = 'blog.html'; // Redireciona para a página do blog
            blogCard.classList.add('index-blog-card');
            
            const postTitle = document.createElement('h3');
            postTitle.classList.add('post-title');
            postTitle.textContent = post.title || 'Sem Título';

            const postPreviewContent = document.createElement('p');
            postPreviewContent.classList.add('post-preview-content');
            postPreviewContent.textContent = post.content; // Conteúdo completo para a prévia

            const timeStampSpan = document.createElement('span');
            timeStampSpan.classList.add('timestamp');
            timeStampSpan.textContent = new Date(post.timestamp).toLocaleString('pt-BR', { 
                year: 'numeric', 
                month: 'numeric', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
            });

            blogCard.appendChild(postTitle);
            blogCard.appendChild(postPreviewContent);
            blogCard.appendChild(timeStampSpan);
            
            latestPostsContainer.appendChild(blogCard);
        });
    }

    // Carrega os posts ao carregar a página inicial
    loadLatestBlogPosts();
});
